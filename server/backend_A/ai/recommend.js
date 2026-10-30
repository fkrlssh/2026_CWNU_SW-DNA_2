import { ALLERGEN_TAGS, normalizeExclusions } from './allergens.js';
import { itemFeatures } from './contract.js';

const RESULT_COUNT = 3;
const NOVELTY_SPREAD = 4;
const NEW_REFINE_NOVELTY = 1;
const CHEAPER_PENALTY = 2;
const LIGHTER_BONUS = 3;
const DIFFERENT_PENALTY = 3;
const DEFAULT_REASON = '오늘 상황에 잘 어울려요';
const MOOD_FIT = 3;
const MODE_FIT = 5;
const MODE_MISS = 3;
const BUDGET_RANK = { low: 1, mid: 2, high: 3 };
// 시간 답변별 [소요 분 상한, 점수]. 처음 맞는 구간을 쓰고 마지막 구간은 초과분이다.
const TIME_FIT = {
  10: [[10, 6], [20, 1], [Infinity, -4]],
  60: [[60, 4], [Infinity, -2]],
  180: [[30, 1], [Infinity, 3]],
};

function activeWeights(rules, context) {
  const keys = ['always', ...Object.entries(context ?? {}).map(([key, value]) => `${key}.${value}`)];
  return keys.map((key) => rules.weights[key]).filter(Boolean);
}

// 알레르기·절대 싫은 것은 리파인이나 결과 부족을 이유로 완화하지 않는다.
function passesHardFilter(item, hard) {
  const excluded = normalizeExclusions(hard.exclude_tags);
  // 재료 정보가 없는 음식은 안전하다고 볼 수 없으므로 알레르기 사용자에게 내보내지 않는다.
  const allergenUnknown = item.type === 'food' && !item.allergens
    && excluded.some((tag) => ALLERGEN_TAGS.includes(tag));
  const itemTags = [...item.tags, ...(item.allergens ?? [])];
  return !allergenUnknown
    && !excluded.some((tag) => itemTags.includes(tag) || item.title?.includes(tag))
    && !hard.exclude_types.includes(item.type)
    && item.price <= hard.max_price_level;
}

// 기존 app.js scoreItem 의 상황 적합도. 규칙 가중치가 표현하지 못하는 항목 조건(소요 시간·기분·방식·예산)을 본다.
// 조건 필드가 없는 항목은 영향을 받지 않는다.
function contextFit(item, context = {}) {
  let score = 0;
  if (context.mood && item.moodKeys?.includes(context.mood)) score += MOOD_FIT;
  if (context.mode && item.modeKeys?.length) {
    score += item.modeKeys.includes(context.mode) ? MODE_FIT : -MODE_MISS;
  }
  if (BUDGET_RANK[context.budget]) {
    score += 3 - Math.abs(BUDGET_RANK[context.budget] - item.price) * 2;
  }
  const timeBands = TIME_FIT[context.time];
  if (timeBands && item.minutes !== undefined) {
    score += timeBands.find(([maxMinutes]) => item.minutes <= maxMinutes)[1];
  }
  return score;
}

function refineAdjustment(item, refine, excludedTags) {
  switch (refine) {
    case 'cheaper': return -CHEAPER_PENALTY * item.price;
    case 'lighter': return item.tags.includes('light') ? LIGHTER_BONUS : 0;
    case 'different': return item.tags.some((tag) => excludedTags.has(tag)) ? -DIFFERENT_PENALTY : 0;
    default: return 0;
  }
}

// 가중치 기여가 큰 순서의 이유 문구 목록. 끝에 항목 고유 문구를 둬서 후보끼리 겹칠 때 대체할 수 있게 한다.
// reasons_by_type(선택) 에 항목 type 전용 문구가 있으면 그것을 우선한다.
function rankedReasons(item, weightSets, rules) {
  const reasons = { ...rules.reasons, ...(rules.reasons_by_type?.[item.type] ?? {}) };
  const contributions = new Map();
  for (const weights of weightSets) {
    for (const feature of itemFeatures(item)) {
      if (weights[feature]) {
        contributions.set(feature, (contributions.get(feature) ?? 0) + weights[feature]);
      }
    }
  }
  const fromRules = [...contributions]
    .filter(([feature, value]) => value > 0 && reasons[feature])
    .sort((a, b) => b[1] - a[1])
    .map(([feature]) => reasons[feature]);
  return [...new Set([...fromRules, ...(item.reason ? [item.reason] : [])])];
}

// 같은 화면의 후보 3개가 같은 "이유 한 줄"을 쓰지 않도록, 위 후보가 이미 쓴 문구는 건너뛴다.
function assignReasons(ranked) {
  const used = new Set();
  return ranked.map(({ item, reasons, score }) => {
    const reason = reasons.find((text) => !used.has(text)) ?? reasons[0] ?? DEFAULT_REASON;
    used.add(reason);
    return { item, reason, score };
  });
}

// catalog 은 normalizeItem 을 거친, 요청 카테고리의 항목만 넘긴다.
// random 은 테스트에서 결과를 고정하기 위한 주입점이다.
export function recommend({ rules, context, catalog, excludeIds = [], refine, random = Math.random }) {
  const weightSets = activeWeights(rules, context);
  const excluded = new Set(excludeIds);
  const excludedTags = new Set(
    catalog.filter((item) => excluded.has(item.id)).flatMap((item) => item.tags),
  );
  const novelty = refine === 'new' ? NEW_REFINE_NOVELTY : rules.novelty;

  const ranked = catalog
    .filter((item) => !excluded.has(item.id) && passesHardFilter(item, rules.hard))
    .map((item) => {
      const features = itemFeatures(item);
      const base = weightSets.reduce(
        (sum, weights) => sum + features.reduce((acc, feature) => acc + (weights[feature] ?? 0), 0),
        0,
      );
      const score = base
        + contextFit(item, context)
        + refineAdjustment(item, refine, excludedTags)
        + novelty * NOVELTY_SPREAD * random();
      return { item, reasons: rankedReasons(item, weightSets, rules), score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, RESULT_COUNT);
  return assignReasons(ranked);
}
