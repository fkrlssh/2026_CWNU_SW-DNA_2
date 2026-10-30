import { createHash } from 'node:crypto';
import { CATALOG } from '../data.js';
import {
  applyFeedback,
  applyPreferences,
  chat,
  findPlaces,
  generateRules,
  normalizeItem,
  recommend,
  resolveRulesProvider,
  sanitizePreferences,
} from './backend_A/ai/index.js';

const budgetByLabel = {
  '아껴 쓰는 편': 'low',
  저렴: 'low',
  보통: 'mid',
  '조금 여유롭게': 'high',
  여유: 'high',
};
const moodByLabel = { 좋음: 'good', 피곤: 'tired', 우울: 'sad' };
const timeByLabel = { '10분': '10', '1시간': '60', 반나절: '180' };
const modeByLabel = {
  배달: 'delivery', 외식: 'out', '출근·약속': 'out', '편한 외출': 'out',
  '가벼운 외출': 'out', 문화생활: 'out', 집밥: 'home', 집콕: 'home', 집에서: 'home',
};
const withByLabel = { 혼자: 'alone', 같이: 'friend' };

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

export function normalizeProfile(profile = {}) {
  return {
    foods: profile.foods ?? profile.food ?? [],
    styles: profile.styles ?? profile.style ?? [],
    activities: profile.activities ?? profile.activity ?? [],
    budget: budgetByLabel[profile.budget] ?? budgetByLabel[profile.budgetRange] ?? 'mid',
    radiusKm: Number(profile.radiusKm) || 3,
    allergies: Array.isArray(profile.allergies) ? profile.allergies : [],
    dislikes: Array.isArray(profile.dislikes) ? profile.dislikes : [],
    noveltyPref: profile.noveltyPref === 'new' ? 'new' : 'familiar',
    // 취향 축 슬라이더 값. 규칙 생성에는 쓰지 않고 추천 시점에 덧씌운다(바꿔도 AI 재생성 없음).
    preferences: sanitizePreferences(profile.preferences),
  };
}

// 규칙 재생성 여부를 정하는 해시. preferences 는 덧씌우기라 제외한다.
export function profileHash(profile = {}) {
  const { preferences, ...answers } = normalizeProfile(profile);
  return createHash('sha256').update(JSON.stringify(canonicalize(answers))).digest('hex');
}

// 프로필의 슬라이더 값을 규칙에 덧씌운다. 추천·챗봇이 공통으로 쓴다.
export function rulesForProfile(rules, profile = {}) {
  return applyPreferences(rules, sanitizePreferences(profile.preferences));
}

export function normalizeContext(context = {}) {
  return {
    ...(context.mood ? { mood: moodByLabel[context.mood] ?? context.mood } : {}),
    ...(context.budget ? { budget: budgetByLabel[context.budget] ?? context.budget } : {}),
    ...(context.time ? { time: timeByLabel[context.time] ?? context.time } : {}),
    ...(context.mode ? { mode: modeByLabel[context.mode] ?? context.mode } : {}),
    ...(context.weather ? { weather: context.weather } : {}),
    ...(context.with ? { with: withByLabel[context.with] ?? context.with } : {}),
  };
}

// 규칙 생성 제공자 이름: api(OpenAI 직접 호출) · codex(Codex CLI) · fallback(AI 없음)
export function rulesProviderName() {
  return resolveRulesProvider().name;
}

// allowAi=false 면 AI 제공자를 쓰지 않고 폴백 규칙을 만든다.
export async function createRules(profile = {}, { allowAi = true } = {}) {
  const { preferences, ...answers } = normalizeProfile(profile);
  const provider = allowAi ? resolveRulesProvider() : { name: 'fallback', run: null };
  return generateRules(answers, { run: provider.run, source: provider.name });
}

export function recommendWithRules({ rules, category, context = {}, excludeIds = [], refine = null }) {
  const catalog = (CATALOG[category] || []).map((item) => normalizeItem(item, category));
  return recommend({
    rules,
    context: normalizeContext(context),
    catalog,
    excludeIds: Array.isArray(excludeIds) ? excludeIds : [],
    refine,
  });
}

// 챗봇은 카테고리를 스스로 고르므로 전체 카탈로그를 넘긴다.
export function fullCatalog() {
  return Object.entries(CATALOG).flatMap(([category, items]) => items.map((item) => normalizeItem(item, category)));
}

export function chatWithRules({ rules, messages, context = {}, excludeIds = [], onDelta, onStatus }) {
  return chat({
    rules,
    messages,
    catalog: fullCatalog(),
    context: normalizeContext(context),
    excludeIds: Array.isArray(excludeIds) ? excludeIds : [],
    onDelta,
    onStatus,
  });
}

// 추천 항목 근처의 실제 장소. radiusKm 우선순위: 요청값 → 온보딩 반경(rules.hard.radius_km) → PLACES_RADIUS_KM
export function placesForItem({ rules, category, itemId, radiusKm, location }) {
  const item = findCatalogItem(category, itemId);
  if (!item) return null;
  return findPlaces({
    item: normalizeItem(item, category),
    radiusKm: radiusKm ?? rules?.hard?.radius_km,
    location,
  });
}

export function applyFeedbackToRules(rules, category, itemId, rating) {
  const item = findCatalogItem(category, itemId);
  if (!item) throw new Error('피드백 대상 카탈로그 항목이 없습니다.');
  return applyFeedback(rules, normalizeItem(item, category), rating);
}

export function findCatalogItem(category, itemId) {
  return (CATALOG[category] || []).find((item) => item.id === itemId) || null;
}
