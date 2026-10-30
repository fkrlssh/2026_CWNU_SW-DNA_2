// 취향 퀴즈: 라운드마다 항목 3개 중 하나를 고르면, 고른 것과 버린 것이 갈리는 축마다 증거를 쌓아
// preferences.js 의 축 값(-2~+2)으로 바꾼다. 슬라이더 13개를 보여 주지 않고 5번의 선택으로 취향을 잡는 용도다.
import { PREFERENCE_DIMENSIONS, PREFERENCE_MAX, PREFERENCE_MIN } from './preferences.js';

export const QUIZ_ROUNDS = 5;
export const QUIZ_OPTIONS = 3;
const MIN_ROUNDS = 1;
const MAX_ROUNDS = 7;
const WEAK_EVIDENCE_CAP = 1; // 갈린 비교가 한 번뿐이면 ±1 까지만

function shuffle(list, random) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 항목이 축의 어느 쪽인지: -1(low) · +1(high) · 0(해당 없음)
function sideOf(item, dimension) {
  if (item.tags.includes(dimension.high.tag)) return 1;
  if (item.tags.includes(dimension.low.tag)) return -1;
  return 0;
}

// 두 항목이 반대편인 축의 수. 세 번째 보기를 고를 때 "둘과 가장 많이 갈리는" 항목을 찾는 데 쓴다.
function disagreement(a, b, dimensions) {
  return dimensions.filter((dimension) => sideOf(a, dimension) * sideOf(b, dimension) < 0).length;
}

// 라운드별 초점 축. 축이 라운드 수보다 적으면 앞 축부터 한 번 더 묻는다(첫 축이 가장 중요한 축).
export function focusPlan(category, rounds = QUIZ_ROUNDS) {
  const dimensions = PREFERENCE_DIMENSIONS[category] ?? [];
  return Array.from({ length: rounds }, (_, i) => dimensions[i % dimensions.length]).filter(Boolean);
}

// catalog 은 normalizeItem 을 거치고 알레르기 등 하드 필터를 이미 통과한 항목만 넘긴다.
export function buildQuiz({ category, catalog, rounds = QUIZ_ROUNDS, random = Math.random }) {
  const dimensions = PREFERENCE_DIMENSIONS[category];
  if (!dimensions) throw new Error(`알 수 없는 카테고리: ${category}`);
  const count = Math.max(MIN_ROUNDS, Math.min(MAX_ROUNDS, rounds));
  const used = new Set();
  const unused = () => catalog.filter((item) => !used.has(item.id));
  const take = (pool) => {
    const picked = shuffle(pool, random)[0];
    if (picked) used.add(picked.id);
    return picked;
  };

  const result = [];
  for (const focus of focusPlan(category, count)) {
    const low = take(unused().filter((item) => sideOf(item, focus) < 0));
    const high = take(unused().filter((item) => sideOf(item, focus) > 0));
    const chosen = [low, high].filter(Boolean);
    while (chosen.length < QUIZ_OPTIONS) {
      const pool = unused();
      if (pool.length === 0) break;
      // 이미 고른 보기들과 가장 많이 갈리는 항목. 동점이면 무작위.
      const best = shuffle(pool, random).sort(
        (a, b) => chosen.reduce((n, c) => n + disagreement(b, c, dimensions), 0) - chosen.reduce((n, c) => n + disagreement(a, c, dimensions), 0),
      )[0];
      used.add(best.id);
      chosen.push(best);
    }
    if (chosen.length < 2) break; // 카탈로그가 너무 작으면 여기서 멈춘다
    result.push({
      round: result.length + 1,
      focus: focus.key,
      question: `${focus.label}: 셋 중 지금 더 끌리는 건?`,
      options: shuffle(chosen, random).map((item) => ({ itemId: item.id, title: item.title, emoji: item.emoji, scene: item.scene })),
    });
  }
  return { category, rounds: result };
}

// answers: [{ options: [itemId×3], pick: itemId | null }]. 보기는 서버가 준 것을 그대로 돌려받는다.
// 반환: measured(축별 값, 증거가 있는 축만) 와 evidence(축별 집계, 결과 화면·디버그용)
export function scoreQuiz({ category, catalog, answers }) {
  const dimensions = PREFERENCE_DIMENSIONS[category];
  if (!dimensions) throw new Error(`알 수 없는 카테고리: ${category}`);
  const byId = new Map(catalog.map((item) => [item.id, item]));
  const tally = Object.fromEntries(dimensions.map((d) => [d.key, { evidence: 0, exposure: 0 }]));

  for (const answer of answers ?? []) {
    const picked = byId.get(answer?.pick);
    if (!picked) continue; // 건너뜀 또는 모르는 항목
    const rejected = (answer.options ?? []).filter((id) => id !== answer.pick).map((id) => byId.get(id)).filter(Boolean);
    for (const dimension of dimensions) {
      const side = sideOf(picked, dimension);
      if (side === 0) continue;
      for (const other of rejected) {
        if (sideOf(other, dimension) * side < 0) {
          tally[dimension.key].evidence += side;
          tally[dimension.key].exposure += 1;
        }
      }
    }
  }

  const measured = {};
  const evidence = {};
  for (const dimension of dimensions) {
    const { evidence: sum, exposure } = tally[dimension.key];
    if (exposure === 0) continue;
    let value = (PREFERENCE_MAX * sum) / exposure; // 일관되면 ±2, 엇갈리면 0 에 가깝게
    if (exposure <= WEAK_EVIDENCE_CAP) value = Math.max(-1, Math.min(1, value));
    value = Math.max(PREFERENCE_MIN, Math.min(PREFERENCE_MAX, Math.round(value * 2) / 2));
    evidence[dimension.key] = { value, evidence: sum, exposure, label: dimension.label, side: value > 0 ? dimension.high.label : value < 0 ? dimension.low.label : '상관없음' };
    if (value !== 0) measured[dimension.key] = value;
  }
  return { measured, evidence };
}
