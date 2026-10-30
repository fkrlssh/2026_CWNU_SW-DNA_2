// 카테고리별 취향 축(슬라이더). 사용자가 -2~+2 로 조절한 값을 속성 태그의 가중치로 바꿔 추천 점수에 덧씌운다.
// AI 규칙이나 폴백 규칙을 다시 만들지 않으므로 슬라이더를 바꿔도 토큰이 들지 않고 즉시 반영된다.
// 각 축의 low/high 는 서로 반대되는 속성 태그다. +2 면 high 태그 +2.5, low 태그 -2.5 가 된다.

export const PREFERENCE_MIN = -2;
export const PREFERENCE_MAX = 2;
export const PREFERENCE_SCALE = 1.25; // 값 ±2 → 가중치 ±2.5. 좋아하는 칩(+2)·기분 적합도(+3)와 비슷한 크기

// 키는 프론트의 카테고리 id(eat·wear·do)와 같다.
export const PREFERENCE_DIMENSIONS = {
  eat: [
    { key: 'spicy', label: '매운맛', low: { tag: '순한', label: '순한 게 좋아요' }, high: { tag: '매운', label: '매운 게 좋아요' } },
    { key: 'temperature', label: '온도', low: { tag: '차가운', label: '시원한 음식' }, high: { tag: '따뜻한', label: '따뜻한 음식' } },
    { key: 'heaviness', label: '포만감', low: { tag: '가벼운', label: '가볍게' }, high: { tag: '든든한', label: '든든하게' } },
    { key: 'flavor', label: '맛 성향', low: { tag: '담백한', label: '담백한 맛' }, high: { tag: '자극적인', label: '자극적인 맛' } },
    { key: 'sweetness', label: '단맛', low: { tag: '짭짤한', label: '짭짤한 쪽' }, high: { tag: '달콤한', label: '달콤한 쪽' } },
  ],
  wear: [
    { key: 'formality', label: '격식', low: { tag: '편안한', label: '편안하게' }, high: { tag: '격식 있는', label: '격식 있게' } },
    { key: 'thickness', label: '두께', low: { tag: '얇은', label: '얇고 시원하게' }, high: { tag: '두꺼운', label: '두껍고 따뜻하게' } },
    { key: 'brightness', label: '색감', low: { tag: '어두운', label: '어두운 톤' }, high: { tag: '밝은', label: '밝은 톤' } },
    { key: 'flashiness', label: '꾸밈', low: { tag: '수수한', label: '수수하게' }, high: { tag: '화려한', label: '화려하게' } },
  ],
  do: [
    { key: 'place', label: '장소', low: { tag: 'indoor', label: '실내에서' }, high: { tag: 'outdoor', label: '밖에서' } },
    { key: 'energy', label: '활동량', low: { tag: '정적인', label: '조용히' }, high: { tag: '활동적인', label: '몸을 움직이며' } },
    { key: 'company', label: '동행', low: { tag: 'solo', label: '혼자' }, high: { tag: 'group', label: '함께' } },
    { key: 'cost', label: '비용', low: { tag: '무료', label: '돈 안 들게' }, high: { tag: '유료', label: '써도 괜찮아요' } },
  ],
};

const ALL_DIMENSIONS = Object.values(PREFERENCE_DIMENSIONS).flat();
const DIMENSION_BY_KEY = Object.fromEntries(ALL_DIMENSIONS.map((dimension) => [dimension.key, dimension]));

// 축이 쓰는 속성 태그 중 contract.js 의 기본 태그(indoor·outdoor·solo·group)가 아닌 것. TAGS 에 추가된다.
export const ATTRIBUTE_TAGS = [...new Set(
  ALL_DIMENSIONS.flatMap((dimension) => [dimension.low.tag, dimension.high.tag])
    .filter((tag) => !['indoor', 'outdoor', 'solo', 'group'].includes(tag)),
)];

