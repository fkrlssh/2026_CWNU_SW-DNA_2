// 추천 항목 → 근처 실제 장소 검색. 카탈로그 항목은 "종류"라서 항목별 검색어로 Kakao Local 을 조회한다.
// 위치는 기본적으로 고정 좌표(상남시장)를 쓰고, PLACES_LOCATION_MODE=user 일 때만 요청 좌표를 쓴다.

const KAKAO_KEYWORD_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';
const TIMEOUT_MS = Number(process.env.PLACES_TIMEOUT_MS ?? 5_000);
const CACHE_TTL_MS = 10 * 60 * 1000;
const PROVIDER_PAGE_SIZE = 15; // Kakao 최대
const DEFAULT_LIMIT = 3;
export const MIN_RADIUS_KM = 0.3;
export const MAX_RADIUS_KM = 20; // Kakao radius 상한 20,000m
export const DEFAULT_RADIUS_KM = 2;

// 경남 창원시 성산구 상남동 상남시장 (마디미서로). 데모 기준 위치.
export const DEFAULT_CENTER = { lat: 35.2222, lng: 128.6834, label: '상남시장' };

// Kakao Local 카테고리 그룹 코드. null 이면 그룹 제한 없이 검색어만 쓴다.
const FOOD = 'FD6';
const CAFE = 'CE7';
const CULTURE = 'CT1';
const SIGHT = 'AT4';

// 항목 id → 검색어·장소 종류. null 은 집에서 하는 활동이라 지도를 생략한다.
// 옷(wear) 항목은 장소가 없으므로 표에 두지 않고 type 으로 걸러낸다.
export const PLACE_SEARCH_BY_ID = {
  // 뭐 먹지
  'soup-rice': { keyword: '순두부찌개', group: FOOD },
  pasta: { keyword: '파스타', group: FOOD },
  sushi: { keyword: '초밥', group: FOOD },
  tteokbokki: { keyword: '떡볶이', group: FOOD },
  'mapo-tofu': { keyword: '마파두부', group: FOOD },
  bibimbap: { keyword: '비빔밥', group: FOOD },
  udon: { keyword: '우동', group: FOOD },
  sandwich: { keyword: '샌드위치', group: null }, // 카페로 분류되는 곳이 많아 그룹 제한 없음
  gimbap: { keyword: '김밥', group: FOOD },
  // 뭐 하지 — 밖에서
  walk: { keyword: '공원', group: SIGHT },
  exhibition: { keyword: '미술관', group: CULTURE },
  'book-cafe': { keyword: '북카페', group: CAFE },
  market: { keyword: '베이커리', group: CAFE },
  'window-shopping': { keyword: '쇼핑몰', group: null },
  karaoke: { keyword: '노래방', group: null },
  cinema: { keyword: '영화관', group: CULTURE },
  bowling: { keyword: '볼링장', group: null },
  // 뭐 하지 — 집에서
  'home-tea': null,
  workout: null,
  movie: null,
  playlist: null,
  stretch: null,
  cook: null,
};

