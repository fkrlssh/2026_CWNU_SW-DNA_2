// 사용자가 한국어로 적은 알레르기·기피 항목을 카탈로그 태그로 바꾼다.
const TAG_BY_ALIAS = {
  seafood: 'seafood', 해산물: 'seafood', 생선: 'seafood', 어패류: 'seafood', 갑각류: 'seafood',
  새우: 'seafood', 게: 'seafood', 조개: 'seafood', 오징어: 'seafood', 연어: 'seafood', 참치: 'seafood', 회: 'seafood',
  peanut: 'peanut', 땅콩: 'peanut', 견과: 'peanut', 견과류: 'peanut',
  dairy: 'dairy', 우유: 'dairy', 유제품: 'dairy', 치즈: 'dairy',
  egg: 'egg', 달걀: 'egg', 계란: 'egg',
  wheat: 'wheat', 밀: 'wheat', 밀가루: 'wheat', 글루텐: 'wheat',
  soy: 'soy', 대두: 'soy', 콩: 'soy', 두부: 'soy',
};

export const ALLERGEN_TAGS = ['seafood', 'peanut', 'dairy', 'egg', 'wheat', 'soy'];

// data.js 음식의 일반적인 재료 기준 보수적 추정치. 실제 판매처의 성분을 보장하지 않는다.
export const ITEM_ALLERGENS = {
  'soup-rice': ['seafood', 'egg', 'soy'],
  pasta: ['wheat', 'dairy', 'egg'],
  sushi: ['seafood', 'egg', 'soy', 'wheat'],
  tteokbokki: ['wheat', 'seafood', 'egg', 'soy'],
  'mapo-tofu': ['soy', 'wheat'],
  bibimbap: ['egg', 'soy', 'wheat'],
  udon: ['wheat', 'seafood', 'soy'],
  sandwich: ['wheat', 'egg', 'dairy'],
  gimbap: ['seafood', 'egg', 'soy', 'wheat'],
};

// 별칭은 태그로 바꾸고, 모르는 항목은 상품명 비교에 쓰도록 그대로 둔다.
export function normalizeExclusions(values = []) {
  const entries = values.flatMap((value) => String(value).split(/[,/·\s]+/)).filter(Boolean);
  return [...new Set(entries.map((entry) => TAG_BY_ALIAS[entry] ?? entry))];
}
