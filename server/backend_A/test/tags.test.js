import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATALOG } from '../../../data.js';
import { TAGS } from '../ai/contract.js';
import { buildFallbackRules } from '../ai/fallback.js';

// 프론트 js/data.js ONBOARDING_STEPS 의 칩. 바뀌면 여기와 contract.js TAGS 를 같이 고친다.
const ONBOARDING_CHIPS = {
  food: ['한식', '중식', '일식', '양식', '분식', '샐러드', '디저트'],
  style: ['캐주얼', '미니멀', '스트릿', '포멀', '스포티', '러블리', '편한 옷'],
  activity: ['집콕', '산책', '운동', '카페', '문화생활', '쇼핑', '요리'],
};
const allChips = Object.values(ONBOARDING_CHIPS).flat();
const catalogTags = new Set(Object.values(CATALOG).flat().flatMap((item) => item.tags));

test('온보딩 칩이 모두 허용 태그에 있다', () => {
  for (const chip of allChips) assert.ok(TAGS.includes(chip), `TAGS 에 없음: ${chip}`);
});

test('온보딩 칩마다 카탈로그에 해당 태그 항목이 하나 이상 있다', () => {
  for (const chip of allChips) assert.ok(catalogTags.has(chip), `카탈로그에 ${chip} 태그 항목 없음`);
});

test('폴백 규칙이 새 칩 취향을 버리지 않는다', () => {
  const rules = buildFallbackRules({ foods: ['샐러드'], styles: ['편한 옷'], activities: ['카페', '쇼핑'] });
  for (const tag of ['샐러드', '편한 옷', '카페', '쇼핑']) assert.equal(rules.weights.always[`tag.${tag}`], 2, tag);
});
