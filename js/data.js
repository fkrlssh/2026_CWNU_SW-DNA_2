// 화면에 나오는 고정 콘텐츠(카테고리, 온보딩 질문, 상황 질문)를 모아둔 파일이에요.
// 추천 아이템 목업 데이터는 mock.js에 있어요.

export const CATEGORIES = [
  { id: 'eat', title: '뭐 먹지', subtitle: '배부터 마음까지 든든하게', emoji: '🍚', color: 'food' },
  { id: 'wear', title: '뭐 입지', subtitle: '오늘의 나에게 어울리게', emoji: '👕', color: 'style' },
  { id: 'do', title: '뭐 하지', subtitle: '기분 좋은 시간을 골라봐요', emoji: '🎯', color: 'activity' }
];

// 온보딩 5단계 구성입니다. 칩 선택지를 바꾸면 화면이 그대로 따라 바뀝니다.
export const ONBOARDING_STEPS = [
  {
    id: 'food', type: 'chips', title: '어떤 음식을 좋아하세요?', desc: '끌리는 걸 편하게 골라주세요',
    choices: [
      { label: '한식', emoji: '🍚' }, { label: '중식', emoji: '🥟' }, { label: '일식', emoji: '🍣' }, { label: '양식', emoji: '🍝' },
      { label: '분식', emoji: '🍢' }, { label: '샐러드', emoji: '🥗' }, { label: '디저트', emoji: '🍰' }
    ]
  },
  {
    id: 'style', type: 'chips', title: '평소 스타일은요?', desc: '자주 손이 가는 옷을 떠올려 보세요',
    choices: [
      { label: '캐주얼', emoji: '👕' }, { label: '미니멀', emoji: '🤍' }, { label: '스트릿', emoji: '🧢' }, { label: '포멀', emoji: '👔' },
      { label: '스포티', emoji: '👟' }, { label: '러블리', emoji: '🎀' }, { label: '편한 옷', emoji: '☁️' }
    ]
  },
  {
    id: 'activity', type: 'chips', title: '쉬는 날엔 주로?', desc: '좋아하는 시간을 골라주세요',
    choices: [
      { label: '집콕', emoji: '🛋️' }, { label: '산책', emoji: '🚶' }, { label: '운동', emoji: '🏃' }, { label: '카페', emoji: '☕' },
      { label: '문화생활', emoji: '🎨' }, { label: '쇼핑', emoji: '🛍️' }, { label: '요리', emoji: '🍳' }
    ]
  },
  {
    id: 'basics', type: 'basics', title: '조금만 더 알려주세요', desc: '각각 하나씩만 골라주세요',
    fields: [
      { key: 'budgetRange', label: '예산 범위', options: ['아껴 쓰는 편', '보통', '조금 여유롭게'] },
      { key: 'activeTime', label: '주 활동 시간대', options: ['아침형', '낮형', '저녁형'] },
      { key: 'radius', label: '활동 반경', options: ['집 근처', '동네 안', '멀리도 좋아요'] }
    ]
  },
  {
    id: 'avoid', type: 'avoid', title: '못 먹거나 절대 싫은 게 있나요?', desc: '알려주시면 추천에서 꼭 빼드릴게요',
    choices: ['견과류', '갑각류', '우유', '밀', '달걀', '대두']
  }
];

// 상황 입력 질문입니다. 기분·예산처럼 애매한 질문 대신 눈에 보이는 범주를 물어요.
// key가 'prefer:'로 시작하는 질문의 value는 서버의 취향 태그이며, 추천 요청의 context.prefer로 모아 보냅니다.
// value가 빈 문자열인 선택지("상관없어요")는 아무것도 보내지 않아요.
const ANY = { label: '상관없어요', value: '', emoji: '🤷' };
const TIME_QUESTION = { key: 'time', title: '시간은 얼마나 있어요?', options: [{ label: '10분', value: '10분', emoji: '⏱️' }, { label: '1시간', value: '1시간', emoji: '🕐' }, { label: '반나절', value: '반나절', emoji: '🌤️' }] };

