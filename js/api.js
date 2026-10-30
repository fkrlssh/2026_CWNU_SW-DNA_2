// 모든 데이터 요청을 이 파일 한 곳에 모았어요.
// CONFIG.USE_MOCK이 true면 mock.js의 가짜 서버를, false면 실제 백엔드를 씁니다.
// 서버 응답 모양이 화면과 다른 부분은 이 파일 안에서만 바꿔서 넘겨요. (화면 코드는 그대로)
import { CONFIG } from './config.js';
import { mockApi } from './mock.js';
import { ONBOARDING_STEPS } from './data.js';

/* ───────────── 서버 형식 ↔ 화면 형식 변환 ───────────── */

// 온보딩 '못 먹는 것' 칩 중 알레르기 칩. 나머지(직접 입력)는 '싫은 것(dislikes)'으로 보내요.
const ALLERGY_CHIPS = ONBOARDING_STEPS.find((step) => step.id === 'avoid').choices;
const RADIUS_KM = { '집 근처': 1, '동네 안': 3, '멀리도 좋아요': 10 };

function toServerProfile(profile) {
  const avoid = profile.avoid || [];
  return {
    food: profile.food || [],
    style: profile.style || [],
    activity: profile.activity || [],
    budgetRange: profile.budgetRange || '보통',
    activeTime: profile.activeTime || '저녁형',
    radius: profile.radius || '동네 안',
    radiusKm: RADIUS_KM[profile.radius] || 3,
    allergies: avoid.filter((word) => ALLERGY_CHIPS.includes(word)),
    dislikes: avoid.filter((word) => !ALLERGY_CHIPS.includes(word))
  };
}

function fromServerProfile(answers) {
  if (!answers) return null;
  const radius = answers.radius || Object.keys(RADIUS_KM).find((label) => RADIUS_KM[label] === Number(answers.radiusKm)) || null;
  return {
    food: answers.food || answers.foods || [],
    style: answers.style || answers.styles || [],
    activity: answers.activity || answers.activities || [],
    budgetRange: answers.budgetRange || null,
    activeTime: answers.activeTime || null,
    radius,
    avoid: [...(answers.allergies || []), ...(answers.dislikes || [])]
  };
}

// 서버는 context 값이 모두 '비어 있지 않은 문자열'이어야 받아줘요. (null이면 400)
const MODE_TO_SERVER = { 집에서: '집밥' };
const WITH_TO_SERVER = { 혼자: 'alone', 같이: 'friend' };
function toServerContext(context = {}) {
  const result = {};
  for (const [key, value] of Object.entries(context)) {
    if (typeof value !== 'string' || !value.trim()) continue;
    if (key === 'mode') result.mode = MODE_TO_SERVER[value] || value;
    else if (key === 'with') result.with = WITH_TO_SERVER[value] || value;
    else result[key] = value;
  }
  return result;
}

const WEATHER_TEXT = {
  clear: '맑아요 ☀️ 산책하기 좋은 날이에요',
  cloudy: '조금 흐려요 ☁️ 얇은 겉옷 챙기세요',
  rain: '비 와요 ☔ 우산 챙기세요',
  snow: '눈 와요 ❄️ 따뜻하게 입으세요',
  fog: '안개가 꼈어요 🌫️ 조심히 다니세요',
  storm: '천둥번개가 쳐요 ⛈️ 실내가 좋아요'
};

function fromServerContext(body) {
  return {
    weather: {
      code: body.weather,
      text: WEATHER_TEXT[body.weather] || body.label || '날씨 정보 없음',
      temp: typeof body.temperature === 'number' ? Math.round(body.temperature) : null
    },
    isMock: body.source === 'fallback'
  };
}

const CATEGORY_BY_TYPE = { food: 'eat', wear: 'wear', do: 'do' };

// 서버 추천 결과 { item, reason, score } → 화면용 { ...item, reason, category }
function fromServerItems(items = [], category) {
  return items.map(({ item, reason }) => ({ ...item, reason: reason || item.reason, category: category || CATEGORY_BY_TYPE[item.type] || 'eat' }));
}

// 서버 시간 '2026-10-30 08:00:00'은 UTC라서 Z를 붙여 읽어요.
function parseServerTime(value) {
  if (typeof value === 'number') return value;
  const text = String(value);
  return Date.parse(text.includes('T') ? text : `${text.replace(' ', 'T')}Z`) || Date.now();
}

function fromServerHistory(history = []) {
  return history.map((row) => ({
    id: row.id,
    itemId: row.itemId,
    title: row.item?.title || '지금은 없는 항목',
    emoji: row.item?.emoji || '✨',
    tags: row.item?.tags || [],
    category: row.category,
    rating: row.rating,
    createdAt: parseServerTime(row.createdAt)
  }));
}

