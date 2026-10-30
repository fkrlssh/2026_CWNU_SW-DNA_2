import { CONTEXT_KEYS, TAGS, TYPES } from './contract.js';

const MIN_WEIGHTS = 20;
const MAX_WEIGHTS = 45;
const MIN_FEATURES_PER_KEY = 3;
const MIN_REASONS = 8;
const MAX_REASONS = 15;
const MAX_REASON_LENGTH = 25;
const MAX_PERSONA_LENGTH = 40;

function isValidContextKey(key) {
  if (key === 'always') return true;
  const [name, value, ...rest] = key.split('.');
  return rest.length === 0 && (CONTEXT_KEYS[name]?.includes(value) ?? false);
}

function isValidFeature(feature) {
  const [kind, value, ...rest] = feature.split('.');
  if (rest.length > 0) return false;
  if (kind === 'tag') return TAGS.includes(value);
  if (kind === 'price') return ['1', '2', '3'].includes(value);
  if (kind === 'type') return TYPES.includes(value);
  return false;
}

// AGENTS.md 형식 규칙 검사. 오류 메시지 배열을 돌려주며 비어 있으면 통과.
export function validateRules(rules, answers = {}) {
  const errors = [];
  if (rules?.version !== 1) errors.push('version 은 1 이어야 함');
  if (typeof rules?.persona !== 'string' || rules.persona.length > MAX_PERSONA_LENGTH) {
    errors.push(`persona 는 ${MAX_PERSONA_LENGTH}자 이내 문자열`);
  }

  let weightCount = 0;
  for (const [key, features] of Object.entries(rules?.weights ?? {})) {
    if (!isValidContextKey(key)) errors.push(`허용되지 않은 상황키: ${key}`);
    const entries = Object.entries(features ?? {});
    weightCount += entries.length;
    if (entries.length < MIN_FEATURES_PER_KEY) {
      errors.push(`${key}: feature ${MIN_FEATURES_PER_KEY}개 이상 필요`);
    }
    for (const [feature, delta] of entries) {
      if (!isValidFeature(feature)) errors.push(`허용되지 않은 feature: ${feature}`);
      if (typeof delta !== 'number' || delta === 0 || Math.abs(delta) > 5) {
        errors.push(`${key}.${feature}: delta 는 -5~5, 0 제외`);
      }
    }
  }
  if (weightCount < MIN_WEIGHTS || weightCount > MAX_WEIGHTS) {
    errors.push(`weights 항목 수 ${weightCount} (허용 ${MIN_WEIGHTS}~${MAX_WEIGHTS})`);
  }

  const excluded = rules?.hard?.exclude_tags;
  if (!Array.isArray(excluded)) {
    errors.push('hard.exclude_tags 는 배열');
  } else {
    for (const allergy of answers.allergies ?? []) {
      if (!excluded.includes(allergy)) errors.push(`알레르기 누락: ${allergy}`);
    }
  }
  if (!Array.isArray(rules?.hard?.exclude_types)) errors.push('hard.exclude_types 는 배열');
  if (![1, 2, 3].includes(rules?.hard?.max_price_level)) errors.push('hard.max_price_level 은 1~3');
  if (!(rules?.hard?.radius_km > 0)) errors.push('hard.radius_km 는 양수');
  if (!(rules?.novelty >= 0 && rules?.novelty <= 1)) errors.push('novelty 는 0~1');

  const reasons = Object.entries(rules?.reasons ?? {});
  if (reasons.length < MIN_REASONS || reasons.length > MAX_REASONS) {
    errors.push(`reasons 항목 수 ${reasons.length} (허용 ${MIN_REASONS}~${MAX_REASONS})`);
  }
  for (const [feature, text] of reasons) {
    if (!isValidFeature(feature)) errors.push(`reasons 의 잘못된 feature: ${feature}`);
    if (typeof text !== 'string' || text.length > MAX_REASON_LENGTH) {
      errors.push(`reasons.${feature}: ${MAX_REASON_LENGTH}자 이내`);
    }
  }
  // reasons_by_type 은 선택 항목(폴백 규칙이 씀). 있으면 같은 형식 규칙을 적용한다.
  for (const [type, byType] of Object.entries(rules?.reasons_by_type ?? {})) {
    if (!TYPES.includes(type)) errors.push(`reasons_by_type 의 잘못된 type: ${type}`);
    for (const [feature, text] of Object.entries(byType ?? {})) {
      if (!isValidFeature(feature)) errors.push(`reasons_by_type.${type} 의 잘못된 feature: ${feature}`);
      if (typeof text !== 'string' || text.length > MAX_REASON_LENGTH) {
        errors.push(`reasons_by_type.${type}.${feature}: ${MAX_REASON_LENGTH}자 이내`);
      }
    }
  }
  return errors;
}