// 슬라이더 가중치가 추천에 크게 작용했을 때 카드에 붙는 이유 문구(25자 이내)
const PREFERENCE_REASONS = {
  순한: '순한 맛을 좋아하신다고 하셨죠', 매운: '매운맛 취향에 맞췄어요',
  차가운: '시원한 음식을 좋아하시니까요', 따뜻한: '따뜻한 음식을 좋아하시니까요',
  가벼운: '가볍게 드시는 걸 선호하셨어요', 든든한: '든든한 한 끼를 선호하셨어요',
  담백한: '담백한 맛 취향에 맞췄어요', 자극적인: '자극적인 맛 취향에 맞췄어요',
  짭짤한: '짭짤한 쪽을 선호하셨어요', 달콤한: '달콤한 쪽을 선호하셨어요',
  편안한: '편안한 옷을 선호하셨어요', '격식 있는': '격식 있는 차림을 선호하셨어요',
  얇은: '얇은 옷을 선호하셨어요', 두꺼운: '따뜻한 옷을 선호하셨어요',
  어두운: '어두운 톤을 좋아하시니까요', 밝은: '밝은 톤을 좋아하시니까요',
  수수한: '수수한 스타일을 선호하셨어요', 화려한: '화려한 스타일을 선호하셨어요',
  indoor: '실내 활동을 선호하셨어요', outdoor: '바깥 활동을 선호하셨어요',
  정적인: '조용한 시간을 선호하셨어요', 활동적인: '몸을 움직이는 걸 선호하셨어요',
  solo: '혼자 하는 걸 선호하셨어요', group: '함께 하는 걸 선호하셨어요',
  무료: '돈 안 드는 쪽을 선호하셨어요', 유료: '취향에 맞춘 선택이에요',
};

// 프론트가 보낸 값 중 아는 축만, 범위 안으로 잘라 숫자로 돌려준다. 0 과 잘못된 값은 버린다.
export function sanitizePreferences(raw) {
  const clean = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return clean;
  for (const [key, value] of Object.entries(raw)) {
    if (!DIMENSION_BY_KEY[key]) continue;
    const number = Number(value);
    if (!Number.isFinite(number) || number === 0) continue;
    clean[key] = Math.max(PREFERENCE_MIN, Math.min(PREFERENCE_MAX, Math.round(number * 2) / 2));
  }
  return clean;
}

// 슬라이더 값 → feature 가중치. +v 면 high 태그 +v·scale, low 태그 -v·scale.
export function preferenceWeights(preferences) {
  const weights = {};
  for (const [key, value] of Object.entries(sanitizePreferences(preferences))) {
    const { low, high } = DIMENSION_BY_KEY[key];
    weights[`tag.${high.tag}`] = Math.round(value * PREFERENCE_SCALE * 100) / 100;
    weights[`tag.${low.tag}`] = -weights[`tag.${high.tag}`];
  }
  return weights;
}

// 규칙 위에 슬라이더 가중치를 덧씌운 새 규칙. 원본은 바꾸지 않는다.
export function applyPreferences(rules, preferences) {
  const weights = preferenceWeights(preferences);
  if (Object.keys(weights).length === 0) return rules;
  const always = { ...(rules.weights?.always ?? {}) };
  const reasons = { ...(rules.reasons ?? {}) };
  for (const [feature, delta] of Object.entries(weights)) {
    always[feature] = Math.round(((always[feature] ?? 0) + delta) * 100) / 100;
    const tag = feature.slice('tag.'.length);
    if (delta > 0 && !reasons[feature] && PREFERENCE_REASONS[tag]) reasons[feature] = PREFERENCE_REASONS[tag];
  }
  return { ...rules, weights: { ...rules.weights, always }, reasons };
}

// 프론트 슬라이더 화면용 스키마. 값 범위와 축 목록을 그대로 내려준다.
export function preferenceSchema() {
  return { min: PREFERENCE_MIN, max: PREFERENCE_MAX, step: 0.5, dimensions: PREFERENCE_DIMENSIONS };
}
