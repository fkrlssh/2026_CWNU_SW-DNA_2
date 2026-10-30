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

// 상황 입력 질문입니다. 마지막 '방식' 질문은 카테고리마다 선택지가 달라요.
// label: 진행 표시에 쓰는 짧은 이름 / hint: 왜 묻는지 한 줄 / desc: 선택지 아래 설명 / tone: 이모지 배경색
export function situationQuestions(category) {
  const modes = {
    eat: [
      { label: '배달', value: '배달', emoji: '🛵', desc: '집까지 편하게 받아서', tone: 'peach' },
      { label: '외식', value: '외식', emoji: '🍽️', desc: '나가서 기분 전환 겸', tone: 'mint' },
      { label: '집에서', value: '집에서', emoji: '🏠', desc: '간단히 해 먹을래요', tone: 'cream' }
    ],
    wear: [
      { label: '출근이나 약속', value: '출근·약속', emoji: '👜', desc: '단정하게 갖춰 입고', tone: 'lavender' },
      { label: '편하게 외출', value: '편한 외출', emoji: '🚶', desc: '가볍게 걸치고 나가요', tone: 'mint' },
      { label: '집에서 쉬기', value: '집콕', emoji: '🏠', desc: '편한 게 최고예요', tone: 'cream' }
    ],
    do: [
      { label: '집에서', value: '집콕', emoji: '🛋️', desc: '집에서 쉬엄쉬엄', tone: 'cream' },
      { label: '가볍게 외출', value: '가벼운 외출', emoji: '🌳', desc: '동네 한 바퀴 정도', tone: 'green' },
      { label: '문화생활', value: '문화생활', emoji: '🎨', desc: '전시·영화·공연 같은', tone: 'pink' }
    ]
  };
  const modeTitle = { eat: '어떻게 먹을까요?', wear: '어디에 가세요?', do: '어디서 보낼까요?' };
  const modeHint = { eat: '받는 방법에 맞는 메뉴만 골라드릴게요', wear: '가는 곳에 어울리는 옷으로 골라드릴게요', do: '머무를 곳에 맞는 할 일로 골라드릴게요' };
  return [
    {
      key: 'mood', label: '기분', title: '지금 기분은 어때요?', hint: '기분에 맞는 분위기로 골라드릴게요',
      options: [
        { label: '좋아요', value: '좋음', emoji: '😊', desc: '새로운 걸 해봐도 좋은 날', tone: 'yellow' },
        { label: '피곤해요', value: '피곤', emoji: '😪', desc: '간단하고 편한 쪽으로', tone: 'lavender' },
        { label: '우울해요', value: '우울', emoji: '🌧️', desc: '마음을 달래줄 따뜻한 쪽으로', tone: 'blue' }
      ]
    },
    {
      key: 'budget', label: '예산', title: '오늘 예산은요?', hint: '대략적인 느낌이면 충분해요',
      options: [
        { label: '저렴하게', value: '저렴', emoji: '🌱', desc: '오늘은 아껴 쓰고 싶어요', tone: 'green' },
        { label: '보통', value: '보통', emoji: '👌', desc: '평소처럼 괜찮아요', tone: 'yellow' },
        { label: '여유 있게', value: '여유', emoji: '✨', desc: '나를 위한 작은 사치', tone: 'pink' }
      ]
    },
    {
      key: 'time', label: '시간', title: '시간은 얼마나 있어요?', hint: '지금 쓸 수 있는 만큼만 골라주세요',
      options: [
        { label: '10분', value: '10분', emoji: '⏱️', desc: '빨리 끝내고 싶어요', tone: 'orange' },
        { label: '1시간', value: '1시간', emoji: '🕐', desc: '적당히 여유 있게', tone: 'mint' },
        { label: '반나절', value: '반나절', emoji: '🌤️', desc: '오늘은 넉넉해요', tone: 'sky' }
      ]
    },
    { key: 'mode', label: '방식', title: modeTitle[category] || modeTitle.eat, hint: modeHint[category] || modeHint.eat, options: modes[category] || modes.eat },
    {
      key: 'with', label: '함께', title: '혼자예요, 같이예요?', hint: '함께하는 사람에 맞춰 골라드릴게요',
      options: [
        { label: '혼자', value: '혼자', emoji: '🙋', desc: '나만의 시간', tone: 'yellow' },
        { label: '같이', value: '같이', emoji: '👫', desc: '친구·연인과 함께', tone: 'pink' }
      ]
    }
  ];
}

// '건너뛰기'를 누르면 남은 질문은 이 기본값으로 채워요.
export const SITUATION_DEFAULTS = {
  mood: '좋음', budget: '보통', time: '1시간', with: '혼자',
  mode: { eat: '배달', wear: '편한 외출', do: '집콕' }
};
