import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATALOG } from '../../../data.js';
import { normalizeItem, recommend } from '../ai/index.js';
import { TAGS } from '../ai/contract.js';
import { buildFallbackRules } from '../ai/fallback.js';

const rules = buildFallbackRules({ budget: 'high' });
const doItems = CATALOG.do.map((item) => normalizeItem(item, 'do'));
const wearItems = CATALOG.wear.map((item) => normalizeItem(item, 'wear'));
const pick = (catalog, context) => recommend({ rules, context, catalog, random: () => 0 }).map((r) => r.item);
const ids = (items) => items.map((item) => `${item.id}:${item.minutes}`).join(', ');
const bare = (id, overrides) => normalizeItem({ id, tags: [], budget: '보통', minutes: 20, moods: [], modes: [], ...overrides }, 'do');

test('normalizeItem: 시간·기분·방식 키와 light·comfort 태그를 도출한다', () => {
  const item = normalizeItem({ id: 'x', tags: [], budget: '보통', minutes: 10, moods: ['피곤', '우울'], modes: ['배달', '집밥'] }, 'eat');
  assert.deepEqual(item.moodKeys, ['tired', 'sad']);
  assert.deepEqual(item.modeKeys, ['delivery', 'home']);
  assert.ok(item.tags.includes('light'));
  assert.ok(item.tags.includes('comfort'));
  const long = normalizeItem({ id: 'y', tags: [], budget: '보통', minutes: 120, moods: ['좋음'], modes: [] }, 'do');
  assert.ok(!long.tags.includes('light'));
  assert.ok(!long.tags.includes('comfort'));
});

test('10분이면 실제 카탈로그에서 오래 걸리는 활동이 빠진다', () => {
  const picked = pick(doItems, { time: '10' });
  assert.ok(picked.every((item) => item.minutes <= 20), ids(picked));
});

test('반나절이면 긴 활동이 앞선다', () => {
  const picked = pick(doItems, { time: '180' });
  assert.ok(picked.some((item) => item.minutes > 30), ids(picked));
});

test('방식이 맞지 않는 항목은 뒤로 밀린다', () => {
  const out = pick(wearItems, { mode: 'out' });
  assert.ok(!out.some((item) => item.id === 'homewear'), ids(out));
  const home = pick(wearItems, { mode: 'home' });
  assert.ok(home.every((item) => item.modeKeys.includes('home')), ids(home));
});

test('기분이 맞는 항목에 가산점을 준다', () => {
  const good = bare('good', { moods: ['좋음'] });
  const tired = bare('tired', { moods: ['피곤'] });
  assert.equal(pick([good, tired], { mood: 'tired' })[0].id, 'tired');
  assert.equal(pick([good, tired], { mood: 'good' })[0].id, 'good');
});

test('오늘 예산과 가까운 가격대가 앞선다', () => {
  const cheap = bare('cheap', { budget: '저렴' });
  const pricey = bare('pricey', { budget: '여유' });
  assert.equal(pick([cheap, pricey], { budget: 'low' })[0].id, 'cheap');
  assert.equal(pick([cheap, pricey], { budget: 'high' })[0].id, 'pricey');
});

test('조건 필드가 없는 항목은 상황 점수의 영향을 받지 않는다', () => {
  const plain = { id: 'plain', title: '항목', tags: [], price: 2, type: 'do' };
  const [only] = recommend({ rules, context: { time: '10', mood: 'tired', mode: 'home' }, catalog: [plain], random: () => 0 });
  assert.equal(only.item.id, 'plain');
});

test('온보딩 선택지 요리가 허용 태그에 있고 폴백 규칙에 반영된다', () => {
  assert.ok(TAGS.includes('요리'));
  assert.equal(buildFallbackRules({ activities: ['요리'] }).weights.always['tag.요리'], 2);
});
