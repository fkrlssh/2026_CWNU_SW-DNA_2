import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATALOG } from '../../../data.js';
import { normalizeItem, recommend } from '../ai/index.js';
import { applyPreferences, PREFERENCE_DIMENSIONS } from '../ai/preferences.js';
import { QUIZ_OPTIONS, QUIZ_ROUNDS, buildQuiz, focusPlan, scoreQuiz } from '../ai/quiz.js';

let seed = 7;
const random = () => { seed = (seed * 48271) % 2147483647; return seed / 2147483647; };
const catalogOf = (category) => CATALOG[category].map((item) => normalizeItem(item, category));
const byId = (category) => new Map(catalogOf(category).map((item) => [item.id, item]));

test('초점 축 계획: 음식은 5축 각 1회, 옷·활동은 4축 + 첫 축 한 번 더', () => {
  assert.deepEqual(focusPlan('eat').map((d) => d.key), ['spicy', 'temperature', 'heaviness', 'flavor', 'sweetness']);
  assert.deepEqual(focusPlan('wear').map((d) => d.key), ['formality', 'thickness', 'brightness', 'flashiness', 'formality']);
  assert.deepEqual(focusPlan('do').map((d) => d.key), ['place', 'energy', 'company', 'cost', 'place']);
});

test('buildQuiz: 5라운드 × 3보기, 라운드 간 중복 없음, 초점 축의 양쪽이 보기에 모두 있다', () => {
  for (const category of ['eat', 'wear', 'do']) {
    const quiz = buildQuiz({ category, catalog: catalogOf(category), random });
    assert.equal(quiz.rounds.length, QUIZ_ROUNDS, category);
    const seen = new Set();
    const items = byId(category);
    const dims = Object.fromEntries(PREFERENCE_DIMENSIONS[category].map((d) => [d.key, d]));
    for (const round of quiz.rounds) {
      assert.equal(round.options.length, QUIZ_OPTIONS, `${category} ${round.round}라운드 보기 수`);
      for (const option of round.options) {
        assert.ok(!seen.has(option.itemId), `${category}: ${option.itemId} 중복`);
        seen.add(option.itemId);
        assert.ok(option.title && option.emoji, '보기에는 제목과 이모지가 있다');
      }
      const focus = dims[round.focus];
      const tags = round.options.flatMap((o) => items.get(o.itemId).tags);
      assert.ok(tags.includes(focus.low.tag) && tags.includes(focus.high.tag), `${category} ${round.focus}: 양쪽이 모두 보기에 있어야 한다`);
    }
  }
});

test('buildQuiz: 하드 필터를 통과한 카탈로그만 넘기면 보기에 그 항목만 나온다', () => {
  const noSeafood = catalogOf('eat').filter((item) => !item.allergens.includes('seafood'));
  const quiz = buildQuiz({ category: 'eat', catalog: noSeafood, random });
  const allowed = new Set(noSeafood.map((item) => item.id));
  for (const round of quiz.rounds) for (const option of round.options) assert.ok(allowed.has(option.itemId), option.itemId);
});

test('scoreQuiz: 매운 것만 고르면 매운맛 +2, 버린 항목과 갈리는 다른 축도 같이 측정된다', () => {
  const catalog = catalogOf('eat');
  const items = byId('eat');
  const quiz = buildQuiz({ category: 'eat', catalog, random });
  const answers = quiz.rounds.map((round) => {
    const spicy = round.options.find((o) => items.get(o.itemId).tags.includes('매운'));
    return { options: round.options.map((o) => o.itemId), pick: spicy ? spicy.itemId : null };
  });
  const { measured, evidence } = scoreQuiz({ category: 'eat', catalog, answers });
  assert.equal(measured.spicy, 2, JSON.stringify(evidence.spicy));
  assert.ok(Object.keys(measured).length >= 2, '한 라운드의 3보기는 여러 축을 동시에 측정한다');
});

test('scoreQuiz: 엇갈린 선택은 0 에 가깝고, 증거가 한 번뿐이면 ±1 까지만', () => {
  const catalog = catalogOf('eat');
  const hot = catalog.find((i) => i.id === 'kimchi-stew');
  const mild = catalog.find((i) => i.id === 'gukbap');
  const mixed = scoreQuiz({ category: 'eat', catalog, answers: [
    { options: [hot.id, mild.id], pick: hot.id },
    { options: [hot.id, mild.id], pick: mild.id },
  ] });
  assert.ok(!('spicy' in mixed.measured), '같은 쌍에서 반대로 고르면 매운맛은 측정 안 됨');
  const once = scoreQuiz({ category: 'eat', catalog, answers: [{ options: [hot.id, mild.id], pick: hot.id }] });
  assert.equal(once.measured.spicy, 1, '한 번의 비교는 ±1 상한');
});

test('scoreQuiz: 건너뛴 라운드와 모르는 항목은 무시한다', () => {
  const catalog = catalogOf('do');
  const { measured } = scoreQuiz({ category: 'do', catalog, answers: [
    { options: ['walk', 'home-tea', 'cinema'], pick: null },
    { options: ['walk', 'home-tea', 'cinema'], pick: 'nope' },
  ] });
  assert.deepEqual(measured, {});
});

test('퀴즈 결과를 덮씌우면 추천이 바뀐다 (혼자·조용·실내만 고른 경우)', () => {
  const catalog = catalogOf('do');
  const items = byId('do');
  const quiz = buildQuiz({ category: 'do', catalog, random });
  const answers = quiz.rounds.map((round) => {
    const quietSolo = round.options.find((o) => { const t = items.get(o.itemId).tags; return t.includes('solo') && t.includes('정적인'); });
    return { options: round.options.map((o) => o.itemId), pick: (quietSolo ?? round.options[0]).itemId };
  });
  const { measured } = scoreQuiz({ category: 'do', catalog, answers });
  const rules = applyPreferences({ version: 1, persona: '', weights: { always: {} }, hard: { exclude_tags: [], exclude_types: [], max_price_level: 3, radius_km: 3 }, novelty: 0, reasons: {} }, measured);
  const picked = recommend({ rules, context: {}, catalog, random: () => 0 }).map((r) => r.item);
  assert.ok(picked.every((item) => item.tags.includes('solo')), picked.map((i) => i.id).join(','));
});
