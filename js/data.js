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
const TIME_QUESTION = {
  key: 'time', label: '시간', title: '얼마나 여유가 있나요?', hint: '이동과 준비 시간을 포함한 대략적인 시간이에요.',
  options: [
    { label: '30분 안에', value: '30분', emoji: '⏱️', desc: '가까운 곳에서 짧고 가볍게', tone: 'yellow' },
    { label: '1시간 정도', value: '1시간', emoji: '🕐', desc: '한 가지 활동을 충분히 즐기게', tone: 'mint' },
    { label: '2시간 이상', value: '2시간 이상', emoji: '🌤️', desc: '조금 멀어도 여유롭게', tone: 'lavender' }
  ]
};

// 범주형 질문도 기존의 설명형 카드 UI에서 자연스럽게 보이도록 화면용 정보를 보충해요.
const CARD_TONES = ['yellow', 'mint', 'lavender'];
function enrichQuestions(questions) {
  return questions.map((question) => ({
    ...question,
    label: question.label || (question.key === 'time' ? '시간' : question.key === 'mode' ? '방식' : '선호'),
    hint: question.hint || '지금 더 끌리는 쪽을 골라 주세요.',
    options: question.options.map((option, index) => ({
      ...option,
      desc: option.desc || '지금의 나에게 더 끌리는 선택',
      tone: option.tone || CARD_TONES[index % CARD_TONES.length]
    }))
  }));
}