/* ───────────── 서버 요청 공통 ───────────── */

const USER_KEY = 'haru-user-id';

function readUserId() {
  try { return localStorage.getItem(USER_KEY); } catch { return null; }
}

function writeUserId(userId) {
  try {
    if (userId) localStorage.setItem(USER_KEY, userId);
    else localStorage.removeItem(USER_KEY);
  } catch { /* 저장이 막혀도 이번 접속 동안은 메모리 값으로 동작 */ }
}

// localStorage에는 익명 사용자 ID만 저장해요. 없으면 서버에서 새로 받아요.
let memoryUserId = null;
async function ensureUser() {
  const saved = memoryUserId || readUserId();
  if (saved) return saved;
  const response = await fetch(`${CONFIG.API_BASE}/api/users`, { method: 'POST' });
  if (!response.ok) throw new Error('사용자 생성 실패');
  const { userId } = await response.json();
  memoryUserId = userId;
  writeUserId(userId);
  return userId;
}

async function request(path, { method = 'GET', body, headers = {}, raw = false } = {}, retried = false) {
  const userId = await ensureUser();
  const response = await fetch(`${CONFIG.API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-User-Id': userId, ...headers },
    body: body ? JSON.stringify(body) : undefined
  });
  // 서버 DB가 초기화돼서 내 ID를 모르면, 새 ID를 받아 한 번만 다시 시도해요.
  if (response.status === 401 && !retried) {
    memoryUserId = null;
    writeUserId(null);
    return request(path, { method, body, headers, raw }, true);
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw Object.assign(new Error(error?.error?.message || `요청 실패: ${response.status}`), { status: response.status, code: error?.error?.code });
  }
  return raw ? response : response.json();
}

// 챗봇 스트리밍 응답(SSE) 읽기: data 조각마다 onDelta, 마지막 done 이벤트에 전체 응답
async function readChatStream(response, onDelta) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalBody = null;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary;
    while ((boundary = buffer.indexOf('\n\n')) >= 0) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const eventName = block.match(/^event: (.+)$/m)?.[1] || 'message';
      const data = block.split('\n').filter((line) => line.startsWith('data: ')).map((line) => line.slice(6)).join('\n');
      if (!data) continue;
      const parsed = JSON.parse(data);
      if (eventName === 'done') finalBody = parsed;
      else if (eventName === 'error') throw new Error(parsed.code || 'CHAT_FAILED');
      else if (parsed.delta) onDelta?.(parsed.delta);
    }
  }
  if (!finalBody) throw new Error('챗봇 응답이 끝나지 않았어요');
  return finalBody;
}

const serverApi = {
  async getProfile() {
    const { profile } = await request('/api/profile');
    return { profile: fromServerProfile(profile), persona: null };
  },
  async saveProfile(profile) {
    await request('/api/profile', { method: 'PUT', body: { answers: toServerProfile(profile) } });
    return { ok: true };
  },
  async analyzeTaste() {
    const { status, persona } = await request('/api/rules/generate', { method: 'POST' });
    return { status, persona };
  },
  async getContext() {
    return fromServerContext(await request('/api/context'));
  },
  async recommend({ category, context, refine, excludeIds }) {
    const { items } = await request('/api/recommend', {
      method: 'POST',
      body: { category, context: toServerContext(context), refine: refine || null, excludeIds: excludeIds || [] }
    });
    return { items: fromServerItems(items, category) };
  },
  async saveDecision({ category, item, context }) {
    return request('/api/decisions', { method: 'POST', body: { category, itemId: item.id, context: toServerContext(context) } });
  },
  async saveFeedback(decisionId, rating) {
    return request(`/api/decisions/${encodeURIComponent(decisionId)}/feedback`, { method: 'POST', body: { rating } });
  },
  async getHistory() {
    const { history } = await request('/api/history');
    return { records: fromServerHistory(history) };
  },
  // messages: [{ role: 'user'|'assistant', content }], onDelta: 답변 글자가 올 때마다 호출
  async chat({ messages, context = {}, excludeIds = [], onDelta }) {
    const response = await request('/api/chat', {
      method: 'POST',
      headers: { Accept: 'text/event-stream' },
      body: { messages, context: toServerContext(context), excludeIds },
      raw: true
    });
    const isStream = (response.headers.get('Content-Type') || '').includes('text/event-stream');
    const body = isStream ? await readChatStream(response, onDelta) : await response.json();
    return { reply: body.reply, recommendations: fromServerItems(body.recommendations), degraded: Boolean(body.degraded) };
  },
  // 서버의 기록은 그대로 두고, 이 브라우저만 새 사용자로 시작해요.
  async resetAll() {
    memoryUserId = null;
    writeUserId(null);
    return { ok: true };
  }
};

export const api = CONFIG.USE_MOCK ? mockApi : serverApi;
