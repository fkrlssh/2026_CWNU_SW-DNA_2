// 하루에서 사용하는 목업 추천 데이터입니다. 태그와 조건을 바꾸면 추천 결과가 달라집니다.
export const CATALOG = {
  eat: [
    { id: 'soup-rice', title: '순두부찌개와 밥', emoji: '🍲', scene: '따뜻한 한 끼', reason: '피곤한 날엔 따뜻한 국물이 마음까지 든든해져요.', tags: ['한식'], budget: '저렴', minutes: 20, moods: ['피곤', '우울'], modes: ['배달', '외식', '집밥'], color: 'coral' },
    { id: 'pasta', title: '토마토 파스타', emoji: '🍝', scene: '기분 좋은 식사', reason: '기분 전환이 필요한 날, 산뜻한 토마토 한 접시 어때요?', tags: ['양식'], budget: '보통', minutes: 30, moods: ['좋음', '우울'], modes: ['배달', '외식', '집밥'], color: 'peach' },
    { id: 'sushi', title: '연어 초밥 세트', emoji: '🍣', scene: '가볍고 깔끔하게', reason: '깔끔한 한 끼가 당길 때 부담 없이 즐기기 좋아요.', tags: ['일식'], budget: '여유', minutes: 25, moods: ['좋음', '피곤'], modes: ['배달', '외식'], color: 'pink' },
    { id: 'tteokbokki', title: '떡볶이와 튀김', emoji: '🍢', scene: '스트레스 풀리는 맛', reason: '매콤달콤한 한 입으로 오늘의 기분을 환기해봐요.', tags: ['분식'], budget: '저렴', minutes: 20, moods: ['좋음', '우울'], modes: ['배달', '외식'], color: 'yellow' },
    { id: 'mapo-tofu', title: '마파두부 덮밥', emoji: '🥘', scene: '든든한 매콤함', reason: '입맛이 없을 때도 칼칼한 한 그릇이면 충분해요.', tags: ['중식'], budget: '보통', minutes: 25, moods: ['피곤', '좋음'], modes: ['배달', '외식', '집밥'], color: 'red' },
    { id: 'bibimbap', title: '제철 채소 비빔밥', emoji: '🥗', scene: '알록달록 균형 한 그릇', reason: '여러 가지 채소를 한 번에 챙기고 싶을 때 딱이에요.', tags: ['한식', '샐러드'], budget: '보통', minutes: 15, moods: ['좋음', '피곤'], modes: ['배달', '외식', '집밥'], color: 'mint' },
    { id: 'udon', title: '따끈한 우동', emoji: '🍜', scene: '속 편한 국물 한 그릇', reason: '복잡한 생각은 잠깐 내려놓고 편안하게 먹어요.', tags: ['일식'], budget: '저렴', minutes: 15, moods: ['피곤', '우울'], modes: ['배달', '외식', '집밥'], color: 'cream' },
    { id: 'sandwich', title: '아보카도 샌드위치', emoji: '🥪', scene: '산뜻한 간편식', reason: '가볍고 든든해서 바쁜 날에도 잘 어울려요.', tags: ['양식', '샐러드', '카페'], budget: '보통', minutes: 10, moods: ['좋음', '피곤'], modes: ['배달', '외식', '집밥'], color: 'green' },
    { id: 'gimbap', title: '참치 김밥 한 줄', emoji: '🍙', scene: '친근하고 간단하게', reason: '주머니도 마음도 가볍게 챙기는 익숙한 선택이에요.', tags: ['분식'], budget: '저렴', minutes: 10, moods: ['피곤', '좋음'], modes: ['배달', '외식', '집밥'], color: 'lime' }
  ],
  wear: [
    { id: 'minimal-knit', title: '포근한 니트와 슬랙스', emoji: '🧶', scene: '차분한 미니멀 룩', reason: '손이 자주 가는 편안한 조합으로 하루를 시작해요.', tags: ['미니멀', '캐주얼'], budget: '보통', minutes: 10, moods: ['피곤', '우울'], modes: ['출근·약속', '편한 외출', '집콕'], color: 'cream' },
    { id: 'street-layer', title: '후디와 와이드 팬츠', emoji: '🧢', scene: '가볍게 걸치는 스트릿 룩', reason: '움직임이 많은 날에도 편하고 나다운 스타일이에요.', tags: ['스트릿', '캐주얼', '편한 옷'], budget: '저렴', minutes: 8, moods: ['좋음', '피곤'], modes: ['출근·약속', '편한 외출', '집콕'], color: 'lavender' },
    { id: 'soft-dress', title: '가벼운 원피스와 가디건', emoji: '👗', scene: '산뜻한 약속 룩', reason: '고민 없이 툭 걸치면 단정하고 산뜻해 보여요.', tags: ['러블리', '미니멀', '포멀'], budget: '여유', minutes: 12, moods: ['좋음', '우울'], modes: ['출근·약속', '편한 외출'], color: 'pink' },
    { id: 'denim', title: '화이트 셔츠와 데님', emoji: '👖', scene: '언제나 좋은 캐주얼', reason: '어디서든 편안하고 실패 없는 조합이에요.', tags: ['캐주얼', '미니멀', '포멀'], budget: '보통', minutes: 10, moods: ['좋음', '피곤'], modes: ['출근·약속', '편한 외출'], color: 'blue' },
    { id: 'sporty', title: '맨투맨과 조거 팬츠', emoji: '👟', scene: '가뿐한 액티브 룩', reason: '산책이나 가벼운 운동에도 그대로 이어갈 수 있어요.', tags: ['스포티', '캐주얼', '편한 옷'], budget: '저렴', minutes: 7, moods: ['좋음', '피곤'], modes: ['편한 외출', '집콕'], color: 'mint' },
    { id: 'black-fit', title: '올블랙 편한 셋업', emoji: '🖤', scene: '꾸민 듯 편안하게', reason: '색 조합 고민 없이 깔끔한 분위기를 낼 수 있어요.', tags: ['스트릿', '미니멀', '편한 옷'], budget: '보통', minutes: 9, moods: ['우울', '피곤'], modes: ['출근·약속', '편한 외출', '집콕'], color: 'dark' },
    { id: 'linen', title: '린넨 셔츠와 면바지', emoji: '🌿', scene: '바람이 잘 통하는 하루', reason: '답답함 없이 산뜻해서 오래 입어도 편안해요.', tags: ['미니멀', '캐주얼'], budget: '여유', minutes: 10, moods: ['좋음', '피곤'], modes: ['출근·약속', '편한 외출'], color: 'green' },
    { id: 'homewear', title: '부드러운 홈웨어 세트', emoji: '☁️', scene: '집에서 쉬는 날', reason: '집콕하는 날엔 몸을 조이지 않는 게 제일이에요.', tags: ['캐주얼', '스포티', '편한 옷'], budget: '저렴', minutes: 3, moods: ['피곤', '우울'], modes: ['집콕'], color: 'sky' },
    { id: 'color-pop', title: '컬러 니트 포인트 룩', emoji: '🧥', scene: '기분을 바꾸는 색 한 점', reason: '좋아하는 색을 더하면 평범한 하루도 특별해져요.', tags: ['스트릿', '러블리'], budget: '여유', minutes: 12, moods: ['좋음', '우울'], modes: ['출근·약속', '편한 외출'], color: 'yellow' }
  ],
  do: [
    { id: 'home-tea', title: '좋아하는 차 한 잔', emoji: '🍵', scene: '집에서 천천히 쉬기', reason: '피곤한 날엔 따뜻한 차와 조용한 시간이 최고예요.', tags: ['집콕'], budget: '저렴', minutes: 10, moods: ['피곤', '우울'], modes: ['집콕', '가벼운 외출', '문화생활'], color: 'mint' },
    { id: 'walk', title: '동네 한 바퀴 산책', emoji: '🚶', scene: '바깥 공기 쐬기', reason: '10분만 걸어도 머릿속이 한결 가벼워질 거예요.', tags: ['산책'], budget: '저렴', minutes: 20, moods: ['피곤', '우울', '좋음'], modes: ['집콕', '가벼운 외출'], color: 'green' },
    { id: 'workout', title: '15분 홈 스트레칭', emoji: '🧘', scene: '몸을 깨우는 가벼운 운동', reason: '부담 없는 움직임으로 굳은 몸을 살짝 풀어봐요.', tags: ['운동', '집콕'], budget: '저렴', minutes: 15, moods: ['피곤', '좋음'], modes: ['집콕', '가벼운 외출'], color: 'lavender' },
    { id: 'exhibition', title: '작은 전시 구경하기', emoji: '🖼️', scene: '느긋한 문화생활', reason: '새로운 장면을 보면 기분도 자연스레 환기돼요.', tags: ['문화생활'], budget: '여유', minutes: 120, moods: ['좋음', '우울'], modes: ['가벼운 외출', '문화생활'], color: 'peach' },
    { id: 'movie', title: '좋아하는 영화 한 편', emoji: '🎬', scene: '집에서 작은 영화관', reason: '오늘은 좋아하는 장면 속에 잠깐 쉬어가요.', tags: ['집콕', '문화생활'], budget: '보통', minutes: 120, moods: ['피곤', '우울', '좋음'], modes: ['집콕', '문화생활'], color: 'blue' },
    { id: 'book-cafe', title: '조용한 카페에서 책 읽기', emoji: '📖', scene: '나에게 집중하는 시간', reason: '커피 한 잔과 함께 천천히 나만의 시간을 보내요.', tags: ['문화생활', '산책', '카페'], budget: '보통', minutes: 60, moods: ['좋음', '피곤'], modes: ['가벼운 외출', '문화생활'], color: 'cream' },
    { id: 'playlist', title: '플레이리스트 들으며 정리', emoji: '🎧', scene: '내 공간 가볍게 돌보기', reason: '좋아하는 음악 세 곡이면 정리도 덜 귀찮아져요.', tags: ['집콕'], budget: '저렴', minutes: 20, moods: ['피곤', '우울'], modes: ['집콕'], color: 'pink' },
    { id: 'market', title: '새로운 동네 빵집 가기', emoji: '🥐', scene: '가까운 곳에서 작은 발견', reason: '멀리 가지 않아도 소소한 즐거움을 만날 수 있어요.', tags: ['산책', '문화생활', '카페', '디저트'], budget: '보통', minutes: 30, moods: ['좋음', '우울'], modes: ['가벼운 외출', '문화생활'], color: 'yellow' },
    { id: 'stretch', title: '창가에서 햇빛 받기', emoji: '☀️', scene: '아주 작게 기분 전환', reason: '창문을 열고 햇빛을 받으며 깊게 숨 쉬어봐요.', tags: ['집콕', '운동'], budget: '저렴', minutes: 10, moods: ['피곤', '우울', '좋음'], modes: ['집콕'], color: 'orange' },
    { id: 'window-shopping', title: '쇼핑몰 가볍게 구경', emoji: '🛍️', scene: '사지 않아도 즐거운 구경', reason: '구경만 해도 기분 전환이 되고 걸음 수도 채워져요.', tags: ['쇼핑', '문화생활'], budget: '보통', minutes: 90, moods: ['좋음', '우울'], modes: ['가벼운 외출', '문화생활'], color: 'pink' },
    { id: 'cook', title: '간단한 한 그릇 요리', emoji: '🍳', scene: '나를 위한 요리 시간', reason: '직접 만든 한 그릇은 뿌듯함까지 함께 채워줘요.', tags: ['요리', '집콕'], budget: '저렴', minutes: 40, moods: ['좋음', '피곤'], modes: ['집콕'], color: 'orange' }
  ]
};

export const CATEGORIES = [
  { id: 'eat', title: '뭐 먹지', subtitle: '배부터 마음까지 든든하게', emoji: '🍚', color: 'food' },
  { id: 'wear', title: '뭐 입지', subtitle: '오늘의 나에게 어울리게', emoji: '👕', color: 'style' },
  { id: 'do', title: '뭐 하지', subtitle: '기분 좋은 시간을 골라봐요', emoji: '🌿', color: 'activity' }
];

export const TASTE_GROUPS = [
  { id: 'food', title: '요즘 끌리는 음식', hint: '하나 이상 골라주세요', choices: ['한식', '양식', '중식', '일식', '분식'] },
  { id: 'style', title: '자주 입는 스타일', hint: '하나 이상 골라주세요', choices: ['캐주얼', '미니멀', '스트릿', '스포티', '러블리'] },
  { id: 'activity', title: '좋아하는 시간', hint: '하나 이상 골라주세요', choices: ['집콕', '산책', '운동', '문화생활', '요리'] }
];
