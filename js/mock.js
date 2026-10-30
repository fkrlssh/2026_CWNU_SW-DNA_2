// 목업 모드: 서버 없이 브라우저 안에서 가짜 응답을 돌려주는 파일이에요.
// 백엔드가 준비되면 config.js에서 API_MODE를 'server'로 바꾸면 이 파일은 쓰이지 않아요.
import { CONFIG } from './config.js';

// 카테고리별 목업 추천 아이템입니다.
// 필드: 이름(title), 이모지, 장면(scene), 추천 이유(reason), 태그, 가격대(budget), 소요시간(minutes),
//       어울리는 기분(moods), 어울리는 방식(modes), 카드 배경색(color), 알레르기 성분(allergens, 음식만)
export const CATALOG = {
  eat: [
    { id: 'kimchi-stew', title: '김치찌개와 흰쌀밥', emoji: '🍲', scene: '든든한 집밥 맛', reason: '피곤한 날엔 따뜻한 국물이 좋아요.', tags: ['한식'], budget: '저렴', minutes: 25, moods: ['피곤', '우울'], modes: ['배달', '외식', '집에서'], color: 'coral', allergens: ['대두'] },
    { id: 'soft-tofu', title: '순두부찌개', emoji: '🥘', scene: '보들보들 한 그릇', reason: '속이 편안한 한 끼가 필요할 때 딱이에요.', tags: ['한식'], budget: '저렴', minutes: 20, moods: ['피곤', '우울'], modes: ['배달', '외식'], color: 'red', allergens: ['대두', '달걀', '갑각류'] },
    { id: 'bibimbap', title: '제철 채소 비빔밥', emoji: '🍚', scene: '알록달록 균형 한 그릇', reason: '여러 가지 채소를 한 번에 챙기고 싶을 때 좋아요.', tags: ['한식'], budget: '보통', minutes: 15, moods: ['좋음', '피곤'], modes: ['배달', '외식', '집에서'], color: 'mint', allergens: ['달걀', '대두'] },
    { id: 'pasta', title: '토마토 파스타', emoji: '🍝', scene: '기분 좋은 식사', reason: '기분 전환이 필요한 날, 산뜻한 토마토 한 접시 어때요?', tags: ['양식'], budget: '보통', minutes: 30, moods: ['좋음', '우울'], modes: ['배달', '외식', '집에서'], color: 'peach', allergens: ['밀', '우유'] },
    { id: 'sandwich', title: '아보카도 샌드위치', emoji: '🥪', scene: '산뜻한 간편식', reason: '가볍고 든든해서 바쁜 날에도 잘 어울려요.', tags: ['양식'], budget: '보통', minutes: 10, moods: ['좋음', '피곤'], modes: ['배달', '외식', '집에서'], color: 'green', allergens: ['밀', '달걀'] },
    { id: 'sushi', title: '연어 초밥 세트', emoji: '🍣', scene: '가볍고 깔끔하게', reason: '깔끔한 한 끼가 당길 때 부담 없이 즐기기 좋아요.', tags: ['일식'], budget: '여유', minutes: 25, moods: ['좋음', '피곤'], modes: ['배달', '외식'], color: 'pink', allergens: ['대두', '밀'] },
    { id: 'udon', title: '따끈한 우동', emoji: '🍜', scene: '속 편한 국물 한 그릇', reason: '복잡한 생각은 잠깐 내려놓고 편안하게 먹어요.', tags: ['일식'], budget: '저렴', minutes: 15, moods: ['피곤', '우울'], modes: ['배달', '외식', '집에서'], color: 'cream', allergens: ['밀', '대두'] },
    { id: 'mapo-tofu', title: '마파두부 덮밥', emoji: '🌶️', scene: '든든한 매콤함', reason: '입맛이 없을 때도 칼칼한 한 그릇이면 충분해요.', tags: ['중식'], budget: '보통', minutes: 25, moods: ['피곤', '좋음'], modes: ['배달', '외식', '집에서'], color: 'orange', allergens: ['대두'] },
    { id: 'jjajang', title: '짜장면', emoji: '🥢', scene: '실패 없는 배달 메뉴', reason: '고민될 땐 모두가 아는 익숙한 맛이 정답이에요.', tags: ['중식'], budget: '저렴', minutes: 20, moods: ['피곤', '좋음'], modes: ['배달', '외식'], color: 'dark', allergens: ['밀', '대두'] },
    { id: 'tteokbokki', title: '떡볶이와 튀김', emoji: '🍢', scene: '스트레스 풀리는 맛', reason: '매콤달콤한 한 입으로 오늘의 기분을 바꿔봐요.', tags: ['분식'], budget: '저렴', minutes: 20, moods: ['좋음', '우울'], modes: ['배달', '외식'], color: 'yellow', allergens: ['밀', '갑각류'] },
    { id: 'gimbap', title: '참치 김밥 한 줄', emoji: '🍙', scene: '친근하고 간단하게', reason: '주머니도 마음도 가볍게 챙기는 익숙한 선택이에요.', tags: ['분식'], budget: '저렴', minutes: 10, moods: ['피곤', '좋음'], modes: ['배달', '외식', '집에서'], color: 'lime', allergens: ['달걀'] },
    { id: 'poke', title: '연어 포케', emoji: '🥗', scene: '가볍지만 든든하게', reason: '건강하게 먹고 싶은 날, 한 그릇으로 깔끔하게 끝나요.', tags: ['샐러드'], budget: '보통', minutes: 15, moods: ['좋음', '피곤'], modes: ['배달', '외식'], color: 'sky', allergens: ['대두'] },
    { id: 'chicken-salad', title: '닭가슴살 샐러드', emoji: '🥬', scene: '산뜻한 한 끼', reason: '속이 더부룩한 날엔 가벼운 샐러드가 좋아요.', tags: ['샐러드'], budget: '보통', minutes: 10, moods: ['좋음'], modes: ['배달', '외식', '집에서'], color: 'green', allergens: [] },
    { id: 'cake-latte', title: '딸기 케이크와 라떼', emoji: '🍰', scene: '달콤한 쉼표', reason: '기운 없는 날엔 달콤한 한 조각이 힘이 돼요.', tags: ['디저트'], budget: '보통', minutes: 20, moods: ['우울', '좋음'], modes: ['배달', '외식'], color: 'pink', allergens: ['밀', '우유', '달걀'] }
  ],
  wear: [
    { id: 'minimal-knit', title: '포근한 니트와 슬랙스', emoji: '🧶', scene: '차분한 미니멀 룩', reason: '손이 자주 가는 편안한 조합으로 하루를 시작해요.', tags: ['미니멀', '캐주얼'], budget: '보통', minutes: 10, moods: ['피곤', '우울'], modes: ['출근·약속', '편한 외출'], color: 'cream' },
    { id: 'hoodie-jogger', title: '후드티와 조거팬츠', emoji: '🧢', scene: '가볍게 걸치는 편한 룩', reason: '움직임이 많은 날에도 편하고 나다운 스타일이에요.', tags: ['캐주얼', '편한 옷'], budget: '저렴', minutes: 5, moods: ['좋음', '피곤'], modes: ['편한 외출', '집콕'], color: 'lavender' },
    { id: 'graphic-wide', title: '그래픽 티와 와이드 팬츠', emoji: '🛹', scene: '힘 뺀 스트릿 룩', reason: '툭 걸쳐도 멋이 나서 고민할 필요가 없어요.', tags: ['스트릿', '캐주얼'], budget: '저렴', minutes: 7, moods: ['좋음'], modes: ['편한 외출'], color: 'yellow' },
    { id: 'soft-dress', title: '가벼운 원피스와 가디건', emoji: '👗', scene: '산뜻한 약속 룩', reason: '고민 없이 툭 걸치면 단정하고 산뜻해 보여요.', tags: ['러블리', '미니멀'], budget: '여유', minutes: 12, moods: ['좋음', '우울'], modes: ['출근·약속', '편한 외출'], color: 'pink' },
    { id: 'denim', title: '화이트 셔츠와 데님', emoji: '👖', scene: '언제나 좋은 캐주얼', reason: '어디서든 편안하고 실패 없는 조합이에요.', tags: ['캐주얼', '미니멀'], budget: '보통', minutes: 10, moods: ['좋음', '피곤'], modes: ['출근·약속', '편한 외출'], color: 'blue' },
    { id: 'tailored', title: '셔츠와 테일러드 재킷', emoji: '👔', scene: '단정한 포멀 룩', reason: '중요한 약속이 있는 날, 자신감을 더해줘요.', tags: ['포멀', '미니멀'], budget: '여유', minutes: 12, moods: ['좋음'], modes: ['출근·약속'], color: 'dark' },
    { id: 'sporty', title: '맨투맨과 트레이닝 팬츠', emoji: '👟', scene: '가뿐한 액티브 룩', reason: '산책이나 가벼운 운동까지 그대로 이어갈 수 있어요.', tags: ['스포티', '편한 옷'], budget: '저렴', minutes: 5, moods: ['좋음', '피곤'], modes: ['편한 외출', '집콕'], color: 'mint' },
    { id: 'black-fit', title: '올블랙 편한 셋업', emoji: '🖤', scene: '꾸민 듯 편안하게', reason: '색 조합 고민 없이 깔끔한 분위기를 낼 수 있어요.', tags: ['스트릿', '미니멀'], budget: '보통', minutes: 8, moods: ['우울', '피곤'], modes: ['출근·약속', '편한 외출'], color: 'dark' },
    { id: 'linen', title: '린넨 셔츠와 면바지', emoji: '🌿', scene: '바람이 잘 통하는 하루', reason: '답답함 없이 산뜻해서 오래 입어도 편안해요.', tags: ['미니멀', '캐주얼'], budget: '여유', minutes: 10, moods: ['좋음', '피곤'], modes: ['출근·약속', '편한 외출'], color: 'green' },
    { id: 'homewear', title: '부드러운 홈웨어 세트', emoji: '☁️', scene: '집에서 쉬는 날', reason: '집콕하는 날엔 몸을 조이지 않는 게 제일이에요.', tags: ['편한 옷', '캐주얼'], budget: '저렴', minutes: 3, moods: ['피곤', '우울'], modes: ['집콕'], color: 'sky' },
    { id: 'color-pop', title: '컬러 니트 포인트 룩', emoji: '🧥', scene: '기분을 바꾸는 색 한 점', reason: '좋아하는 색을 더하면 평범한 하루도 특별해져요.', tags: ['러블리', '스트릿'], budget: '여유', minutes: 12, moods: ['좋음', '우울'], modes: ['출근·약속', '편한 외출'], color: 'orange' }
  ],
  do: [
    { id: 'home-tea', title: '좋아하는 차 한 잔', emoji: '🍵', scene: '집에서 천천히 쉬기', reason: '피곤한 날엔 따뜻한 차와 조용한 시간이 최고예요.', tags: ['집콕'], budget: '저렴', minutes: 10, moods: ['피곤', '우울'], modes: ['집콕'], color: 'mint' },
    { id: 'walk', title: '동네 한 바퀴 산책', emoji: '🚶', scene: '바깥 공기 쐬기', reason: '10분만 걸어도 머릿속이 한결 가벼워질 거예요.', tags: ['산책'], budget: '저렴', minutes: 20, moods: ['피곤', '우울', '좋음'], modes: ['가벼운 외출'], color: 'green' },
    { id: 'han-river', title: '한강 산책', emoji: '🌉', scene: '탁 트인 강바람', reason: '넓은 풍경을 보면 답답했던 마음이 풀려요.', tags: ['산책'], budget: '저렴', minutes: 90, moods: ['좋음', '우울'], modes: ['가벼운 외출'], color: 'sky' },
    { id: 'stretch', title: '15분 홈 스트레칭', emoji: '🧘', scene: '몸을 깨우는 가벼운 운동', reason: '부담 없는 움직임으로 굳은 몸을 살짝 풀어봐요.', tags: ['운동', '집콕'], budget: '저렴', minutes: 15, moods: ['피곤', '좋음'], modes: ['집콕'], color: 'lavender' },
    { id: 'run', title: '가벼운 저녁 러닝', emoji: '🏃', scene: '땀 한 번 흘리기', reason: '몸을 움직이면 생각이 정리되고 잠도 잘 와요.', tags: ['운동', '산책'], budget: '저렴', minutes: 40, moods: ['좋음'], modes: ['가벼운 외출'], color: 'lime' },
    { id: 'movie', title: '집에서 영화 한 편', emoji: '🎬', scene: '집에서 작은 영화관', reason: '오늘은 좋아하는 장면 속에서 잠깐 쉬어가요.', tags: ['집콕', '문화생활'], budget: '저렴', minutes: 120, moods: ['피곤', '우울', '좋음'], modes: ['집콕'], color: 'blue' },
    { id: 'exhibition', title: '작은 전시 구경하기', emoji: '🖼️', scene: '느긋한 문화생활', reason: '새로운 장면을 보면 기분도 자연스럽게 바뀌어요.', tags: ['문화생활'], budget: '여유', minutes: 120, moods: ['좋음', '우울'], modes: ['문화생활'], color: 'peach' },
    { id: 'book-cafe', title: '조용한 카페에서 책 읽기', emoji: '📖', scene: '나에게 집중하는 시간', reason: '커피 한 잔과 함께 천천히 나만의 시간을 보내요.', tags: ['카페', '문화생활'], budget: '보통', minutes: 60, moods: ['좋음', '피곤'], modes: ['가벼운 외출', '문화생활'], color: 'cream' },
    { id: 'bakery', title: '새로운 동네 빵집 가기', emoji: '🥐', scene: '가까운 곳에서 작은 발견', reason: '멀리 가지 않아도 소소한 즐거움을 만날 수 있어요.', tags: ['카페', '산책'], budget: '보통', minutes: 30, moods: ['좋음', '우울'], modes: ['가벼운 외출'], color: 'yellow' },
    { id: 'window-shopping', title: '쇼핑몰 가볍게 구경', emoji: '🛍️', scene: '사지 않아도 즐거운 구경', reason: '구경만 해도 기분 전환이 되고 걸음 수도 채워져요.', tags: ['쇼핑'], budget: '보통', minutes: 90, moods: ['좋음', '우울'], modes: ['가벼운 외출', '문화생활'], color: 'pink' },
    { id: 'cook', title: '간단한 한 그릇 요리', emoji: '🍳', scene: '나를 위한 요리 시간', reason: '직접 만든 한 그릇은 뿌듯함까지 함께 채워줘요.', tags: ['요리', '집콕'], budget: '저렴', minutes: 40, moods: ['좋음', '피곤'], modes: ['집콕'], color: 'orange' },
    { id: 'playlist', title: '플레이리스트 틀고 방 정리', emoji: '🎧', scene: '내 공간 가볍게 돌보기', reason: '좋아하는 음악 세 곡이면 정리도 덜 귀찮아져요.', tags: ['집콕'], budget: '저렴', minutes: 20, moods: ['피곤', '우울'], modes: ['집콕'], color: 'coral' }
  ]
};