// 카테고리마다 5라운드, 라운드마다 큰 선택 카드 3개. 셋 다 아니면 "이 질문은 넘어갈게요"로 건너뛰어요.
export function situationQuestions(category) {
  if (category === 'wear') {
    return [
      { key: 'mode', title: '어디에 가세요?', options: [{ label: '출근이나 약속', value: '출근·약속', emoji: '👜' }, { label: '편하게 외출', value: '편한 외출', emoji: '🚶' }, { label: '집에서 쉬기', value: '집콕', emoji: '🏠' }] },
      { key: 'prefer:outer', title: '아우터는 뭘 걸칠까요?', options: [{ label: '코트', value: '코트', emoji: '🧥' }, { label: '패딩', value: '패딩', emoji: '🧤' }, { label: '후드', value: '후드', emoji: '🧢' }] },
      { key: 'prefer:material', title: '어떤 소재가 좋아요?', options: [{ label: '니트', value: '니트', emoji: '🧶' }, { label: '면', value: '면소재', emoji: '👕' }, { label: '데님', value: '데님', emoji: '👖' }] },
      { key: 'prefer:color', title: '색은요?', options: [{ label: '블랙', value: '블랙', emoji: '⚫' }, { label: '화이트', value: '화이트', emoji: '⚪' }, { label: '베이지', value: '베이지', emoji: '🟤' }] },
      { key: 'prefer:vibe', title: '오늘 느낌은요?', options: [{ label: '편안하게', value: '편안한', emoji: '☁️' }, { label: '격식 있게', value: '격식 있는', emoji: '👔' }, { label: '화려하게', value: '화려한', emoji: '✨' }] }
    ];
  }
  if (category === 'do') {
    return [
      { key: 'prefer:kind', title: '어떤 걸로 보낼까요?', options: [{ label: '운동', value: '운동', emoji: '🏃' }, { label: '감상', value: '감상', emoji: '🎬' }, { label: '휴식', value: '휴식', emoji: '🛋️' }] },
      { key: 'prefer:place', title: '어디서 보낼까요?', options: [{ label: '집', value: '집', emoji: '🏠' }, { label: '카페', value: '카페', emoji: '☕' }, { label: '공원', value: '공원', emoji: '🌳' }] },
      TIME_QUESTION,
      { key: 'prefer:cost', title: '돈은 어때요?', options: [{ label: '안 쓰고 싶어요', value: '무료', emoji: '🆓' }, { label: '써도 괜찮아요', value: '유료', emoji: '💳' }, ANY] },
      { key: 'prefer:energy', title: '몸은 어떻게 쓸까요?', options: [{ label: '조용히', value: '정적인', emoji: '🧘' }, { label: '움직이며', value: '활동적인', emoji: '⚡' }, ANY] }
    ];
  }
  return [
    { key: 'prefer:form', title: '뭐가 당겨요?', options: [{ label: '밥', value: '밥', emoji: '🍚' }, { label: '면', value: '면요리', emoji: '🍜' }, { label: '국물', value: '국물', emoji: '🍲' }] },
    { key: 'prefer:main', title: '재료는요?', options: [{ label: '고기', value: '고기', emoji: '🥩' }, { label: '해산물', value: '해물', emoji: '🐟' }, { label: '채소', value: '채소', emoji: '🥬' }] },
    { key: 'prefer:taste', title: '맛은 어떤 쪽이요?', options: [{ label: '매운', value: '매운', emoji: '🌶️' }, { label: '담백한', value: '담백한', emoji: '🍃' }, { label: '달콤한', value: '달콤한', emoji: '🍯' }] },
    { key: 'mode', title: '어떻게 먹을까요?', options: [{ label: '배달', value: '배달', emoji: '🛵' }, { label: '외식', value: '외식', emoji: '🍽️' }, { label: '집에서', value: '집에서', emoji: '🏠' }] },
    TIME_QUESTION
  ];
}

// 활동은 '어디서'(장소 칩)로 방식(mode)을 대신 정해요.
export const PLACE_TO_MODE = { 집: '집콕', 카페: '문화생활', 실내시설: '문화생활', 공원: '가벼운 외출', 시내: '가벼운 외출', 자연: '가벼운 외출' };

// '건너뛰기'를 누르면 남은 질문은 이 기본값으로 채워요. 범주(prefer)·혼자/같이는 답하지 않으면 보내지 않아요.
export const SITUATION_DEFAULTS = {
  time: '1시간',
  mode: { eat: '배달', wear: '편한 외출', do: '집콕' }
};