function isValidCoordinate(location) {
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

// 검색 중심. fixed 모드(기본)에서는 요청 좌표를 무시해 데모 결과가 항상 같게 한다.
export function resolveSearchLocation(requested, env = process.env) {
  const fixed = {
    lat: Number(env.PLACES_CENTER_LAT) || DEFAULT_CENTER.lat,
    lng: Number(env.PLACES_CENTER_LNG) || DEFAULT_CENTER.lng,
    label: env.PLACES_CENTER_LABEL || DEFAULT_CENTER.label,
  };
  if ((env.PLACES_LOCATION_MODE ?? 'fixed') === 'user' && isValidCoordinate(requested)) {
    return { lat: Number(requested.lat), lng: Number(requested.lng), label: '현재 위치', source: 'user' };
  }
  return { ...fixed, source: 'fixed' };
}

export function clampRadiusKm(value, fallback = DEFAULT_RADIUS_KM) {
  const radius = Number(value);
  if (!Number.isFinite(radius) || radius <= 0) return fallback;
  return Math.min(MAX_RADIUS_KM, Math.max(MIN_RADIUS_KM, radius));
}

// 항목의 검색 조건. 카탈로그 항목이 placeSearch 를 직접 가지면 그것을 우선한다.
export function placeSearchFor(item) {
  if (item.placeSearch !== undefined) return item.placeSearch;
  if (item.type === 'wear') return null;
  return PLACE_SEARCH_BY_ID[item.id] ?? null;
}

function toPlace(doc) {
  return {
    id: doc.id,
    name: doc.place_name,
    category: doc.category_name?.split(' > ').pop() ?? '',
    address: doc.road_address_name || doc.address_name || '',
    phone: doc.phone || null,
    lat: Number(doc.y),
    lng: Number(doc.x),
    distanceM: doc.distance === undefined || doc.distance === '' ? null : Number(doc.distance),
    mapUrl: doc.place_url,
  };
}

// Kakao Local 키워드 검색. REST 키는 서버 환경변수로만 둔다.
export function createKakaoProvider({ apiKey = process.env.KAKAO_REST_KEY, fetchImpl = fetch } = {}) {
  if (!apiKey) return null;
  return async ({ keyword, group, center, radiusM, size }) => {
    const url = new URL(KAKAO_KEYWORD_URL);
    url.search = new URLSearchParams({
      query: keyword,
      x: String(center.lng),
      y: String(center.lat),
      radius: String(radiusM),
      sort: 'distance',
      size: String(size),
      ...(group ? { category_group_code: group } : {}),
    }).toString();
    const res = await fetchImpl(url, {
      headers: { Authorization: `KakaoAK ${apiKey}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Kakao Local 응답 ${res.status}`);
    const body = await res.json();
    return (body.documents ?? []).map(toPlace);
  };
}

const defaultCache = new Map();

function cacheKey(search, center, radiusKm) {
  return [search.keyword, search.group ?? '', center.lat.toFixed(3), center.lng.toFixed(3), radiusKm].join('|');
}

// 응답의 source: live(검색함) · cache(재사용) · none(지도 없는 항목) · unavailable(키 없음) · error(검색 실패)
// 어느 경우든 places 는 배열이라 프론트는 길이로만 지도 표시 여부를 정하면 된다.
export async function findPlaces({
  item,
  location,
  radiusKm,
  limit = DEFAULT_LIMIT,
  provider = createKakaoProvider(),
  env = process.env,
  cache = defaultCache,
  now = Date.now,
}) {
  const search = placeSearchFor(item);
  const center = resolveSearchLocation(location, env);
  const radius = clampRadiusKm(radiusKm, clampRadiusKm(env.PLACES_RADIUS_KM, DEFAULT_RADIUS_KM));
  const base = { keyword: search?.keyword ?? null, center, radiusKm: radius, places: [] };

  if (!search) return { ...base, source: 'none' };
  if (!provider) return { ...base, source: 'unavailable' };

  const key = cacheKey(search, center, radius);
  const hit = cache.get(key);
  if (hit && hit.expires > now()) return { ...base, places: hit.places.slice(0, limit), source: 'cache' };

  try {
    const radiusM = Math.round(radius * 1000);
    const found = await provider({ keyword: search.keyword, group: search.group, center, radiusM, size: PROVIDER_PAGE_SIZE });
    const places = found
      .filter((place) => place.distanceM === null || place.distanceM <= radiusM)
      .sort((a, b) => (a.distanceM ?? Infinity) - (b.distanceM ?? Infinity));
    cache.set(key, { expires: now() + CACHE_TTL_MS, places });
    return { ...base, places: places.slice(0, limit), source: 'live' };
  } catch (err) {
    console.warn(`[places] 검색 실패: ${err.message}`);
    return { ...base, source: 'error' };
  }
}
