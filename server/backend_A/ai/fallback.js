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
      exclude_tags: [...new Set([...(answers.allergies ?? []), ...(answers.dislikes ?? [])])],
      exclude_types: [],
      max_price_level: MAX_PRICE_BY_BUDGET[answers.budget] ?? 2,
      radius_km: answers.radiusKm ?? 3,
    },
    novelty: answers.noveltyPref === 'new' ? 0.6 : 0.2,
    reasons: { ...BASE_REASONS },
  };
}