// 카테고리마다 5라운드, 라운드마다 큰 선택 카드 3개. 셋 다 아니면 "이 질문은 넘어갈게요"로 건너뛰어요.
export function situationQuestions(category) {
  if (category === 'wear') {
    return enrichQuestions([
      { key: 'mode', label: '일정', title: '오늘 어디에 가시나요?', hint: '장소의 분위기에 맞는 옷부터 골라드릴게요.', options: [
        { label: '출근·중요한 약속', value: '출근·약속', emoji: '💼', desc: '단정함과 신뢰감이 필요한 자리', tone: 'lavender' },
        { label: '가벼운 외출·데이트', value: '편한 외출', emoji: '👜', desc: '편하지만 사진도 신경 쓰이는 날', tone: 'pink' },
        { label: '집에서 쉬는 날', value: '집콕', emoji: '🏠', desc: '몸을 편하게 쉬게 하고 싶은 날', tone: 'cream' }
      ] },
      { key: 'prefer:thickness', label: '체감 온도', title: '오늘은 어느 정도로 입고 싶나요?', hint: '날씨와 체감 온도에 맞춰 두께를 조절해요.', options: [
        { label: '따뜻하게', value: '두꺼운', emoji: '🧣', desc: '아우터나 포근한 소재가 필요해요', tone: 'peach' },
        { label: '가볍고 시원하게', value: '얇은', emoji: '🍃', desc: '겹쳐 입기보다 산뜻하게', tone: 'mint' },
        { label: '날씨에 맡길게요', value: '', emoji: '🌤️', desc: '두께는 추천에 맡길게요', tone: 'cream' }
      ] },
      { key: 'prefer:style', label: '스타일', title: '오늘 보여 주고 싶은 분위기는?', hint: '옷의 전체 실루엣과 분위기를 정하는 기준이에요.', options: [
        { label: '단정한 포멀룩', value: '포멀', emoji: '👔', desc: '깔끔하고 신뢰감 있게', tone: 'blue' },
        { label: '편한 캐주얼룩', value: '캐주얼', emoji: '👕', desc: '오래 입어도 부담 없이', tone: 'yellow' },
        { label: '개성 있는 스트릿룩', value: '스트릿', emoji: '🧢', desc: '포인트가 살아나게', tone: 'pink' }
      ] },
      { key: 'prefer:color', label: '색상', title: '가장 끌리는 색감은 무엇인가요?', hint: '상·하의와 아우터를 묶어 줄 대표 색상이에요.', options: [
        { label: '블랙·짙은 톤', value: '블랙', emoji: '⚫', desc: '차분하고 시크하게', tone: 'dark' },
        { label: '화이트·밝은 톤', value: '화이트', emoji: '⚪', desc: '맑고 깔끔하게', tone: 'cream' },
        { label: '베이지·뉴트럴 톤', value: '베이지', emoji: '🟤', desc: '부드럽고 자연스럽게', tone: 'peach' }
      ] },
      { key: 'prefer:outer', label: '겉옷', title: '겉옷은 어떤 느낌이 좋나요?', hint: '최종 코디의 분위기를 완성하는 아이템이에요.', options: [
        { label: '코트·재킷', value: '코트', emoji: '🧥', desc: '단정하게 형태를 잡아 주는 아우터', tone: 'lavender' },
        { label: '패딩·보온 아우터', value: '패딩', emoji: '🦺', desc: '추위보다 따뜻함을 우선', tone: 'sky' },
        { label: '가디건·후드', value: '가디건', emoji: '🧶', desc: '가볍게 걸치고 편안하게', tone: 'mint' }
      ] }
    ]);
  }
  if (category === 'do') {
    return enrichQuestions([
      { key: 'prefer:kind', label: '활동', title: '지금 가장 하고 싶은 건 무엇인가요?', hint: '기분 전환 방식에 맞는 활동부터 좁혀볼게요.', options: [
        { label: '몸을 움직이고 싶어요', value: '운동', emoji: '🏃', desc: '걷기·러닝·운동처럼 개운하게', tone: 'green' },
        { label: '조용히 보고 듣고 싶어요', value: '감상', emoji: '🎬', desc: '영화·전시·책에 몰입하게', tone: 'blue' },
        { label: '아무것도 안 하고 쉬고 싶어요', value: '휴식', emoji: '🛋️', desc: '에너지를 채우는 느린 시간', tone: 'lavender' }
      ] },
      { key: 'prefer:place', label: '장소', title: '어디에서 시간을 보내고 싶나요?', hint: '이동 거리와 장소 분위기를 함께 고려해요.', options: [
        { label: '집에서 편하게', value: '집', emoji: '🏠', desc: '이동 없이 내 공간에서', tone: 'cream' },
        { label: '카페·조용한 공간', value: '카페', emoji: '☕', desc: '가볍게 나가 혼자만의 시간', tone: 'peach' },
        { label: '실내 시설·밖으로', value: '실내시설', emoji: '🎟️', desc: '영화관·전시·운동처럼 확실한 외출', tone: 'pink' }
      ] },
      { key: 'with', label: '동행', title: '누구와 함께하나요?', hint: '혼자만의 휴식인지, 함께 즐길 시간인지 알려주세요.', options: [
        { label: '혼자서', value: '혼자', emoji: '🙋', desc: '내 리듬에 맞춰 자유롭게', tone: 'yellow' },
        { label: '친구·연인과', value: '같이', emoji: '👫', desc: '대화하고 함께 즐기는 시간', tone: 'pink' },
        { label: '아직 모르겠어요', value: '', emoji: '🤷', desc: '동행은 추천에 맡길게요', tone: 'cream' }
      ] },
      TIME_QUESTION,
      { key: 'budget', label: '예산', title: '오늘 활동 예산은 어느 정도인가요?', hint: '교통비를 제외한 입장·이용·음료 비용 기준이에요.', options: [
        { label: '5천원 이하', value: '5천원 이하', emoji: '🆓', desc: '무료 또는 거의 돈 들지 않게', tone: 'green' },
        { label: '5천원~1만원', value: '5천원~1만원', emoji: '💳', desc: '가벼운 카페·체험 정도', tone: 'yellow' },
        { label: '1만원 이상', value: '1만원 이상', emoji: '✨', desc: '오늘은 하고 싶은 걸 해도 좋아요', tone: 'pink' }
      ] }
    ]);
  }
  return enrichQuestions([
    { key: 'prefer:cuisine', label: '음식 계열', title: '오늘은 어느 나라 음식이 더 끌리나요?', hint: '먼저 가장 당기는 음식 계열부터 좁혀볼게요.', options: [
      { label: '한식', value: '한식', emoji: '🍚', desc: '익숙하고 든든한 밥상·국물', tone: 'yellow' },
      { label: '일식', value: '일식', emoji: '🍣', desc: '깔끔한 초밥·라멘·돈카츠', tone: 'sky' },
      { label: '중식', value: '중식', emoji: '🥡', desc: '진하고 화끈한 면·요리', tone: 'red' }
    ] },
    { key: 'prefer:form', label: '메뉴 형태', title: '어떤 형태의 식사가 당기나요?', hint: '한 끼를 먹는 방식에 따라 후보를 더 정확히 골라요.', options: [
      { label: '든든한 밥', value: '밥', emoji: '🍚', desc: '밥과 반찬, 덮밥처럼 든든하게', tone: 'yellow' },
      { label: '후루룩 면', value: '면요리', emoji: '🍜', desc: '라멘·국수·짜장면처럼 간편하게', tone: 'peach' },
      { label: '따끈한 국물', value: '국물', emoji: '🍲', desc: '찌개·탕·국밥처럼 속 편하게', tone: 'mint' }
    ] },
    { key: 'prefer:taste', label: '맛', title: '입맛은 어느 쪽에 가까운가요?', hint: '매운맛과 양념의 강도를 추천에 반영해요.', options: [
      { label: '얼큰하고 매콤하게', value: '매운', emoji: '🌶️', desc: '스트레스를 날려 줄 자극적인 맛', tone: 'red' },
      { label: '담백하고 깔끔하게', value: '담백한', emoji: '🍃', desc: '부담 없이 편안한 한 끼', tone: 'green' },
      { label: '달콤하고 부드럽게', value: '달콤한', emoji: '🍯', desc: '기분을 달래 줄 부드러운 맛', tone: 'peach' }
    ] },
    { key: 'budget', label: '예산', title: '오늘 한 끼 예산은 어느 정도인가요?', hint: '음료·배달비를 제외한 1인 식사 기준이에요.', options: [
      { label: '1만원 이하', value: '1만원 이하', emoji: '💳', desc: '부담 없이 가볍게 해결', tone: 'green' },
      { label: '1만~2만원', value: '1만~2만원', emoji: '🍽️', desc: '평소처럼 만족스럽게', tone: 'yellow' },
      { label: '2만원 이상', value: '2만원 이상', emoji: '✨', desc: '오늘은 특별한 한 끼도 좋아요', tone: 'pink' }
    ] },
    { key: 'mode', label: '식사 방식', title: '어떤 방식으로 먹고 싶나요?', hint: '이동 여부까지 고려해서 가능한 메뉴만 보여드릴게요.', options: [
      { label: '배달·포장', value: '배달', emoji: '🛵', desc: '집이나 사무실에서 편하게', tone: 'peach' },
      { label: '매장에서 외식', value: '외식', emoji: '🍽️', desc: '나가서 갓 나온 음식을 즐기게', tone: 'mint' },
      { label: '집에서 직접 먹기', value: '집밥', emoji: '🏠', desc: '간단히 차려 내 공간에서', tone: 'cream' }
    ] }
  ]);
}

// 활동은 '어디서'(장소 칩)로 방식(mode)을 대신 정해요.
export const PLACE_TO_MODE = { 집: '집콕', 카페: '문화생활', 실내시설: '문화생활', 공원: '가벼운 외출', 시내: '가벼운 외출', 자연: '가벼운 외출' };

// '건너뛰기'를 누르면 남은 질문은 이 기본값으로 채워요. 범주(prefer)·혼자/같이는 답하지 않으면 보내지 않아요.
export const SITUATION_DEFAULTS = {
  time: '1시간',
  mode: { eat: '배달', wear: '편한 외출', do: '집콕' }
};
