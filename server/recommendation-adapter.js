import { createHash } from 'node:crypto';
import { CATALOG } from '../data.js';
import {
  applyFeedback,
  chat,
  generateRules,
  normalizeItem,
  recommend,
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
  '가벼운 외출': 'out', 문화생활: 'out', 집밥: 'home', 집콕: 'home',
};

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
  };
}

export function profileHash(profile = {}) {
  return createHash('sha256').update(JSON.stringify(canonicalize(normalizeProfile(profile)))).digest('hex');
}

export function normalizeContext(context = {}) {
  return {
    ...(context.mood ? { mood: moodByLabel[context.mood] ?? context.mood } : {}),
    ...(context.budget ? { budget: budgetByLabel[context.budget] ?? context.budget } : {}),
    ...(context.time ? { time: timeByLabel[context.time] ?? context.time } : {}),
    ...(context.mode ? { mode: modeByLabel[context.mode] ?? context.mode } : {}),
    ...(context.weather ? { weather: context.weather } : {}),
    ...(context.with ? { with: context.with } : {}),
  };
}

export async function createRules(profile = {}) {
  const answers = normalizeProfile(profile);
  if (process.env.CODEX_ENABLED === 'true') return generateRules(answers);
  return generateRules(answers, {
    run: async () => { throw new Error('CODEX_ENABLED가 true가 아니므로 폴백 규칙을 사용합니다.'); },
  });
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

export function chatWithRules({ rules, messages, context = {}, excludeIds = [], onDelta }) {
  return chat({
    rules,
    messages,
    catalog: fullCatalog(),
    context: normalizeContext(context),
    excludeIds: Array.isArray(excludeIds) ? excludeIds : [],
    onDelta,
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
