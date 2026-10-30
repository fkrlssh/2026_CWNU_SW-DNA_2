import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATALOG } from '../../../data.js';
import { normalizeItem } from '../ai/index.js';
import {
  DEFAULT_CENTER, MAX_RADIUS_KM, MIN_RADIUS_KM, PLACE_SEARCH_BY_ID,
  clampRadiusKm, createKakaoProvider, findPlaces, placeSearchFor, resolveSearchLocation,
} from '../ai/places.js';

const fixedEnv = {};
const userEnv = { PLACES_LOCATION_MODE: 'user' };
const soup = normalizeItem(CATALOG.eat.find((item) => item.id === 'soup-rice'), 'eat');
const homeTea = normalizeItem(CATALOG.do.find((item) => item.id === 'home-tea'), 'do');
const knit = normalizeItem(CATALOG.wear[0], 'wear');

const place = (id, distanceM, categoryPath = '음식점 > 한식 > 두부전문점') => ({ id, name: `가게 ${id}`, category: categoryPath.split(' > ').pop(), categoryPath, address: '주소', phone: null, lat: 35.22, lng: 128.68, distanceM, mapUrl: `https://place.map.kakao.com/${id}` });

// 배열을 주면 1페이지짜리 결과, 배열의 배열을 주면 페이지별 결과
function fakeProvider(results) {
  const calls = [];
  const pages = Array.isArray(results[0]) ? results : [results];
  const provider = async (params) => {
    calls.push(params);
    const index = (params.page ?? 1) - 1;
    return { places: pages[index] ?? [], isEnd: index >= pages.length - 1 };
  };
  return { provider, calls };
}

test('음식과 활동 항목은 모두 검색어 표에 결정이 있다 (null 포함)', () => {
  for (const category of ['eat', 'do']) {
    for (const item of CATALOG[category]) assert.ok(item.id in PLACE_SEARCH_BY_ID, `${item.id} 검색어 미정`);
  }
  assert.equal(placeSearchFor(knit), null, '옷은 지도 없음');
  assert.equal(placeSearchFor(homeTea), null, '집에서 하는 활동은 지도 없음');
  assert.deepEqual(placeSearchFor(soup), { keyword: '순두부찌개', group: 'FD6', match: '한식|두부|찌개' });
  for (const [id, search] of Object.entries(PLACE_SEARCH_BY_ID)) {
    if (search?.match) assert.doesNotThrow(() => new RegExp(search.match), `${id} 의 match 가 정규식이 아님`);
  }
});

test('findPlaces: 카테고리 필터에 안 맞는 곳(비빔밥 검색의 짬뽕집)은 빼고 다음 페이지에서 더 모은다', async () => {
  const bibimbap = normalizeItem(CATALOG.eat.find((item) => item.id === 'bibimbap'), 'eat');
  const { provider, calls } = fakeProvider([
    [place('zzam', 2, '음식점 > 중식 > 중국요리'), place('k1', 50, '음식점 > 한식 > 기막힌밥상'), place('tuna', 69, '음식점 > 일식 > 참치회')],
    [place('k2', 300, '음식점 > 한식'), place('k3', 400, '음식점 > 한식 > 국밥')],
  ]);
  const result = await findPlaces({ item: bibimbap, radiusKm: 2, provider, env: fixedEnv, cache: new Map() });
  assert.deepEqual(result.places.map((p) => p.id), ['k1', 'k2', 'k3']);
  assert.deepEqual(calls.map((c) => c.page), [1, 2], '필터 뒤 3곳이 안 되면 다음 페이지를 받는다');
});

test('findPlaces: 보조 검색어 결과를 합치고 중복은 한 번만 센다', async () => {
  const shopping = normalizeItem(CATALOG.do.find((item) => item.id === 'window-shopping'), 'do');
  const byKeyword = {
    백화점: [place('plaza', 227, '가정,생활 > 쇼핑,유통 > 백화점'), place('fruit', 53, '가정,생활 > 식품판매 > 과일,채소가게')],
    대형마트: [place('mart', 453, '가정,생활 > 쇼핑,유통 > 대형마트'), place('plaza', 227, '가정,생활 > 쇼핑,유통 > 백화점')],
  };
  const calls = [];
  const provider = async (params) => { calls.push(params.keyword); return { places: byKeyword[params.keyword] ?? [], isEnd: true }; };
  const result = await findPlaces({ item: shopping, radiusKm: 2, provider, env: fixedEnv, cache: new Map() });
  assert.deepEqual(calls, ['백화점', '대형마트']);
  assert.deepEqual(result.places.map((p) => p.id), ['plaza', 'mart'], '과일가게는 필터로 빠지고 거리순, 중복 없음');
  assert.equal(result.keyword, '백화점', '응답의 keyword 는 대표 검색어');
});

test('findPlaces: 첫 페이지에서 3곳이 채워지면 더 받지 않는다', async () => {
  const { provider, calls } = fakeProvider([
    [place('a', 10), place('b', 20), place('c', 30), place('d', 40)],
    [place('e', 50)],
  ]);
  const result = await findPlaces({ item: soup, radiusKm: 2, provider, env: fixedEnv, cache: new Map() });
  assert.equal(result.places.length, 3);
  assert.equal(calls.length, 1);
});

test('기본(fixed) 모드는 요청 좌표를 무시하고 상남시장에서 검색한다', () => {
  const center = resolveSearchLocation({ lat: 37.5, lng: 127.0 }, fixedEnv);
  assert.deepEqual(center, { ...DEFAULT_CENTER, source: 'fixed' });
});

