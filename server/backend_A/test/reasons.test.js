import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATALOG } from '../../../data.js';
import { normalizeItem, recommend } from '../ai/index.js';
import { buildFallbackRules } from '../ai/fallback.js';

const noRandom = () => 0;

function rulesWithSingleReason() {
  const rules = buildFallbackRules({ budget: 'high' });
  rules.weights.always = { 'tag.indoor': 3 };
  rules.reasons = { 'tag.indoor': '실내에서 편하게 보낼 수 있어요' };
  return rules;
}

const indoorItem = (id, reason) => ({ id, title: id, tags: ['indoor'], price: 1, type: 'do', reason });

test('후보 3개가 같은 규칙 이유를 공유하면 둘째부터 항목 고유 문구로 대체한다', () => {
  const catalog = [indoorItem('a', '이유 A'), indoorItem('b', '이유 B'), indoorItem('c', '이유 C')];
  const result = recommend({ rules: rulesWithSingleReason(), context: {}, catalog, random: noRandom });
  assert.deepEqual(result.map((r) => r.reason), ['실내에서 편하게 보낼 수 있어요', '이유 B', '이유 C']);
});

test('대체할 문구가 없으면 중복을 허용하되 기본 문구보다 규칙 이유를 우선한다', () => {
  const catalog = [indoorItem('a'), indoorItem('b')];
  const result = recommend({ rules: rulesWithSingleReason(), context: {}, catalog, random: noRandom });
  assert.deepEqual(result.map((r) => r.reason), ['실내에서 편하게 보낼 수 있어요', '실내에서 편하게 보낼 수 있어요']);
});

test('이유 근거가 전혀 없는 항목은 기본 문구를 쓴다', () => {
  const rules = rulesWithSingleReason();
  const [only] = recommend({ rules, context: {}, catalog: [{ id: 'x', title: 'x', tags: [], price: 1, type: 'do' }], random: noRandom });
  assert.equal(only.reason, '오늘 상황에 잘 어울려요');
});

test('실제 카탈로그에서 주요 상황의 후보 3개 이유가 서로 다르다', () => {
  const rules = buildFallbackRules({ budget: 'high', foods: ['한식'] });
  const cases = [
    ['do', { mood: 'tired' }], ['do', { mood: 'tired', mode: 'home' }], ['do', { weather: 'rain' }],
    ['eat', { mood: 'tired', mode: 'delivery' }], ['eat', { mood: 'sad' }],
    ['wear', { mode: 'home' }], ['wear', { mood: 'good', mode: 'out' }],
  ];
  for (const [category, context] of cases) {
    const catalog = CATALOG[category].map((item) => normalizeItem(item, category));
    const reasons = recommend({ rules, context, catalog, random: noRandom }).map((r) => r.reason);
    assert.equal(new Set(reasons).size, reasons.length, `${category} ${JSON.stringify(context)}: ${reasons.join(' | ')}`);
  }
});
