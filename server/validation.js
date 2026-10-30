import { PREFERENCE_DIMENSIONS, TASTE_GROUPS } from './backend_A/ai/index.js';

const PROFILE_LIST_FIELDS = ['food', 'style', 'activity', 'foods', 'styles', 'activities', 'allergies', 'dislikes'];
const PREFERENCE_KEYS = new Set(Object.values(PREFERENCE_DIMENSIONS).flat().map((dimension) => dimension.key));
const TASTE_TAGS = new Set(Object.values(TASTE_GROUPS).flat().flatMap((group) => group.options.map((option) => option.tag)));
const CONTEXT_FIELDS = new Set(['mood', 'budget', 'time', 'mode', 'weather', 'with']);
const REFINES = new Set(['cheaper', 'lighter', 'different', 'new']);
const MESSAGE_ROLES = new Set(['user', 'assistant']);

function fail(code, message) {
  throw Object.assign(new Error(message), { status: 400, code });
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function validateStringList(value, field, { maxItems = 20, maxLength = 40 } = {}) {
  if (!Array.isArray(value) || value.length > maxItems) {
    fail('INVALID_PROFILE', `${field}는 최대 ${maxItems}개의 배열이어야 합니다.`);
  }
  if (value.some((item) => typeof item !== 'string' || !item.trim() || item.length > maxLength)) {
    fail('INVALID_PROFILE', `${field}의 각 항목은 ${maxLength}자 이내의 문자열이어야 합니다.`);
  }
}

export function validateProfile(answers) {
  if (!isPlainObject(answers)) fail('INVALID_PROFILE', 'answers 객체가 필요합니다.');
  if (JSON.stringify(answers).length > 16_000) fail('INVALID_PROFILE', '프로필 데이터가 너무 큽니다.');
  for (const field of PROFILE_LIST_FIELDS) {
    if (field in answers) validateStringList(answers[field], field);
  }
  if ('radiusKm' in answers && (!Number.isFinite(Number(answers.radiusKm)) || Number(answers.radiusKm) <= 0 || Number(answers.radiusKm) > 100)) {
    fail('INVALID_PROFILE', 'radiusKm는 0보다 크고 100 이하여야 합니다.');
  }
  for (const field of ['budget', 'budgetRange', 'activeTime', 'noveltyPref']) {
    if (field in answers && (typeof answers[field] !== 'string' || answers[field].length > 40)) {
      fail('INVALID_PROFILE', `${field}는 40자 이내 문자열이어야 합니다.`);
    }
  }
  if ('preferences' in answers) {
    if (!isPlainObject(answers.preferences)) fail('INVALID_PROFILE', 'preferences는 { 축키: -2~2 숫자 } 객체여야 합니다.');
    for (const [key, value] of Object.entries(answers.preferences)) {
      if (!PREFERENCE_KEYS.has(key)) fail('INVALID_PROFILE', `알 수 없는 취향 축입니다: ${key}`);
      const number = Number(value);
      if (!Number.isFinite(number) || number < -2 || number > 2) fail('INVALID_PROFILE', `preferences.${key}는 -2~2 사이 숫자여야 합니다.`);
    }
  }
  if ('tastes' in answers) {
    if (!isPlainObject(answers.tastes)) fail('INVALID_PROFILE', 'tastes는 { like: [태그], dislike: [태그] } 객체여야 합니다.');
    for (const side of ['like', 'dislike']) {
      const list = answers.tastes[side];
      if (list === undefined) continue;
      if (!Array.isArray(list) || list.length > 60) fail('INVALID_PROFILE', `tastes.${side}는 최대 60개의 배열이어야 합니다.`);
      for (const tag of list) {
        if (!TASTE_TAGS.has(tag)) fail('INVALID_PROFILE', `알 수 없는 취향 항목입니다: ${tag}`);
      }
    }
  }
}

export function validateContext(context) {
  if (!isPlainObject(context)) fail('INVALID_CONTEXT', 'context는 객체여야 합니다.');
  for (const [key, value] of Object.entries(context)) {
    if (key === 'prefer' || key === 'avoid') {
      // 이번 요청에서 고른 범주 태그 목록. 모르는 태그는 서버가 조용히 버린다.
      if (!Array.isArray(value) || value.length > 10 || value.some((tag) => typeof tag !== 'string' || !tag.trim() || tag.length > 40)) {
        fail('INVALID_CONTEXT', `${key}는 최대 10개의 문자열 배열이어야 합니다.`);
      }
      continue;
    }
    if (!CONTEXT_FIELDS.has(key) || typeof value !== 'string' || !value.trim() || value.length > 40) {
      fail('INVALID_CONTEXT', `허용되지 않은 context 값입니다: ${key}`);
    }
  }
}

export function validateExcludeIds(excludeIds) {
  if (!Array.isArray(excludeIds) || excludeIds.length > 100
    || excludeIds.some((id) => typeof id !== 'string' || !id || id.length > 100)) {
    fail('INVALID_EXCLUDE_IDS', 'excludeIds는 최대 100개의 문자열 배열이어야 합니다.');
  }
}

export function validateRefine(refine) {
  if (refine !== null && refine !== undefined && !REFINES.has(refine)) {
    fail('INVALID_REFINE', 'refine 값이 올바르지 않습니다.');
  }
}

export function validateDecision({ category, itemId, context }) {
  if (!['eat', 'wear', 'do'].includes(category)) fail('INVALID_CATEGORY', 'category는 eat, wear, do 중 하나여야 합니다.');
  if (typeof itemId !== 'string' || !itemId || itemId.length > 100) fail('INVALID_ITEM_ID', 'itemId가 올바르지 않습니다.');
  validateContext(context);
}

export function validatePlacesRequest({ category, itemId, radiusKm, location }) {
  if (!['eat', 'wear', 'do'].includes(category)) fail('INVALID_CATEGORY', 'category는 eat, wear, do 중 하나여야 합니다.');
  if (typeof itemId !== 'string' || !itemId || itemId.length > 100) fail('INVALID_ITEM_ID', 'itemId가 올바르지 않습니다.');
  if (radiusKm !== undefined && radiusKm !== null) {
    const radius = Number(radiusKm);
    if (!Number.isFinite(radius) || radius <= 0 || radius > 20) fail('INVALID_RADIUS', 'radiusKm는 0보다 크고 20 이하여야 합니다.');
  }
  if (location !== undefined && location !== null) {
    const lat = Number(location?.lat);
    const lng = Number(location?.lng);
    if (!isPlainObject(location) || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      fail('INVALID_LOCATION', 'location은 { lat, lng } 숫자 좌표여야 합니다.');
    }
  }
}

export function validateQuizAnswers({ category, answers }) {
  if (!['eat', 'wear', 'do'].includes(category)) fail('INVALID_CATEGORY', 'category는 eat, wear, do 중 하나여야 합니다.');
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > 7) fail('INVALID_QUIZ', 'answers는 1~7개의 배열이어야 합니다.');
  for (const answer of answers) {
    if (!isPlainObject(answer) || !Array.isArray(answer.options) || answer.options.length < 2 || answer.options.length > 3
      || answer.options.some((id) => typeof id !== 'string' || !id || id.length > 100)) {
      fail('INVALID_QUIZ', '각 답은 { options: [itemId 2~3개], pick: itemId | null } 형식이어야 합니다.');
    }
    if (answer.pick !== null && answer.pick !== undefined && !answer.options.includes(answer.pick)) {
      fail('INVALID_QUIZ', 'pick은 options 중 하나이거나 null 이어야 합니다.');
    }
  }
}

export function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
    fail('INVALID_MESSAGES', 'messages는 1~20개의 배열이어야 합니다.');
  }
  for (const message of messages) {
    if (!isPlainObject(message) || !MESSAGE_ROLES.has(message.role)
      || typeof message.content !== 'string' || !message.content.trim() || message.content.length > 2_000) {
      fail('INVALID_MESSAGES', '각 메시지는 user 또는 assistant 역할과 2000자 이내 내용을 가져야 합니다.');
    }
  }
  if (messages.at(-1).role !== 'user') fail('INVALID_MESSAGES', '마지막 메시지는 사용자 메시지여야 합니다.');
}
