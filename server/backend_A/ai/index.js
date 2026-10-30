// 백엔드 A 공개 인터페이스. 백엔드 B는 이 파일만 import 한다.
export { generateRules, resolveRulesProvider } from './generateRules.js';
export { recommend } from './recommend.js';
export { applyFeedback } from './feedback.js';
export { normalizeItem } from './contract.js';
export { chat } from './chat.js';
export { findPlaces, placeSearchFor, resolveSearchLocation, clampRadiusKm } from './places.js';
export { PREFERENCE_DIMENSIONS, applyPreferences, preferenceSchema, sanitizePreferences } from './preferences.js';