const STORAGE_KEY = 'haru-prototype-v2';

function loadStore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { profile: saved.profile || null, persona: saved.persona || null, records: Array.isArray(saved.records) ? saved.records : [] };
  } catch {
    return { profile: null, persona: null, records: [] };
  }
}

function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // 시크릿 모드 등에서 저장이 막혀도 화면은 계속 동작하게 둡니다.
  }
}

// 시나리오에 맞춰 기다렸다가, 'error'면 실패를 흉내 냅니다.
async function mockWait(ms = CONFIG.MOCK_DELAY_MS) {
  const delay = CONFIG.MOCK_SCENARIO === 'slow' ? ms + 2500 : ms;
  await new Promise((resolve) => setTimeout(resolve, delay));
  if (CONFIG.MOCK_SCENARIO === 'error') throw new Error('목업 에러 시나리오');
}

const isEmptyScenario = () => CONFIG.MOCK_SCENARIO === 'empty';

// 날짜마다 바뀌는 예시 날씨 (실제 날씨는 백엔드 /api/context에서 받아요)
const MOCK_WEATHER = [
  { code: 'clear', text: '맑아요 ☀️ 산책하기 좋은 날이에요', temp: 19 },
  { code: 'cloudy', text: '조금 흐려요 ☁️ 얇은 겉옷 챙기세요', temp: 16 },
  { code: 'rain', text: '비 와요 ☔ 우산 챙기세요', temp: 14 }
];