test('user 모드는 유효한 좌표만 쓰고 아니면 고정 좌표로 돌아간다', () => {
  assert.equal(resolveSearchLocation({ lat: 37.5, lng: 127.0 }, userEnv).source, 'user');
  assert.equal(resolveSearchLocation({ lat: 'x' }, userEnv).source, 'fixed');
  assert.equal(resolveSearchLocation(undefined, userEnv).source, 'fixed');
});

test('고정 좌표는 환경변수로 바꿀 수 있다', () => {
  const center = resolveSearchLocation(null, { PLACES_CENTER_LAT: '35.1', PLACES_CENTER_LNG: '128.9', PLACES_CENTER_LABEL: '창원대' });
  assert.deepEqual(center, { lat: 35.1, lng: 128.9, label: '창원대', source: 'fixed' });
});

test('반경은 0.3~20km 로 제한되고 잘못된 값은 기본값을 쓴다', () => {
  assert.equal(clampRadiusKm(0.1), MIN_RADIUS_KM);
  assert.equal(clampRadiusKm(50), MAX_RADIUS_KM);
  assert.equal(clampRadiusKm('abc', 3), 3);
  assert.equal(clampRadiusKm(1.5), 1.5);
});

test('findPlaces: 검색어·그룹·반경(m)을 제공자에 넘기고 거리순 3곳을 돌려준다', async () => {
  const { provider, calls } = fakeProvider([place('c', 900), place('a', 100), place('far', 5000), place('b', 400), place('d', 1500)]);
  const result = await findPlaces({ item: soup, radiusKm: 2, provider, env: fixedEnv, cache: new Map() });
  assert.deepEqual(calls[0], { keyword: '순두부찌개', group: 'FD6', center: { ...DEFAULT_CENTER, source: 'fixed' }, radiusM: 2000, size: 15, page: 1 });
  assert.equal(result.source, 'live');
  assert.deepEqual(result.places.map((p) => p.id), ['a', 'b', 'c'], '반경 밖(far)은 빠지고 거리순');
  assert.equal(result.radiusKm, 2);
  assert.equal(result.keyword, '순두부찌개');
});

test('findPlaces: 같은 조건은 캐시에서 재사용하고 반경이 다르면 다시 검색한다', async () => {
  const { provider, calls } = fakeProvider([place('a', 100)]);
  const cache = new Map();
  await findPlaces({ item: soup, radiusKm: 2, provider, env: fixedEnv, cache });
  const again = await findPlaces({ item: soup, radiusKm: 2, provider, env: fixedEnv, cache });
  assert.equal(again.source, 'cache');
  assert.equal(calls.length, 1);
  await findPlaces({ item: soup, radiusKm: 5, provider, env: fixedEnv, cache });
  assert.equal(calls.length, 2);
});

test('findPlaces: 지도 없는 항목·키 없음·검색 실패는 빈 배열과 source 로 알린다', async () => {
  const { provider } = fakeProvider([place('a', 100)]);
  assert.equal((await findPlaces({ item: homeTea, provider, env: fixedEnv, cache: new Map() })).source, 'none');
  assert.equal((await findPlaces({ item: knit, provider, env: fixedEnv, cache: new Map() })).source, 'none');
  assert.equal((await findPlaces({ item: soup, provider: null, env: fixedEnv, cache: new Map() })).source, 'unavailable');
  const failing = async () => { throw new Error('429'); };
  const failed = await findPlaces({ item: soup, provider: failing, env: fixedEnv, cache: new Map() });
  assert.equal(failed.source, 'error');
  assert.deepEqual(failed.places, []);
});

test('findPlaces: 반경 기본값은 PLACES_RADIUS_KM 을 따른다', async () => {
  const { provider, calls } = fakeProvider([]);
  await findPlaces({ item: soup, provider, env: { PLACES_RADIUS_KM: '1' }, cache: new Map() });
  assert.equal(calls[0].radiusM, 1000);
});

test('Kakao 제공자: 좌표·반경·그룹을 쿼리로 보내고 응답을 공통 형식으로 바꾼다', async () => {
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url: new URL(url), init };
    return new Response(JSON.stringify({ meta: { is_end: false }, documents: [{
      id: '77', place_name: '상남 순두부', category_name: '음식점 > 한식 > 두부전문점', phone: '055-1234',
      address_name: '지번', road_address_name: '마디미서로 1', x: '128.6840', y: '35.2225', place_url: 'https://place.map.kakao.com/77', distance: '120',
    }] }), { status: 200 });
  };
  const provider = createKakaoProvider({ apiKey: 'test-key', fetchImpl });
  const { places, isEnd } = await provider({ keyword: '순두부찌개', group: 'FD6', center: DEFAULT_CENTER, radiusM: 2000, size: 15, page: 2 });
  assert.equal(isEnd, false);
  assert.equal(captured.url.searchParams.get('page'), '2');
  const q = captured.url.searchParams;
  assert.equal(captured.url.origin + captured.url.pathname, 'https://dapi.kakao.com/v2/local/search/keyword.json');
  assert.equal(q.get('query'), '순두부찌개');
  assert.equal(q.get('x'), String(DEFAULT_CENTER.lng));
  assert.equal(q.get('y'), String(DEFAULT_CENTER.lat));
  assert.equal(q.get('radius'), '2000');
  assert.equal(q.get('category_group_code'), 'FD6');
  assert.equal(q.get('sort'), 'distance');
  assert.equal(captured.init.headers.Authorization, 'KakaoAK test-key');
  assert.deepEqual(places, [{
    id: '77', name: '상남 순두부', category: '두부전문점', categoryPath: '음식점 > 한식 > 두부전문점', address: '마디미서로 1', phone: '055-1234',
    lat: 35.2225, lng: 128.684, distanceM: 120, mapUrl: 'https://place.map.kakao.com/77',
  }]);
  assert.equal(createKakaoProvider({ apiKey: '' }), null, '키가 없으면 제공자 없음');
});
