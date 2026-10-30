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

// 항목 id → 검색어·장소 종류·카테고리 필터. null 은 집에서 하는 활동이라 지도를 생략한다.
// altKeywords 는 결과가 적은 항목을 위해 같은 조건으로 추가 검색해 합치는 보조 검색어다.
// Kakao 키워드 검색은 이름·메뉴까지 느슨하게 맞추므로(비빔밥 → 짬뽕집), match 로 카테고리 경로를 한 번 더 거른다.
// 검색어와 필터는 상남시장 반경 2km 실제 결과를 보고 고른 값이다.
// 옷(wear) 항목은 장소가 없으므로 표에 두지 않고 type 으로 걸러낸다.
export const PLACE_SEARCH_BY_ID = {
  // 뭐 먹지
  'soup-rice': { keyword: '순두부찌개', group: FOOD, match: '한식|두부|찌개' },
  pasta: { keyword: '이탈리안', group: FOOD, match: '양식|이탈리안|파스타' },
  sushi: { keyword: '초밥', group: FOOD, match: '초밥|회|일식' },
  tteokbokki: { keyword: '떡볶이', group: FOOD, match: '떡볶이|분식' },
  'mapo-tofu': { keyword: '마파두부', group: FOOD, match: '중식|중국' },
  bibimbap: { keyword: '비빔밥', group: FOOD, match: '한식' },
  udon: { keyword: '우동', group: FOOD, match: '우동|일식' },
  sandwich: { keyword: '샌드위치', group: null, match: '샌드위치|샐러드|브런치|카페|베이커리' },
  gimbap: { keyword: '김밥', group: FOOD, match: '김밥|분식' },
  'kimchi-stew': { keyword: '김치찌개', group: FOOD, match: '한식|찌개' },
  'bulgogi-bowl': { keyword: '불고기', group: FOOD, match: '한식|고기' },
  samgyetang: { keyword: '삼계탕', group: FOOD, match: '한식|삼계탕|닭' },
  naengmyeon: { keyword: '냉면', group: FOOD, match: '한식|냉면' },
  kalguksu: { keyword: '칼국수', group: FOOD, match: '한식|칼국수|국수' },
  jeyuk: { keyword: '제육볶음', group: FOOD, match: '한식' },
  gukbap: { keyword: '국밥', group: FOOD, match: '한식|국밥' },
  dakgalbi: { keyword: '닭갈비', group: FOOD, match: '한식|닭|고기' },
  chicken: { keyword: '치킨', group: FOOD, match: '치킨' },
  steak: { keyword: '스테이크', group: FOOD, match: '양식|스테이크' },
  pizza: { keyword: '피자', group: FOOD, match: '피자|양식' },
  risotto: { keyword: '이탈리안', group: FOOD, match: '양식|이탈리안' },
  burger: { keyword: '수제버거', group: FOOD, match: '햄버거|버거|양식' },
  brunch: { keyword: '브런치', group: FOOD, match: '브런치|양식|카페' },
  'cream-pasta': { keyword: '파스타', group: FOOD, match: '양식|이탈리안|파스타' },
  jjajang: { keyword: '짜장면', group: FOOD, match: '중식|중국' },
  jjamppong: { keyword: '짬뽕', group: FOOD, match: '중식|중국' },
  tangsuyuk: { keyword: '탕수육', group: FOOD, match: '중식|중국' },
  yangkkochi: { keyword: '양꼬치', group: FOOD, match: '양꼬치|중식' },
  dimsum: { keyword: '딤섬', group: FOOD, match: '중식|중국|딤섬' },
  ramen: { keyword: '라멘', group: FOOD, match: '일식|라멘' },
  donkatsu: { keyword: '돈까스', group: FOOD, match: '돈까스|일식' },
  sashimi: { keyword: '횟집', group: FOOD, match: '회|일식|해물' },
  'japanese-curry': { keyword: '카레', group: FOOD, match: '카레|일식' },
  ramyeon: { keyword: '분식', group: FOOD, match: '분식' },
  'sundae-tteok': { keyword: '순대', group: FOOD, match: '분식|순대' },
  poke: { keyword: '포케', group: FOOD, match: '샐러드|포케' },
  'chicken-salad': { keyword: '샐러드', group: FOOD, match: '샐러드' },
  'grain-bowl': { keyword: '샐러드', group: FOOD, match: '샐러드' },
  'cake-latte': { keyword: '디저트카페', group: null, match: '카페|디저트|케이크' },
  bingsu: { keyword: '빙수', group: null, match: '빙수|카페|디저트' },
  croissant: { keyword: '크루아상', group: null, match: '베이커리|제과|카페' },
  // 뭐 하지 — 밖에서
  walk: { keyword: '공원', group: null, match: '공원|광장|호수|산책|하천' },
  riverside: { keyword: '하천', group: null, match: '하천|천|공원|산책' },
  'night-walk': { keyword: '공원', group: null, match: '공원|광장|호수|전망' },
  bike: { keyword: '자전거대여', altKeywords: ['누비자'], group: null, match: '자전거대여|공원' }, // 누비자: 창원 공공자전거
  hike: { keyword: '등산로', altKeywords: ['산'], group: null, match: '등산|명소 > 산' }, // 상남동 2km 안엔 없고 3km 부터 비음산이 잡힌다
  run: { keyword: '공원', group: null, match: '공원|운동장|트랙' },
  gym: { keyword: '헬스장', group: null, match: '헬스|피트니스' },
  swim: { keyword: '수영장', group: null, match: '수영' },
  climbing: { keyword: '클라이밍', group: null, match: '클라이밍|암벽' },
  badminton: { keyword: '체육관', altKeywords: ['배드민턴'], group: null, match: '스포츠시설 > 체육관|배드민턴장' },
  'dessert-cafe': { keyword: '디저트카페', group: null, match: '카페|디저트' },
  library: { keyword: '도서관', group: null, match: '도서관' },
  concert: { keyword: '공연장', group: null, match: '공연|극장|소극장|라이브' },
  arcade: { keyword: '오락실', group: null, match: '오락실|게임' },
  'board-game': { keyword: '보드게임카페', group: null, match: '보드카페|보드게임|테마카페' }, // Kakao 분류는 "여가시설 > 보드카페"
  'escape-room': { keyword: '방탈출', group: null, match: '방탈출|테마카페' }, // Kakao 분류는 "카페 > 테마카페"
  'photo-booth': { keyword: '즉석사진', group: null, match: '사진|포토' },
  stationery: { keyword: '문구점', group: null, match: '문구|팬시' },
  flower: { keyword: '꽃집', group: null, match: '꽃' },
  'market-tour': { keyword: '전통시장', group: null, match: '시장' },
  exhibition: { keyword: '미술관', altKeywords: ['전시관'], group: CULTURE, match: '미술관|갤러리|전시' },
  'book-cafe': { keyword: '북카페', group: CAFE, match: '북카페|카페|도서관|서점' },
  market: { keyword: '빵집', group: FOOD, match: '베이커리|제과|빵' }, // 빵집은 카페(CE7)가 아니라 음식점>간식 으로 분류된다
  // 상남동엔 "백화점" 경로가 1곳뿐이라 대형마트를 보조 검색어로 합친다. 인터넷쇼핑몰(통신판매)은 제외.
  'window-shopping': { keyword: '백화점', altKeywords: ['대형마트'], group: null, match: '백화점|쇼핑,유통|대형마트|아울렛' },
  karaoke: { keyword: '노래방', group: null, match: '노래' },
  cinema: { keyword: '영화관', group: CULTURE, match: '영화' },
  bowling: { keyword: '볼링장', group: null, match: '볼링' },
  // 뭐 하지 — 집에서
  'home-tea': null,
  workout: null,
  movie: null,
  playlist: null,
  stretch: null,
  cook: null,
  journaling: null,
  bath: null,
  puzzle: null,
  game: null,
  baking: null,
  plant: null,
  yoga: null,
  nap: null,
  'meal-prep': null,
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
    categoryPath: doc.category_name ?? '',
    address: doc.road_address_name || doc.address_name || '',
    phone: doc.phone || null,
    lat: Number(doc.y),
    lng: Number(doc.x),
    distanceM: doc.distance === undefined || doc.distance === '' ? null : Number(doc.distance),
    mapUrl: doc.place_url,
  };
}