// 추천 점수 계산: 취향 + 상황 + 지난 피드백 + 리파인 요청을 더해요.
// (백엔드 A의 recommend()가 완성되면 이 로직은 서버로 옮겨가요)
function scoreItem(item, { profile, records, category, context, refine, baseItem }) {
  let score = Math.random() * 0.8; // 매번 같은 결과만 나오지 않도록 살짝 섞어요
  const tasteKey = { eat: 'food', wear: 'style', do: 'activity' }[category];
  const liked = profile?.[tasteKey] || [];
  if (item.tags.some((tag) => liked.includes(tag))) score += 5;
  if (item.moods.includes(context.mood)) score += 3;
  if (item.modes.includes(context.mode)) score += 5;

  const budgetRank = { 저렴: 0, 보통: 1, 여유: 2 };
  const wanted = budgetRank[context.budget] ?? 1;
  const itemBudget = budgetRank[item.budget] ?? 1;
  score += 3 - Math.abs(wanted - itemBudget) * 2;

  if (context.time === '10분') score += item.minutes <= 10 ? 6 : item.minutes <= 20 ? 1 : -4;
  if (context.time === '1시간') score += item.minutes <= 60 ? 4 : -1;
  if (context.time === '반나절') score += item.minutes > 30 ? 3 : 1;

  if (context.weather === 'rain' && item.tags.includes('산책')) score -= 3;
  if (context.weather === 'rain' && item.modes.includes('집콕')) score += 2;
  if (profile?.radius === '집 근처' && item.minutes >= 90 && !item.modes.includes('집콕')) score -= 2;

  // 좋았던 선택과 비슷한 건 더, 별로였던 건 덜 추천해요.
  for (const record of records) {
    if (!record.rating || record.category !== category) continue;
    const overlap = record.tags.some((tag) => item.tags.includes(tag));
    if (overlap && record.rating === 'good') score += 1.4;
    if (overlap && record.rating === 'bad') score -= 1.8;
  }

  if (refine === 'cheaper') score += itemBudget === 0 ? 5 : itemBudget === 1 ? 1 : -5;
  if (refine === 'lighter') score += item.minutes <= 15 ? 5 : item.minutes <= 30 ? 1 : -4;
  if (refine === 'different' && baseItem) score += item.tags.some((tag) => baseItem.tags.includes(tag)) ? -6 : 3;
  if (refine === 'new') score += Math.random() * 4;
  return score;
}

