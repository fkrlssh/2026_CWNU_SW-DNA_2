import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATALOG } from '../../../data.js';
import { normalizeItem, recommend } from '../ai/index.js';
import { ITEM_ALLERGENS, normalizeExclusions } from '../ai/allergens.js';
import { buildFallbackRules } from '../ai/fallback.js';

const eat = CATALOG.eat.map((item) => normalizeItem(item, 'eat'));

function recommendedIds(allergies, catalog = eat) {
  const rules = buildFallbackRules({ budget: 'high', allergies });
  return recommend({ rules, context: {}, catalog, random: () => 0 }).map((r) => r.item.id);
}

test('한국어 알레르기 입력을 태그로 바꾸고 모르는 항목은 유지한다', () => {
  assert.deepEqual(normalizeExclusions(['해산물', '새우, 땅콩', '복숭아']), ['seafood', 'peanut', '복숭아']);
});

test('data.js 의 음식은 모두 알레르기 정보를 가진다', () => {
  for (const item of CATALOG.eat) assert.ok(ITEM_ALLERGENS[item.id], `${item.id} 알레르기 정보 없음`);
});

test('해산물 알레르기면 실제 카탈로그에서 해산물 메뉴가 빠진다', () => {
  const ids = recommendedIds(['해산물']);
  for (const id of ['sushi', 'gimbap', 'udon', 'tteokbokki', 'soup-rice']) assert.ok(!ids.includes(id), id);
  assert.ok(ids.length > 0);
});

test('재료 정보가 없는 음식은 알레르기 사용자에게 추천하지 않는다', () => {
  const unknown = normalizeItem({ id: 'new-menu', title: '새 메뉴', tags: [], budget: '저렴' }, 'eat');
  assert.deepEqual(recommendedIds(['땅콩'], [unknown]), []);
  assert.deepEqual(recommendedIds([], [unknown]), ['new-menu']);
});

test('사전에 없는 기피 항목은 상품명으로 거른다', () => {
  assert.ok(!recommendedIds(['파스타']).includes('pasta'));
});

test('이미 저장된 규칙의 한국어 항목도 추천 시점에 적용한다', () => {
  const rules = buildFallbackRules({ budget: 'high' });
  rules.hard.exclude_tags = ['해산물'];
  const ids = recommend({ rules, context: {}, catalog: eat, random: () => 0 }).map((r) => r.item.id);
  assert.ok(!ids.includes('sushi'));
});
