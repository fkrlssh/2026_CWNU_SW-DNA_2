// 하루 앱 설정 파일입니다.
// 서버 없이 화면만 볼 때는 USE_MOCK을 true로 바꾸거나 주소 뒤에 ?mock=normal 을 붙이세요.
export const CONFIG = {
  // false: 백엔드 API 호출 / true: 브라우저 안의 가짜 응답(mock.js)으로 동작
  USE_MOCK: false,

  // 백엔드 주소. 비워두면 '지금 페이지와 같은 서버'를 써요.
  // 프론트를 다른 포트(예: 5500)로 띄우면 아래 기본값(localhost:3000)을 씁니다.
  API_BASE: '',

  // 목업 상황 연습용: 'normal' | 'slow' | 'error' | 'empty' | 'timeout'
  // 주소 뒤에 ?mock=error 처럼 붙이면 목업 모드로 바뀌고 그 상황을 보여줘요.
  MOCK_SCENARIO: 'normal',
  MOCK_DELAY_MS: 600, // 목업 응답 대기 시간
  MOCK_ANALYSIS_MS: 5000, // 목업 취향 분석 시간

  // 취향 분석이 이 시간보다 오래 걸리면 기본 추천으로 넘어가요.
  ANALYSIS_TIMEOUT_MS: 60000,

  // 온보딩 칩 단계에서 최소로 골라야 하는 개수 (팀 합의: 1개)
  MIN_TASTE_PICKS: 1,

  // 상황 입력에서 '혼자/같이' 질문을 보여줄지
  ASK_WITH: false,

  // 시연용 시간대 고정: null | 'morning' | 'lunch' | 'afternoon' | 'evening' | 'night'
  // 주소 뒤에 ?slot=lunch 처럼 붙여도 바뀝니다.
  FORCE_TIME_SLOT: null
};

// API 주소 정하기: 서버(3000)가 직접 페이지를 줬으면 같은 주소, 아니면 localhost:3000
if (!CONFIG.API_BASE) {
  const sameServer = window.location.port === '3000';
  CONFIG.API_BASE = sameServer ? window.location.origin : `${window.location.protocol}//${window.location.hostname}:3000`;
}

// 주소창 파라미터로 설정을 잠깐 바꿀 수 있어요. (예: index.html?mock=empty&slot=evening)
const params = new URLSearchParams(window.location.search);
if (params.get('mock')) {
  CONFIG.USE_MOCK = true;
  CONFIG.MOCK_SCENARIO = params.get('mock');
}
if (params.get('api')) CONFIG.API_BASE = params.get('api');
if (params.get('slot')) CONFIG.FORCE_TIME_SLOT = params.get('slot');
// timeout 시나리오는 60초를 기다리지 않도록 8초로 줄여서 보여줘요.
if (CONFIG.MOCK_SCENARIO === 'timeout') CONFIG.ANALYSIS_TIMEOUT_MS = 8000;
