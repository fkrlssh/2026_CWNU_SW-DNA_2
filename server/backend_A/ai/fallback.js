import { normalizeExclusions } from './allergens.js';
import { MAX_PRICE_BY_BUDGET, TAGS } from './contract.js';

const MAX_LIKED_TAGS = 6;

const BASE_WEIGHTS = {
  'mood.good': { 'tag.outdoor': 1.5, 'tag.group': 1, 'tag.comfort': 0.5 },
  'mood.tired': { 'tag.light': 2, 'tag.delivery': 1.5, 'tag.outdoor': -2 },
  'mood.sad': { 'tag.comfort': 2, 'tag.indoor': 1, 'tag.group': -1 },
  'budget.low': { 'price.1': 2.5, 'price.2': -0.5, 'price.3': -3 },
  'budget.mid': { 'price.2': 1.5, 'price.1': 0.5, 'price.3': -1 },
  'budget.high': { 'price.3': 1, 'price.2': 0.5, 'price.1': -0.5 },
  'mode.delivery': { 'tag.delivery': 3, 'tag.outdoor': -2, 'tag.indoor': 0.5 },
  'mode.out': { 'tag.outdoor': 2, 'tag.delivery': -2, 'tag.indoor': -1 },
  'mode.home': { 'tag.indoor': 2, 'tag.delivery': 1, 'tag.outdoor': -2 },
  'weather.rain': { 'tag.indoor': 2, 'tag.delivery': 1, 'tag.outdoor': -3 },
  'weather.clear': { 'tag.outdoor': 1.5, 'tag.산책': 1, 'tag.indoor': -0.5 },
  'with.alone': { 'tag.solo': 1.5, 'tag.comfort': 0.5, 'tag.group': -1 },
  'with.friend': { 'tag.group': 2, 'tag.outdoor': 0.5, 'tag.solo': -1 },
};

const BASE_REASONS = {
  'tag.light': '가볍게 즐기기 좋아요',
  'tag.delivery': '나가지 않아도 돼요',
  'tag.indoor': '실내에서 편하게 보낼 수 있어요',
  'tag.outdoor': '바깥 공기 쐬기 좋은 날이에요',
  'tag.comfort': '마음이 편안해지는 선택이에요',
  'tag.group': '함께라서 더 즐거워요',
  'tag.solo': '혼자만의 시간에 잘 어울려요',
  'price.1': '부담 없는 가격이에요',
  'price.3': '오늘은 조금 여유 있게 즐겨요',
};

// 같은 feature 라도 음식·옷·활동에 맞는 말이 다르다("바깥 공기 쐬기 좋은 날" 은 음식 카드에 어색하다).
// 엔진은 항목 type 에 맞는 문구를 먼저 찾고, 없으면 BASE_REASONS 를 쓴다.
// export 하는 이유: 이 필드가 생기기 전에 DB 에 저장된 폴백 규칙에도 엔진이 같은 문구를 적용하기 위해서다.
export const FALLBACK_REASONS_BY_TYPE = {
  food: {
    'tag.light': '속 편하게 가볍게 먹기 좋아요',
    'tag.delivery': '집에서 편하게 받아 먹을 수 있어요',
    'tag.indoor': '집에서 해 먹기에도 좋아요',
    'tag.outdoor': '나가서 먹기 좋은 메뉴예요',
    'tag.comfort': '마음까지 따뜻해지는 메뉴예요',
    'tag.group': '같이 나눠 먹기 좋아요',
    'tag.solo': '혼자 먹기에도 부담 없어요',
    'price.1': '가격 부담이 적어요',
    'price.3': '오늘은 제대로 한 끼 챙겨요',
  },
  wear: {
    'tag.light': '준비 시간이 짧아요',
    'tag.indoor': '집에서 편하게 입기 좋아요',
    'tag.outdoor': '외출하기 좋은 차림이에요',
    'tag.comfort': '포근하고 편안한 조합이에요',
    'tag.group': '약속 자리에도 잘 어울려요',
    'tag.solo': '혼자 보내는 날에 편해요',
    'price.1': '있는 옷으로 충분해요',
    'price.3': '오늘은 조금 꾸며 봐도 좋아요',
  },
  do: {
    'tag.light': '가볍게 시작하기 좋아요',
    'tag.indoor': '집에서 바로 할 수 있어요',
    'tag.outdoor': '바깥 공기 쐬기 좋아요',
    'tag.comfort': '마음이 차분해지는 시간이에요',
    'tag.group': '함께하면 더 즐거워요',
    'tag.solo': '혼자만의 시간에 잘 어울려요',
    'price.1': '돈 들이지 않아도 돼요',
    'price.3': '오늘은 나에게 조금 써 봐요',
  },
};

// Codex 없이 온보딩 칩 선택만으로 만드는 규칙. 토큰 고갈·장애·데모 안전장치.
export function buildFallbackRules(answers = {}) {
  const liked = [...(answers.foods ?? []), ...(answers.styles ?? []), ...(answers.activities ?? [])]
    .filter((tag) => TAGS.includes(tag))
    .slice(0, MAX_LIKED_TAGS);
  const always = { 'tag.comfort': 0.5, 'tag.light': 0.3, 'tag.indoor': 0.2 };
  for (const tag of liked) always[`tag.${tag}`] = 2;

  return {
    version: 1,
    persona: '입력한 취향을 바탕으로 한 기본 추천',
    weights: { always, ...BASE_WEIGHTS },
    hard: {
      exclude_tags: normalizeExclusions([...(answers.allergies ?? []), ...(answers.dislikes ?? [])]),
      exclude_types: [],
      max_price_level: MAX_PRICE_BY_BUDGET[answers.budget] ?? 2,
      radius_km: answers.radiusKm ?? 3,
    },
    novelty: answers.noveltyPref === 'new' ? 0.6 : 0.2,
    reasons: { ...BASE_REASONS },
    reasons_by_type: structuredClone(FALLBACK_REASONS_BY_TYPE),
  };
}
