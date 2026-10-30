import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATALOG } from '../../../data.js';
import { normalizeItem, recommend } from '../ai/index.js';
import { TAGS } from '../ai/contract.js';
import { buildFallbackRules } from '../ai/fallback.js';

const MOODS = new Set(['좋음', '피곤', '우울']);
const BUDGETS = new Set(['저렴', '보통', '여유']);
const MODES = {
  eat: new Set(['배달', '외식', '집밥']),
  wear: new Set(['출근·약속', '편한 외출', '집콕']),
  do: new Set(['집콕', '가벼운 외출', '문화생활']),
};
const COLORS = new Set(['blue', 'coral', 'cream', 'dark', 'green', 'lavender', 'lime', 'mint', 'orange', 'peach', 'pink', 'red', 'sky', 'yellow']);
const MIN_PER_CATEGORY = 25;

test('카탈로그는 카테고리마다 충분히 많고 id 가 겹치지 않는다', () => {
  const ids = new Set();
  for (const [category, items] of Object.entries(CATALOG)) {
    assert.ok(items.length >= MIN_PER_CATEGORY, `${category} 항목 ${items.length}개 (최소 ${MIN_PER_CATEGORY})`);
    for (const item of items) {
      assert.ok(!ids.has(item.id), `id 중복: ${item.id}`);
      ids.add(item.id);
    }
  }
});

test('모든 항목의 필드 값이 엔진이 아는 범위 안에 있다', () => {
  for (const [category, items] of Object.entries(CATALOG)) {
    for (const item of items) {
      const where = `${category}/${item.id}`;
      for (const field of ['title', 'emoji', 'scene', 'reason']) assert.ok(item[field], `${where}: ${field} 없음`);
      assert.ok(item.tags.length > 0 && item.tags.every((tag) => TAGS.includes(tag)), `${where}: 허용되지 않은 태그 ${item.tags}`);
      assert.ok(BUDGETS.has(item.budget), `${where}: budget ${item.budget}`);
      assert.ok(Number.isInteger(item.minutes) && item.minutes > 0, `${where}: minutes ${item.minutes}`);
      assert.ok(item.moods.length > 0 && item.moods.every((mood) => MOODS.has(mood)), `${where}: moods ${item.moods}`);
      assert.ok(item.modes.length > 0 && item.modes.every((mode) => MODES[category].has(mode)), `${where}: modes ${item.modes}`);
      assert.ok(COLORS.has(item.color), `${where}: color ${item.color} 는 styles.css 의 tone 이 아님`);
      assert.ok(item.reason.length <= 40, `${where}: reason 이 40자를 넘음`);
    }
  }
});

test('음식 항목은 모두 알레르기 정보를 가지며 해산물 알레르기에도 후보가 넉넉하다', () => {
  for (const item of CATALOG.eat) assert.ok(Array.isArray(item.allergens), `${item.id}: allergens 없음`);
  const catalog = CATALOG.eat.map((item) => normalizeItem(item, 'eat'));
  const rules = buildFallbackRules({ budget: 'high', allergies: ['해산물'] });
  const first = recommend({ rules, context: {}, catalog, random: () => 0 });
  const second = recommend({ rules, context: {}, catalog, excludeIds: first.map((r) => r.item.id), random: () => 0 });
  const third = recommend({ rules, context: {}, catalog, excludeIds: [...first, ...second].map((r) => r.item.id), random: () => 0 });
  assert.equal(first.length + second.length + third.length, 9, '해산물을 빼도 세 번 연속 새 추천 3개가 나온다');
});

test('같은 상황에서 "새로 추천"을 세 번 눌러도 매번 새 후보 3개가 나온다', () => {
  for (const category of ['eat', 'wear', 'do']) {
    const catalog = CATALOG[category].map((item) => normalizeItem(item, category));
    const rules = buildFallbackRules({ budget: 'mid' });
    const context = { mood: 'tired', time: '60' };
    let excludeIds = [];
    for (let round = 0; round < 3; round += 1) {
      const picked = recommend({ rules, context, catalog, excludeIds, random: () => 0 });
      assert.equal(picked.length, 3, `${category} ${round + 1}번째 추천`);
      excludeIds = [...excludeIds, ...picked.map((r) => r.item.id)];
    }
  }
});
