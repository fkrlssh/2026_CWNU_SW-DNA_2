import { ALLERGEN_TAGS, ITEM_ALLERGENS, normalizeExclusions } from './allergens.js';
import { ITEM_ATTRIBUTES } from './attributes.js';
import { ATTRIBUTE_TAGS } from './preferences.js';

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
  // 온보딩 칩 태그 (프론트 js/data.js 의 ONBOARDING_STEPS 와 맞춘다)
  '한식', '양식', '일식', '분식', '중식', '샐러드', '디저트',
  '미니멀', '캐주얼', '스트릿', '러블리', '스포티', '포멀', '편한 옷',
  '집콕', '산책', '운동', '문화생활', '카페', '쇼핑', '요리',
  // AGENTS.md 태그
  'comfort', 'light', 'delivery', 'indoor', 'outdoor', 'group', 'solo',
  // 알레르기 태그
  ...ALLERGEN_TAGS,
  // 취향 축 속성 태그 (preferences.js: 매운·순한, 따뜻한·차가운, 격식 있는·편안한 …)
  ...ATTRIBUTE_TAGS,
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

const MOOD_KEY_BY_LABEL = { 좋음: 'good', 피곤: 'tired', 우울: 'sad' };
const MODE_KEY_BY_LABEL = {
  배달: 'delivery',
  외식: 'out',
  '출근·약속': 'out',
  '편한 외출': 'out',
  '가벼운 외출': 'out',
  문화생활: 'out',
  집밥: 'home',
  집콕: 'home',
};
const LIGHT_MAX_MINUTES = 15;

// data.js 항목(budget '저렴', 카테고리 eat)을 엔진 형식(price 1, type food)으로 변환한다.
// moodKeys·modeKeys·minutes 는 recommend 의 상황 적합도 점수에, 도출 태그는 규칙 가중치에 쓰인다.
export function normalizeItem(raw, category) {
  const modeTags = (raw.modes ?? []).flatMap((mode) => TAGS_BY_MODE[mode] ?? []);
  // 규칙이 쓰는 light·comfort 가 data.js 에 없으므로 소요 시간과 어울리는 기분에서 도출한다.
  const derivedTags = [
    ...(raw.minutes !== undefined && raw.minutes <= LIGHT_MAX_MINUTES ? ['light'] : []),
    ...(raw.moods?.includes('우울') ? ['comfort'] : []),
  ];
  return {
    ...raw,
    type: raw.type ?? TYPE_BY_CATEGORY[category],
    price: raw.price ?? PRICE_BY_BUDGET_LABEL[raw.budget] ?? 2,
    tags: [...new Set([...(raw.tags ?? []), ...modeTags, ...derivedTags, ...(raw.attributes ?? ITEM_ATTRIBUTES[raw.id] ?? [])])],
    moodKeys: raw.moodKeys ?? (raw.moods ?? []).map((mood) => MOOD_KEY_BY_LABEL[mood]).filter(Boolean),
    modeKeys: raw.modeKeys ?? [...new Set((raw.modes ?? []).map((mode) => MODE_KEY_BY_LABEL[mode]).filter(Boolean))],
    // data.js 는 '밀'·'대두' 같은 한국어로 적고, 필터는 영어 태그로 비교하므로 여기서 통일한다.
    allergens: raw.allergens ? normalizeExclusions(raw.allergens) : ITEM_ALLERGENS[raw.id],
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
