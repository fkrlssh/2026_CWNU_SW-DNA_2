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

// 양극이 아닌 종류형 취향(형태·재질·색·아우터·활동 계열 …). 여러 개를 좋아요/싫어요로 고른다.
// tag 는 전역이라 음식의 면(麵)과 옷의 면(綿)처럼 이름이 같은 항목은 내부 태그를 다르게 둔다(label 만 같다).
export const TASTE_LIKE_WEIGHT = 2; // 온보딩 칩(+2)과 같은 크기. 더 약하면 칩에 묻힌다
export const TASTE_DISLIKE_WEIGHT = -2.5;

export const TASTE_GROUPS = {
  eat: [
    { key: 'form', label: '형태', options: [
      { tag: '밥', label: '밥' }, { tag: '면요리', label: '면' }, { tag: '국물', label: '국물' }, { tag: '빵디저트', label: '빵·디저트' },
      { tag: '고기', label: '고기' }, { tag: '해물', label: '해산물' }, { tag: '채소', label: '채소' }, { tag: '떡분식', label: '떡·분식' },
    ] },
    { key: 'cooking', label: '조리', options: [
      { tag: '튀김', label: '튀김' }, { tag: '구이', label: '구이' }, { tag: '찜탕', label: '찜·탕' },
      { tag: '볶음', label: '볶음' }, { tag: '생식', label: '회·샐러드' },
    ] },
  ],
  wear: [
    { key: 'material', label: '재질', options: [
      { tag: '니트', label: '니트' }, { tag: '면소재', label: '면' }, { tag: '린넨', label: '린넨' }, { tag: '데님', label: '데님' },
      { tag: '울', label: '울' }, { tag: '가죽', label: '가죽' }, { tag: '기능성', label: '기능성' }, { tag: '플리스', label: '플리스' },
    ] },
    { key: 'color', label: '색', options: [
      { tag: '블랙', label: '블랙' }, { tag: '화이트', label: '화이트' }, { tag: '베이지', label: '베이지' },
      { tag: '네이비', label: '네이비' }, { tag: '컬러', label: '컬러' },
    ] },
    { key: 'outer', label: '아우터', options: [
      { tag: '코트', label: '코트' }, { tag: '재킷', label: '재킷' }, { tag: '패딩', label: '패딩' },
      { tag: '가디건', label: '가디건' }, { tag: '후드', label: '후드' },
    ] },
    { key: 'fit', label: '핏', options: [
      { tag: '오버핏', label: '오버핏' }, { tag: '정핏', label: '정핏' }, { tag: '슬림핏', label: '슬림핏' },
    ] },
  ],
  do: [
    { key: 'kind', label: '계열', options: [
      { tag: '운동', label: '운동' }, { tag: '감상', label: '감상' }, { tag: '창작', label: '창작' }, { tag: '휴식', label: '휴식' },
      { tag: '사교', label: '사교' }, { tag: '탐방', label: '탐방' }, { tag: '학습', label: '학습' },
    ] },
    { key: 'place', label: '장소', options: [
      { tag: '집', label: '집' }, { tag: '카페', label: '카페' }, { tag: '공원', label: '공원' },
      { tag: '시내', label: '시내' }, { tag: '자연', label: '자연' }, { tag: '실내시설', label: '실내 시설' },
    ] },
  ],
};

const ALL_TASTE_OPTIONS = Object.values(TASTE_GROUPS).flat().flatMap((group) => group.options);
const TASTE_LABEL_BY_TAG = Object.fromEntries(ALL_TASTE_OPTIONS.map((option) => [option.tag, option.label]));
const TASTE_TAG_SET = new Set(ALL_TASTE_OPTIONS.map((option) => option.tag));

// 축·그룹이 쓰는 속성 태그 중 contract.js 의 기본 태그(indoor·outdoor·solo·group·운동·카페)가 아닌 것. TAGS 에 추가된다.
const BASE_TAGS = new Set(['indoor', 'outdoor', 'solo', 'group', '운동', '카페']);
export const ATTRIBUTE_TAGS = [...new Set([
  ...ALL_DIMENSIONS.flatMap((dimension) => [dimension.low.tag, dimension.high.tag]),
  ...ALL_TASTE_OPTIONS.map((option) => option.tag),
].filter((tag) => !BASE_TAGS.has(tag)))];

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

