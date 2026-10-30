const STEP_BY_RATING = { good: 0.2, soso: 0, bad: -0.2 };
const MAX_DELTA = 5;

// 입력을 변경하지 않고 갱신된 규칙을 돌려준다. 토큰을 쓰지 않는다.
export function applyFeedback(rules, item, rating) {
  const step = STEP_BY_RATING[rating];
  if (step === undefined) throw new Error(`알 수 없는 rating: ${rating}`);

  const next = structuredClone(rules);
  if (step === 0) return next;

  next.weights.always ??= {};
  for (const tag of item.tags) {
    const feature = `tag.${tag}`;
    const value = Math.round(((next.weights.always[feature] ?? 0) + step) * 100) / 100;
    if (value === 0) delete next.weights.always[feature]; // 규칙상 delta 0 금지
    else next.weights.always[feature] = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, value));
  }
  return next;
}