// Kakao Local 키워드 검색. REST 키는 서버 환경변수로만 둔다.
// 반환: { places, isEnd }. isEnd 가 false 면 같은 조건으로 page+1 을 더 받을 수 있다(최대 3페이지).
export function createKakaoProvider({ apiKey = process.env.KAKAO_REST_KEY, fetchImpl = fetch } = {}) {
  if (!apiKey) return null;
  return async ({ keyword, group, center, radiusM, size, page = 1 }) => {
    const url = new URL(KAKAO_KEYWORD_URL);
    url.search = new URLSearchParams({
      query: keyword,
      x: String(center.lng),
      y: String(center.lat),
      radius: String(radiusM),
      sort: 'distance',
      size: String(size),
      page: String(page),
      ...(group ? { category_group_code: group } : {}),
    }).toString();
    const res = await fetchImpl(url, {
      headers: { Authorization: `KakaoAK ${apiKey}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Kakao Local 응답 ${res.status}`);
    const body = await res.json();
    return { places: (body.documents ?? []).map(toPlace), isEnd: body.meta?.is_end !== false };
  };
}

const MAX_PAGES = 3; // Kakao 키워드 검색 page 상한

// 제공자를 페이지 단위로 호출해 필터를 통과한 장소가 limit 만큼 모일 때까지 모은다.
async function collectPlaces(provider, params, matcher, limit) {
  const collected = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await provider({ ...params, page });
    const batch = Array.isArray(result) ? { places: result, isEnd: true } : result;
    // 이름은 보지 않는다. "CU 상남공원점"·"과일백화점" 같은 상호가 공원·백화점 필터를 통과하기 때문이다.
    collected.push(...batch.places.filter((place) => !matcher || matcher.test(place.categoryPath ?? '')));
    if (collected.length >= limit || batch.isEnd) break;
  }
  return collected;
}

const defaultCache = new Map();

function searchKeywords(search) {
  return [search.keyword, ...(search.altKeywords ?? [])];
}

function cacheKey(search, center, radiusKm) {
  return [searchKeywords(search).join('+'), search.group ?? '', search.match ?? '', center.lat.toFixed(3), center.lng.toFixed(3), radiusKm].join('|');
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
    const matcher = search.match ? new RegExp(search.match) : null;
    const seen = new Set();
    const places = [];
    for (const keyword of searchKeywords(search)) {
      const params = { keyword, group: search.group, center, radiusM, size: PROVIDER_PAGE_SIZE };
      for (const place of await collectPlaces(provider, params, matcher, limit)) {
        if (seen.has(place.id)) continue;
        seen.add(place.id);
        places.push(place);
      }
    }
    places.sort((a, b) => (a.distanceM ?? Infinity) - (b.distanceM ?? Infinity));
    const inRadius = places.filter((place) => place.distanceM === null || place.distanceM <= radiusM);
    cache.set(key, { expires: now() + CACHE_TTL_MS, places: inRadius });
    return { ...base, places: inRadius.slice(0, limit), source: 'live' };
  } catch (err) {
    console.warn(`[places] 검색 실패: ${err.message}`);
    return { ...base, source: 'error' };
  }
}
