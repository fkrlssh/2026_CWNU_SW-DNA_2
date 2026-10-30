import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATALOG } from '../../../data.js';
import { normalizeItem, recommend } from '../ai/index.js';
import { ITEM_ATTRIBUTES } from '../ai/attributes.js';
import { TAGS } from '../ai/contract.js';
import { buildFallbackRules } from '../ai/fallback.js';
import { TASTE_DISLIKE_WEIGHT, TASTE_GROUPS, TASTE_LIKE_WEIGHT, applyPreferences, preferenceSchema, sanitizeTastes, tasteWeights } from '../ai/preferences.js';

const noRandom = () => 0;
const catalogOf = (category) => CATALOG[category].map((item) => normalizeItem(item, category));
const top = (category, tastes, context = {}) => {
  const rules = applyPreferences(buildFallbackRules({ budget: 'high' }), {}, tastes);
  return recommend({ rules, context, catalog: catalogOf(category), random: noRandom }).map((r) => r.item);
};
const allOptions = Object.values(TASTE_GROUPS).flat().flatMap((group) => group.options);

test('취향 그룹의 태그는 모두 허용 태그이고 카테고리를 통틀어 겹치지 않는다', () => {
  const tags = allOptions.map((option) => option.tag);
  assert.equal(new Set(tags).size, tags.length, '태그 중복');
  for (const tag of tags) assert.ok(TAGS.includes(tag), `${tag} 가 TAGS 에 없음`);
  assert.equal(new Set(TAGS).size, TAGS.length, 'TAGS 에 중복이 있다');
});

test('그룹 옵션마다 해당 카테고리에 항목이 2개 이상 있다 (고르면 효과가 있어야 한다)', () => {
  for (const [category, groups] of Object.entries(TASTE_GROUPS)) {
    const catalog = catalogOf(category);
    for (const group of groups) {
      for (const option of group.options) {
        const count = catalog.filter((item) => item.tags.includes(option.tag)).length;
        assert.ok(count >= 2, `${category} ${group.label}/${option.label}(${option.tag}): 항목 ${count}개`);
      }
    }
  }
});

test('주요 그룹은 모든 항목이 하나 이상 가진다 (음식 형태, 옷 재질·색·핏, 활동 계열·장소)', () => {
  const required = { eat: ['form'], wear: ['material', 'color', 'fit'], do: ['kind', 'place'] };
  for (const [category, keys] of Object.entries(required)) {
    for (const item of CATALOG[category]) {
      const attributes = item.attributes ?? ITEM_ATTRIBUTES[item.id] ?? [];
      for (const key of keys) {
        const group = TASTE_GROUPS[category].find((g) => g.key === key);
        assert.ok(group.options.some((option) => attributes.includes(option.tag)), `${item.id}: ${group.label} 태그 없음`);
      }
    }
  }
  // 디저트는 형태가 없을 수 있어 예외를 둔다
}, { skip: false });

test('sanitizeTastes: 모르는 태그를 버리고 좋아요·싫어요가 겹치면 싫어요가 이긴다', () => {
  assert.deepEqual(sanitizeTastes({ like: ['밥', '없는태그', '면요리'], dislike: ['면요리'] }), { like: ['밥'], dislike: ['면요리'] });
  assert.deepEqual(sanitizeTastes(null), { like: [], dislike: [] });
  assert.deepEqual(tasteWeights({ like: ['니트'], dislike: ['블랙'] }), { 'tag.니트': TASTE_LIKE_WEIGHT, 'tag.블랙': TASTE_DISLIKE_WEIGHT });
});

test('음식: 면·국물을 좋아하면 면 요리가, 튀김을 싫어하면 튀김이 뒤로 밀린다', () => {
  const noodles = top('eat', { like: ['면요리', '국물'] });
  assert.ok(noodles.every((item) => item.tags.includes('면요리')), noodles.map((i) => i.id).join(','));
  const noFried = top('eat', { like: ['고기'], dislike: ['튀김'] });
  assert.ok(noFried.every((item) => !item.tags.includes('튀김')), noFried.map((i) => i.id).join(','));
});

test('옷: 니트·베이지를 좋아하면 그 조합이, 활동: 감상·실내시설을 좋아하면 영화관·전시가 앞선다', () => {
  const knit = top('wear', { like: ['니트', '베이지'] });
  assert.ok(knit.every((item) => item.tags.includes('니트')), knit.map((i) => i.id).join(','));
  const watch = top('do', { like: ['감상', '실내시설'] });
  assert.ok(watch.every((item) => item.tags.includes('감상')), watch.map((i) => i.id).join(','));
});

test('음식의 면(麵)과 옷의 면(綿)은 내부 태그가 달라 서로 영향을 주지 않는다', () => {
  const rules = applyPreferences(buildFallbackRules({ budget: 'high' }), {}, { like: ['면요리'] });
  assert.ok(!('tag.면소재' in rules.weights.always));
  assert.ok(!('tag.면' in rules.weights.always));
});

test('싫어요는 감점일 뿐 하드 필터가 아니라, 후보가 그것뿐이면 그래도 나온다', () => {
  const onlyFried = catalogOf('eat').filter((item) => item.tags.includes('튀김'));
  const rules = applyPreferences(buildFallbackRules({ budget: 'high' }), {}, { dislike: ['튀김'] });
  assert.equal(recommend({ rules, context: {}, catalog: onlyFried, random: noRandom }).length, 3);
});

test('카드 이유에 칩 취향이 드러난다 ("면 취향에 맞췄어요")', () => {
  const rules = applyPreferences(buildFallbackRules({ budget: 'high' }), {}, { like: ['면요리'] });
  assert.equal(rules.reasons['tag.면요리'], '면 취향에 맞췄어요');
});

test('요청 시점의 범주(prefer/avoid)는 프로필 칩보다 세게 반영되고 축 태그도 고를 수 있다', () => {
  const base = buildFallbackRules({ budget: 'high' });
  const rules = applyPreferences(base, {}, { like: ['고기'] }, { prefer: ['면요리', '매운'], avoid: ['튀김', '없는태그'] });
  assert.equal(rules.weights.always['tag.면요리'], 3);
  assert.equal(rules.weights.always['tag.매운'], 3, '축의 한쪽 태그도 요청 범주로 쓸 수 있다');
  assert.equal(rules.weights.always['tag.튀김'], -3);
  assert.ok(!('tag.없는태그' in rules.weights.always));
  const picked = recommend({ rules, context: {}, catalog: catalogOf('eat'), random: noRandom }).map((r) => r.item);
  assert.ok(picked.every((item) => item.tags.includes('면요리') || item.tags.includes('매운')), picked.map((i) => i.id).join(','));
  assert.ok(picked[0].tags.includes('면요리') && picked[0].tags.includes('매운'), '둘 다 맞는 항목(매운 면)이 1순위');
  assert.ok(picked.every((item) => !item.tags.includes('튀김')));
});

test('스키마에 그룹과 가중치가 포함된다', () => {
  const schema = preferenceSchema();
  assert.deepEqual(Object.keys(schema.groups), ['eat', 'wear', 'do']);
  assert.equal(schema.likeWeight, TASTE_LIKE_WEIGHT);
  assert.ok(schema.groups.wear.some((group) => group.key === 'outer' && group.options.length === 5));
});
