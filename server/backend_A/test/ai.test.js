import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyFeedback, generateRules, normalizeItem, recommend } from '../ai/index.js';
import { buildFallbackRules } from '../ai/fallback.js';
import { validateRules } from '../ai/validate.js';

const answers = {
  foods: ['한식', '분식'],
  budget: 'mid',
  radiusKm: 2,
  allergies: ['seafood'],
};

const catalog = [
  { id: 'a', title: '국밥', tags: ['한식', 'comfort', 'delivery'], price: 1, type: 'food' },
  { id: 'b', title: '떡볶이', tags: ['분식', 'delivery'], price: 1, type: 'food' },
  { id: 'c', title: '파스타', tags: ['양식', 'outdoor'], price: 2, type: 'food' },
  { id: 'd', title: '비빔밥', tags: ['한식', 'light'], price: 2, type: 'food' },
  { id: 'e', title: '초밥', tags: ['일식', 'seafood'], price: 2, type: 'food' },
  { id: 'f', title: '코스요리', tags: ['양식'], price: 3, type: 'food' },
];

const noRandom = () => 0;

test('폴백 규칙은 검증기를 통과한다', () => {
  assert.deepEqual(validateRules(buildFallbackRules(answers), answers), []);
});

test('검증기는 금지 태그·0 delta·알레르기 누락을 잡는다', () => {
  const rules = buildFallbackRules(answers);
  rules.weights.always['tag.없는태그'] = 1;
  rules.weights.always['tag.light'] = 0;
  rules.hard.exclude_tags = [];
  const errors = validateRules(rules, answers).join('\n');
  assert.match(errors, /없는태그/);
  assert.match(errors, /delta/);
  assert.match(errors, /알레르기 누락: seafood/);
});

test('generateRules: 실패 시 1회 재시도 후 폴백', async () => {
  let calls = 0;
  const rules = await generateRules({ ...answers, radiusKm: 91 }, {
    run: async () => { calls += 1; throw new Error('토큰 고갈'); },
  });
  assert.equal(calls, 2);
  assert.equal(rules.meta.source, 'fallback');
});

test('generateRules: 같은 답변은 키 순서가 달라도 캐시를 쓴다', async () => {
  let calls = 0;
  const run = async () => { calls += 1; return buildFallbackRules(answers); };
  await generateRules({ budget: 'mid', allergies: ['seafood'], radiusKm: 92 }, { run });
  const again = await generateRules({ radiusKm: 92, allergies: ['seafood'], budget: 'mid' }, { run });
  assert.equal(calls, 1);
  assert.equal(again.meta.source, 'codex');
});

test('recommend: 알레르기·가격 상한을 지키고 최대 3개를 돌려준다', () => {
  const rules = buildFallbackRules(answers);
  const result = recommend({ rules, context: {}, catalog, random: noRandom });
  const ids = result.map((r) => r.item.id);
  assert.equal(result.length, 3);
  assert.ok(!ids.includes('e'), '알레르기 태그 제외');
  assert.ok(!ids.includes('f'), '가격 상한 제외');
  assert.ok(result.every((r) => r.reason));
});

test('recommend: 알레르기 항목은 후보가 부족해도 다시 넣지 않는다', () => {
  const rules = buildFallbackRules(answers);
  const result = recommend({ rules, context: {}, catalog: [catalog[4]], random: noRandom });
  assert.deepEqual(result, []);
});

test('recommend: 상황 키가 점수에 반영되고 excludeIds 를 뺀다', () => {
  const rules = buildFallbackRules(answers);
  const rainy = recommend({ rules, context: { weather: 'rain' }, catalog, random: noRandom });
  assert.notEqual(rainy[0].item.id, 'c');
  const excluded = recommend({ rules, context: {}, catalog, excludeIds: ['a', 'b'], random: noRandom });
  assert.ok(excluded.every((r) => !['a', 'b'].includes(r.item.id)));
});

test('recommend: cheaper 리파인은 싼 항목을 앞세운다', () => {
  const rules = buildFallbackRules(answers);
  const [top] = recommend({ rules, context: {}, catalog, refine: 'cheaper', random: noRandom });
  assert.equal(top.item.price, 1);
});

test('applyFeedback: 입력을 바꾸지 않고 태그 가중치를 조정한다', () => {
  const rules = buildFallbackRules(answers);
  const before = rules.weights.always['tag.comfort'];
  const next = applyFeedback(rules, catalog[0], 'good');
  assert.equal(next.weights.always['tag.comfort'], before + 0.2);
  assert.equal(rules.weights.always['tag.comfort'], before);
  assert.deepEqual(applyFeedback(rules, catalog[0], 'soso').weights, rules.weights);
});

test('normalizeItem: data.js 형식을 엔진 형식으로 바꾼다', () => {
  const item = normalizeItem({ id: 'x', tags: ['한식'], budget: '저렴', modes: ['배달'] }, 'eat');
  assert.equal(item.type, 'food');
  assert.equal(item.price, 1);
  assert.deepEqual(item.tags, ['한식', 'delivery']);
});
