// 앱 전체 상태와, 여러 화면이 함께 쓰는 작은 도우미 함수들이에요.
import { CONFIG } from './config.js';
import { CATEGORIES, situationQuestions, SITUATION_DEFAULTS } from './data.js';

export const state = {
  view: 'boot', // 지금 보이는 화면 이름
  profile: null, // 온보딩에서 고른 취향
  persona: null, // 취향 분석 결과 한 줄 요약
  bootStatus: 'loading',
  onboard: { step: 0, draft: null, editing: false, lastToggled: null },
  analysis: { status: 'running', returnTo: 'home', messageIndex: 0 },
  context: { status: 'idle', weather: null, isMock: false },
  category: 'eat',
  answers: {}, // 상황 입력 답변
  questionIndex: 0,
  rec: { status: 'idle', items: [], index: 0, refine: null }, // 추천 카드
  decision: { item: null, id: null, status: 'idle', feedback: 'idle', rating: null },
  history: { status: 'idle', records: [] },
  chat: { messages: [], status: 'idle' }, // 챗봇 대화 기록 (새로고침하면 비워져요)
  // 카테고리별 5라운드 취향 퀴즈. answers는 서버가 준 보기 id와 pick을 그대로 보관해요.
  quiz: { status: 'idle', category: null, rounds: [], dimensions: [], index: 0, answers: [], result: null }
};

export const RATING = {
  good: { emoji: '😊', label: '좋았어요' },
  soso: { emoji: '😐', label: '보통' },
  bad: { emoji: '😕', label: '별로' }
};

export const ANALYSIS_MESSAGES = ['취향을 살펴보고 있어요…', '좋아하는 맛을 정리하는 중…', '거의 다 됐어요!'];

const TIME_SLOTS = {
  morning: { hello: '좋은 아침이에요 ☀️', question: '오늘 뭐 입을까요?', category: 'wear' },
  lunch: { hello: '점심 시간이에요!', question: '오늘은 뭐 먹을까요?', category: 'eat' },
  afternoon: { hello: '오후도 힘내요 🌿', question: '잠깐 뭐 하면서 쉴까요?', category: 'do' },
  evening: { hello: '저녁 시간이에요 🌇', question: '오늘 저녁은 뭐 먹을까요?', category: 'eat' },
  night: { hello: '오늘도 수고했어요 🌙', question: '자기 전에 뭐 하며 쉴까요?', category: 'do' }
};

export function currentSlot() {
  if (CONFIG.FORCE_TIME_SLOT && TIME_SLOTS[CONFIG.FORCE_TIME_SLOT]) return TIME_SLOTS[CONFIG.FORCE_TIME_SLOT];
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return TIME_SLOTS.morning;
  if (hour >= 11 && hour < 14) return TIME_SLOTS.lunch;
  if (hour >= 14 && hour < 17) return TIME_SLOTS.afternoon;
  if (hour >= 17 && hour < 21) return TIME_SLOTS.evening;
  return TIME_SLOTS.night;
}

export function categoryInfo(id = state.category) {
  return CATEGORIES.find((category) => category.id === id) || CATEGORIES[0];
}

export function emptyProfile() {
  return { food: [], style: [], activity: [], budgetRange: null, activeTime: null, radius: null, avoid: [], preferences: {} };
}

// config에서 '혼자/같이' 질문을 껐으면 빼고 보여줘요.
export function activeQuestions() {
  return situationQuestions(state.category).filter((question) => CONFIG.ASK_WITH || question.key !== 'with');
}

// 답하지 않은 상황 질문은 기본값으로 채워요.
export function filledContext() {
  const answers = { ...state.answers };
  for (const key of ['mood', 'budget', 'time', 'with']) answers[key] = answers[key] || SITUATION_DEFAULTS[key];
  answers.mode = answers.mode || SITUATION_DEFAULTS.mode[state.category];
  answers.weather = state.context.weather?.code || null;
  return answers;
}