// 좋아요/싫어요 칩 값 정리. 아는 태그만 남기고, 양쪽에 다 있으면 싫어요가 이긴다.
export function sanitizeTastes(raw) {
  const pick = (list) => (Array.isArray(list) ? [...new Set(list.filter((tag) => TASTE_TAG_SET.has(tag)))] : []);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { like: [], dislike: [] };
  const dislike = pick(raw.dislike);
  const like = pick(raw.like).filter((tag) => !dislike.includes(tag));
  return { like, dislike };
}

// 좋아요 +2, 싫어요 -2.5. 싫어요는 하드 필터가 아니라 강한 감점이라, 후보가 그것뿐이면 그래도 나온다.
export function tasteWeights(tastes, { like = TASTE_LIKE_WEIGHT, dislike = TASTE_DISLIKE_WEIGHT } = {}) {
  const clean = sanitizeTastes(tastes);
  const weights = {};
  for (const tag of clean.like) weights[`tag.${tag}`] = like;
  for (const tag of clean.dislike) weights[`tag.${tag}`] = dislike;
  return weights;
}

// 추천을 받는 그 자리에서 고른 범주("오늘은 면이 당겨요", "튀김은 말고"). 프로필 칩보다 세게, 하드 필터보다는 약하게.
// 축의 양쪽 태그(매운·따뜻한 …)도 고를 수 있어 "뭐가 당겨요? 매운 거 / 시원한 거" 같은 질문에 쓸 수 있다.
export const REQUEST_LIKE_WEIGHT = 3;
export const REQUEST_DISLIKE_WEIGHT = -3;
const REQUEST_TAG_SET = new Set([...TASTE_TAG_SET, ...ALL_DIMENSIONS.flatMap((d) => [d.low.tag, d.high.tag])]);

export function sanitizeRequestTastes(context) {
  const pick = (list) => (Array.isArray(list) ? [...new Set(list.filter((tag) => REQUEST_TAG_SET.has(tag)))].slice(0, 10) : []);
  const avoid = pick(context?.avoid);
  const prefer = pick(context?.prefer).filter((tag) => !avoid.includes(tag));
  return { prefer, avoid };
}

export function requestTasteWeights(context) {
  const { prefer, avoid } = sanitizeRequestTastes(context);
  const weights = {};
  for (const tag of prefer) weights[`tag.${tag}`] = REQUEST_LIKE_WEIGHT;
  for (const tag of avoid) weights[`tag.${tag}`] = REQUEST_DISLIKE_WEIGHT;
  return weights;
}

// 규칙 위에 슬라이더(preferences)·프로필 칩(tastes)·이번 요청의 범주(requestContext.prefer/avoid)를 덧씌운 새 규칙.
// 원본은 바꾸지 않는다.
export function applyPreferences(rules, preferences, tastes, requestContext) {
  const weights = { ...preferenceWeights(preferences) };
  for (const source of [tasteWeights(tastes), requestTasteWeights(requestContext)]) {
    for (const [feature, delta] of Object.entries(source)) {
      weights[feature] = Math.round(((weights[feature] ?? 0) + delta) * 100) / 100;
    }
  }
  if (Object.keys(weights).length === 0) return rules;
  const always = { ...(rules.weights?.always ?? {}) };
  const reasons = { ...(rules.reasons ?? {}) };
  for (const [feature, delta] of Object.entries(weights)) {
    always[feature] = Math.round(((always[feature] ?? 0) + delta) * 100) / 100;
    const tag = feature.slice('tag.'.length);
    if (delta > 0 && !reasons[feature]) {
      const label = TASTE_LABEL_BY_TAG[tag];
      const text = PREFERENCE_REASONS[tag] ?? (label ? `${label} 취향에 맞췄어요` : undefined);
      if (text) reasons[feature] = text;
    }
  }
  return { ...rules, weights: { ...rules.weights, always }, reasons };
}

// 프론트 취향 화면용 스키마. 축(슬라이더)과 그룹(좋아요/싫어요 칩)을 함께 내려준다.
export function preferenceSchema() {
  return {
    min: PREFERENCE_MIN, max: PREFERENCE_MAX, step: 0.5, dimensions: PREFERENCE_DIMENSIONS,
    groups: TASTE_GROUPS, likeWeight: TASTE_LIKE_WEIGHT, dislikeWeight: TASTE_DISLIKE_WEIGHT,
  };
}
