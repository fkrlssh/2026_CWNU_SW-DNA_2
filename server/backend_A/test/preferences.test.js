import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATALOG } from '../../../data.js';
import { normalizeItem, recommend } from '../ai/index.js';
import { ITEM_ATTRIBUTES } from '../ai/attributes.js';
import { TAGS } from '../ai/contract.js';
import { buildFallbackRules } from '../ai/fallback.js';
import {
  ATTRIBUTE_TAGS, PREFERENCE_DIMENSIONS, PREFERENCE_SCALE,
  applyPreferences, preferenceSchema, preferenceWeights, sanitizePreferences,
} from '../ai/preferences.js';

const noRandom = () => 0;
const catalogOf = (category) => CATALOG[category].map((item) => normalizeItem(item, category));
const top = (category, preferences, context = {}) => {
  const rules = applyPreferences(buildFallbackRules({ budget: 'high' }), preferences);
  return recommend({ rules, context, catalog: catalogOf(category), random: noRandom }).map((r) => r.item);
};

test('취향 축의 태그는 모두 허용 태그이고 축 키는 카테고리를 통틀어 겹치지 않는다', () => {
  const keys = Object.values(PREFERENCE_DIMENSIONS).flat().map((d) => d.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const dimension of Object.values(PREFERENCE_DIMENSIONS).flat()) {
    for (const side of [dimension.low, dimension.high]) assert.ok(TAGS.includes(side.tag), `${dimension.key}: ${side.tag} 가 TAGS 에 없음`);
    assert.notEqual(dimension.low.tag, dimension.high.tag);
  }
  for (const tag of ATTRIBUTE_TAGS) assert.ok(TAGS.includes(tag));
});

test('모든 카탈로그 항목에 속성 태그가 있고, 한 축의 양쪽을 동시에 갖지 않는다', () => {
  for (const [category, items] of Object.entries(CATALOG)) {
    for (const item of items) {
      const attributes = item.attributes ?? ITEM_ATTRIBUTES[item.id];
      assert.ok(Array.isArray(attributes) && attributes.length >= 2, `${item.id}: 속성 태그 없음`);
      for (const dimension of PREFERENCE_DIMENSIONS[category]) {
        assert.ok(!(attributes.includes(dimension.low.tag) && attributes.includes(dimension.high.tag)), `${item.id}: ${dimension.key} 양쪽 모두`);
      }
      const normalized = normalizeItem(item, category);
      for (const tag of attributes) assert.ok(normalized.tags.includes(tag), `${item.id}: ${tag} 가 tags 에 합쳐지지 않음`);
    }
  }
});

test('sanitizePreferences: 모르는 축·0·범위 밖 값을 정리한다', () => {
  assert.deepEqual(sanitizePreferences({ spicy: 2, temperature: 0, unknown: 1, formality: '3', energy: -1.3 }), { spicy: 2, formality: 2, energy: -1.5 });
  assert.deepEqual(sanitizePreferences(null), {});
  assert.deepEqual(sanitizePreferences([1, 2]), {});
});

test('preferenceWeights: +값은 high 태그에 +, low 태그에 - 가중치', () => {
  assert.deepEqual(preferenceWeights({ spicy: 2, place: -1 }), {
    'tag.매운': 2 * PREFERENCE_SCALE, 'tag.순한': -2 * PREFERENCE_SCALE,
    'tag.outdoor': -1 * PREFERENCE_SCALE, 'tag.indoor': 1 * PREFERENCE_SCALE,
  });
});

test('applyPreferences: 원본 규칙을 바꾸지 않고 always 에 더하며 이유 문구를 채운다', () => {
  const rules = buildFallbackRules({ budget: 'high' });
  const before = structuredClone(rules);
  const applied = applyPreferences(rules, { sweetness: 2 });
  assert.deepEqual(rules, before);
  assert.equal(applied.weights.always['tag.달콤한'], 2.5);
  assert.equal(applied.weights.always['tag.짭짤한'], -2.5);
  assert.ok(applied.reasons['tag.달콤한']);
  assert.equal(applyPreferences(rules, {}), rules, '값이 없으면 그대로');
});

test('매운맛 +2 면 매운 음식이, -2 면 순한 음식이 앞선다', () => {
  const hot = top('eat', { spicy: 2 });
  assert.ok(hot.every((item) => item.tags.includes('매운')), hot.map((i) => i.id).join(','));
  const mild = top('eat', { spicy: -2 });
  assert.ok(mild.every((item) => item.tags.includes('순한')), mild.map((i) => i.id).join(','));
});

test('옷은 격식·두께, 활동은 동행·활동량 슬라이더가 결과를 바꾼다', () => {
  const formal = top('wear', { formality: 2, thickness: -2 });
  assert.ok(formal.every((item) => item.tags.includes('격식 있는') && item.tags.includes('얇은')), formal.map((i) => i.id).join(','));
  const together = top('do', { company: 2, energy: 2 });
  assert.ok(together.every((item) => item.tags.includes('group') && item.tags.includes('활동적인')), together.map((i) => i.id).join(','));
  const quietSolo = top('do', { company: -2, energy: -2, place: -2 });
  assert.ok(quietSolo.every((item) => item.tags.includes('solo') && item.tags.includes('정적인')), quietSolo.map((i) => i.id).join(','));
});

test('슬라이더는 알레르기 같은 하드 필터를 이기지 못한다', () => {
  const rules = applyPreferences(buildFallbackRules({ budget: 'high', allergies: ['해산물'] }), { temperature: -2, heaviness: -2 });
  const picked = recommend({ rules, context: {}, catalog: catalogOf('eat'), random: noRandom }).map((r) => r.item.id);
  for (const id of ['sushi', 'sashimi', 'poke']) assert.ok(!picked.includes(id), id);
});

test('preferenceSchema: 프론트가 슬라이더를 그릴 정보를 담는다', () => {
  const schema = preferenceSchema();
  assert.deepEqual([schema.min, schema.max, schema.step], [-2, 2, 0.5]);
  assert.deepEqual(Object.keys(schema.dimensions), ['eat', 'wear', 'do']);
  for (const dimension of schema.dimensions.eat) for (const field of ['key', 'label', 'low', 'high']) assert.ok(dimension[field]);
});
