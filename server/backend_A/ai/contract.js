// 3인 합의 전 임시값. 역할분담.md 부록이 확정되면 이 파일만 고친다.

export const CONTEXT_KEYS = {
  mood: ['good', 'tired', 'sad'],
  budget: ['low', 'mid', 'high'],
  time: ['10', '60', '180'],
  mode: ['delivery', 'out', 'home'],
  weather: ['rain', 'clear'],
  with: ['alone', 'friend'],
};

export const TAGS = [
  // data.js 태그
  '한식', '양식', '일식', '분식', '중식',
  '미니멀', '캐주얼', '스트릿', '러블리', '스포티',
  '집콕', '산책', '운동', '문화생활',
  // AGENTS.md 태그
  'comfort', 'light', 'delivery', 'indoor', 'outdoor', 'group', 'solo',
  // 알레르기 태그
  'seafood', 'peanut', 'dairy', 'egg', 'wheat',
];

export const TYPES = ['food', 'do', 'wear'];
export const MAX_PRICE_BY_BUDGET = { low: 1, mid: 2, high: 3 };

const PRICE_BY_BUDGET_LABEL = { 저렴: 1, 보통: 2, 여유: 3 };
const TYPE_BY_CATEGORY = { eat: 'food', food: 'food', wear: 'wear', do: 'do' };
const TAGS_BY_MODE = {
  배달: ['delivery'],
  집밥: ['indoor'],
  집콕: ['indoor'],
  외식: ['outdoor'],
  '편한 외출': ['outdoor'],
  '가벼운 외출': ['outdoor'],
  '출근·약속': ['outdoor'],
  문화생활: ['outdoor'],
};

// data.js 항목(budget '저렴', 카테고리 eat)을 엔진 형식(price 1, type food)으로 변환한다.
export function normalizeItem(raw, category) {
  const modeTags = (raw.modes ?? []).flatMap((mode) => TAGS_BY_MODE[mode] ?? []);
  return {
    ...raw,
    type: raw.type ?? TYPE_BY_CATEGORY[category],
    price: raw.price ?? PRICE_BY_BUDGET_LABEL[raw.budget] ?? 2,
    tags: [...new Set([...(raw.tags ?? []), ...modeTags])],
  };
}

// 항목이 가진 feature 키 목록 (tag.* · price.* · type.*)
export function itemFeatures(item) {
  return [
    ...item.tags.map((tag) => `tag.${tag}`),
    `price.${item.price}`,
    `type.${item.type}`,
  ];
}
