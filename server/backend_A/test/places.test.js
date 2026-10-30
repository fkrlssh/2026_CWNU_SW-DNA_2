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

const place = (id, distanceM) => ({ id, name: `가게 ${id}`, category: '한식', address: '주소', phone: null, lat: 35.22, lng: 128.68, distanceM, mapUrl: `https://place.map.kakao.com/${id}` });

function fakeProvider(results) {
  const calls = [];
  const provider = async (params) => { calls.push(params); return results; };
  return { provider, calls };
}

test('음식과 활동 항목은 모두 검색어 표에 결정이 있다 (null 포함)', () => {
  for (const category of ['eat', 'do']) {
    for (const item of CATALOG[category]) assert.ok(item.id in PLACE_SEARCH_BY_ID, `${item.id} 검색어 미정`);
  }
  assert.equal(placeSearchFor(knit), null, '옷은 지도 없음');
  assert.equal(placeSearchFor(homeTea), null, '집에서 하는 활동은 지도 없음');
  assert.deepEqual(placeSearchFor(soup), { keyword: '순두부찌개', group: 'FD6' });
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
  assert.deepEqual(calls[0], { keyword: '순두부찌개', group: 'FD6', center: { ...DEFAULT_CENTER, source: 'fixed' }, radiusM: 2000, size: 15 });
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
    return new Response(JSON.stringify({ documents: [{
      id: '77', place_name: '상남 순두부', category_name: '음식점 > 한식 > 두부전문점', phone: '055-1234',
      address_name: '지번', road_address_name: '마디미서로 1', x: '128.6840', y: '35.2225', place_url: 'https://place.map.kakao.com/77', distance: '120',
    }] }), { status: 200 });
  };
  const provider = createKakaoProvider({ apiKey: 'test-key', fetchImpl });
  const places = await provider({ keyword: '순두부찌개', group: 'FD6', center: DEFAULT_CENTER, radiusM: 2000, size: 15 });
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
    id: '77', name: '상남 순두부', category: '두부전문점', address: '마디미서로 1', phone: '055-1234',
    lat: 35.2225, lng: 128.684, distanceM: 120, mapUrl: 'https://place.map.kakao.com/77',
  }]);
  assert.equal(createKakaoProvider({ apiKey: '' }), null, '키가 없으면 제공자 없음');
});