// 추천 이유 한 줄. 비 오는 날 같은 상황이 있으면 그걸 먼저 말해줘요.
function explain(item, context) {
  if (context.weather === 'rain' && item.tags.includes('집콕')) return '비 오는 날엔 집에서 쉬는 게 최고예요.';
  return item.reason;
}

export const mockApi = {
  async getProfile() {
    const store = loadStore();
    return { profile: store.profile, persona: store.persona };
  },

  async saveProfile(profile) {
    const store = loadStore();
    store.profile = profile;
    saveStore(store);
    return { ok: true };
  },

  // 실제로는 백엔드 A가 AI로 취향 규칙을 만드는 단계예요. 목업은 기다렸다가 한 줄 요약만 만들어요.
  async analyzeTaste(profile) {
    if (CONFIG.MOCK_SCENARIO === 'timeout') return new Promise(() => {}); // 끝나지 않는 상황 흉내
    await mockWait(CONFIG.MOCK_ANALYSIS_MS);
    const persona = `${profile.food[0]} 좋아하고, 쉬는 날엔 ${profile.activity[0]} 즐기는 ${profile.style[0]} 스타일`;
    const store = loadStore();
    store.persona = persona;
    saveStore(store);
    return { status: 'done', persona };
  },

  async getContext() {
    await mockWait(300);
    const weather = MOCK_WEATHER[new Date().getDate() % MOCK_WEATHER.length];
    return { weather, isMock: true };
  },

  async recommend({ category, context, refine = null, excludeIds = [], baseItem = null }) {
    await mockWait();
    if (isEmptyScenario()) return { items: [] };
    const store = loadStore();
    const profile = store.profile || {};
    const avoid = profile.avoid || [];

    // 알레르기·싫은 음식은 점수와 상관없이 무조건 빼요.
    let pool = (CATALOG[category] || []).filter((item) =>
      !(item.allergens || []).some((allergen) => avoid.includes(allergen)) &&
      !avoid.some((word) => word.length > 1 && item.title.includes(word))
    );
    // 리파인할 때는 방금 본 후보를 빼고 고르되, 남은 게 3개 미만이면 그대로 둬요.
    const rest = pool.filter((item) => !excludeIds.includes(item.id));
    if (refine && rest.length >= 3) pool = rest;

    const ranked = pool
      .map((item) => ({ item, score: scoreItem(item, { profile, records: store.records, category, context, refine, baseItem }) }))
      .sort((a, b) => b.score - a.score);
    return { items: ranked.slice(0, 3).map(({ item }) => ({ ...item, reason: explain(item, context) })) };
  },

  async saveDecision({ category, item, context }) {
    await mockWait(300);
    const store = loadStore();
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    store.records.unshift({ id, itemId: item.id, title: item.title, emoji: item.emoji, tags: item.tags, category, context, createdAt: Date.now(), rating: null });
    saveStore(store);
    return { decisionId: id };
  },

  async saveFeedback(decisionId, rating) {
    await mockWait(300);
    const store = loadStore();
    const record = store.records.find((entry) => entry.id === decisionId);
    if (record) record.rating = rating;
    saveStore(store);
    return { ok: true };
  },

  async getHistory() {
    await mockWait();
    if (isEmptyScenario()) return { records: [] };
    const store = loadStore();
    return { records: [...store.records].sort((a, b) => b.createdAt - a.createdAt) };
  },

  // 목업 챗봇: 마지막 질문에서 카테고리를 짐작해 추천 3개와 짧은 답을 돌려줘요.
  async chat({ messages, context = {}, onDelta }) {
    const question = messages.at(-1)?.content || '';
    const category = /먹|메뉴|배고|점심|저녁|야식/.test(question) ? 'eat' : /입|옷|코디|룩/.test(question) ? 'wear' : 'do';
    const { items } = await mockApi.recommend({ category, context });
    const reply = `이런 건 어때요? ${items[0]?.title || '오늘은 푹 쉬기'}부터 살펴보세요.`;
    for (const char of reply) {
      onDelta?.(char);
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
    return { reply, recommendations: items.map((item) => ({ ...item, category })), degraded: false };
  },

  async resetAll() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* 무시 */ }
    return { ok: true };
  }
};
