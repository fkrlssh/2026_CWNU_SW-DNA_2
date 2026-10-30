// 하루의 추천 카탈로그입니다. 서버(server/recommendation-adapter.js)가 이 데이터로 추천합니다.
// 필드: tags(온보딩 칩 태그) · budget(저렴|보통|여유) · minutes(소요 분) · moods(좋음|피곤|우울) · modes(카테고리별 방식)
// 음식의 allergens 는 일반적인 재료 기준 보수적 추정치(해산물|견과류|우유|달걀|밀|대두)이며 실제 성분을 보장하지 않습니다.
// 항목을 추가하면 server/backend_A/ai/places.js 의 PLACE_SEARCH_BY_ID 에 장소 검색어(또는 null)도 함께 정해 주세요.
export const CATALOG = {
  eat: [
    // 한식
    { id: 'soup-rice', title: '순두부찌개와 밥', emoji: '🍲', scene: '따뜻한 한 끼', reason: '피곤한 날엔 따뜻한 국물이 마음까지 든든해져요.', tags: ['한식'], budget: '저렴', minutes: 20, moods: ['피곤', '우울'], modes: ['배달', '외식', '집밥'], color: 'coral', allergens: ['해산물', '달걀', '대두'] },
    { id: 'bibimbap', title: '제철 채소 비빔밥', emoji: '🥗', scene: '알록달록 균형 한 그릇', reason: '여러 가지 채소를 한 번에 챙기고 싶을 때 딱이에요.', tags: ['한식', '샐러드'], budget: '보통', minutes: 15, moods: ['좋음', '피곤'], modes: ['배달', '외식', '집밥'], color: 'mint', allergens: ['달걀', '대두', '밀'] },
    { id: 'kimchi-stew', title: '김치찌개와 흰쌀밥', emoji: '🍲', scene: '실패 없는 집밥', reason: '칼칼한 국물 한 숟갈이면 입맛이 금세 돌아와요.', tags: ['한식'], budget: '저렴', minutes: 20, moods: ['피곤', '우울'], modes: ['배달', '외식', '집밥'], color: 'red', allergens: ['해산물', '대두'] },
    { id: 'bulgogi-bowl', title: '불고기 덮밥', emoji: '🍚', scene: '달큰하게 든든한 한 그릇', reason: '고민 없이 든든하게, 누구나 좋아하는 맛이에요.', tags: ['한식'], budget: '보통', minutes: 20, moods: ['좋음', '피곤'], modes: ['배달', '외식', '집밥'], color: 'orange', allergens: ['대두', '밀'] },
    { id: 'samgyetang', title: '삼계탕 한 그릇', emoji: '🍗', scene: '기운 차리는 보양식', reason: '몸이 지친 날엔 뜨끈한 국물로 기운을 채워요.', tags: ['한식'], budget: '여유', minutes: 30, moods: ['피곤'], modes: ['외식', '배달'], color: 'cream', allergens: ['견과류'] },
    { id: 'naengmyeon', title: '시원한 물냉면', emoji: '🍜', scene: '속까지 시원하게', reason: '답답한 날엔 살얼음 육수 한 모금이 제일이에요.', tags: ['한식'], budget: '보통', minutes: 15, moods: ['좋음', '피곤'], modes: ['외식', '배달'], color: 'sky', allergens: ['밀', '달걀', '대두'] },
    { id: 'kalguksu', title: '바지락 칼국수', emoji: '🍜', scene: '뜨끈하고 구수하게', reason: '후루룩 넘어가는 면발이 지친 하루를 달래줘요.', tags: ['한식'], budget: '저렴', minutes: 25, moods: ['피곤', '우울'], modes: ['외식', '집밥'], color: 'mint', allergens: ['밀', '해산물'] },
    { id: 'jeyuk', title: '제육볶음 정식', emoji: '🌶️', scene: '매콤하게 밥 한 공기', reason: '매콤한 양념에 밥을 비비면 스트레스가 같이 넘어가요.', tags: ['한식'], budget: '보통', minutes: 25, moods: ['좋음', '우울'], modes: ['배달', '외식', '집밥'], color: 'red', allergens: ['대두', '밀'] },
    { id: 'gukbap', title: '뜨끈한 돼지국밥', emoji: '🍲', scene: '빠르고 든든하게', reason: '기다림 없이 뚝딱, 속은 오래 든든해요.', tags: ['한식'], budget: '저렴', minutes: 15, moods: ['피곤', '우울'], modes: ['외식'], color: 'peach', allergens: ['대두', '해산물'] },
    { id: 'dakgalbi', title: '춘천식 닭갈비', emoji: '🍗', scene: '둘러앉아 볶아 먹기', reason: '지글지글 볶는 소리부터 기분이 좋아지는 메뉴예요.', tags: ['한식'], budget: '보통', minutes: 40, moods: ['좋음'], modes: ['외식', '배달'], color: 'red', allergens: ['대두', '밀'] },
    { id: 'chicken', title: '바삭한 후라이드 치킨', emoji: '🍗', scene: '오늘은 치킨이 답', reason: '고민이 길어질 땐 모두가 좋아하는 선택이 정답이에요.', tags: ['한식'], budget: '보통', minutes: 35, moods: ['좋음', '우울'], modes: ['배달', '외식'], color: 'yellow', allergens: ['밀', '달걀', '우유', '대두'] },
    // 양식
    { id: 'pasta', title: '토마토 파스타', emoji: '🍝', scene: '기분 좋은 식사', reason: '기분 전환이 필요한 날, 산뜻한 토마토 한 접시 어때요?', tags: ['양식'], budget: '보통', minutes: 30, moods: ['좋음', '우울'], modes: ['배달', '외식', '집밥'], color: 'peach', allergens: ['밀', '우유', '달걀'] },
    { id: 'sandwich', title: '아보카도 샌드위치', emoji: '🥪', scene: '산뜻한 간편식', reason: '가볍고 든든해서 바쁜 날에도 잘 어울려요.', tags: ['양식', '샐러드', '카페'], budget: '보통', minutes: 10, moods: ['좋음', '피곤'], modes: ['배달', '외식', '집밥'], color: 'green', allergens: ['밀', '달걀', '우유'] },
    { id: 'cream-pasta', title: '크림 파스타', emoji: '🍝', scene: '부드럽게 위로받는 맛', reason: '고소하고 부드러운 소스가 마음까지 감싸줘요.', tags: ['양식'], budget: '보통', minutes: 30, moods: ['우울', '피곤'], modes: ['배달', '외식', '집밥'], color: 'cream', allergens: ['밀', '우유', '달걀'] },
    { id: 'steak', title: '함박스테이크 플레이트', emoji: '🥩', scene: '나를 위한 작은 사치', reason: '수고한 나에게 제대로 된 한 접시를 선물해요.', tags: ['양식'], budget: '여유', minutes: 40, moods: ['좋음', '우울'], modes: ['외식', '배달'], color: 'dark', allergens: ['밀', '달걀', '우유', '대두'] },
    { id: 'pizza', title: '마르게리타 피자', emoji: '🍕', scene: '나눠 먹기 좋은 한 판', reason: '치즈가 늘어나는 순간, 고민도 같이 늘어져요.', tags: ['양식'], budget: '보통', minutes: 30, moods: ['좋음', '우울'], modes: ['배달', '외식'], color: 'red', allergens: ['밀', '우유'] },
    { id: 'risotto', title: '버섯 크림 리조또', emoji: '🍄', scene: '천천히 음미하는 한 그릇', reason: '한 숟갈씩 천천히 먹다 보면 마음이 가라앉아요.', tags: ['양식'], budget: '여유', minutes: 35, moods: ['피곤', '우울'], modes: ['외식', '집밥'], color: 'cream', allergens: ['우유'] },
    { id: 'burger', title: '두툼한 수제버거', emoji: '🍔', scene: '한 입 크게 베어 물기', reason: '크게 한 입 베어 물면 답답함이 확 풀려요.', tags: ['양식'], budget: '보통', minutes: 20, moods: ['좋음', '피곤'], modes: ['배달', '외식'], color: 'orange', allergens: ['밀', '달걀', '우유', '대두'] },
    { id: 'brunch', title: '에그 브런치 플레이트', emoji: '🍳', scene: '느긋한 주말 기분', reason: '햇살 드는 자리에서 천천히 먹으면 하루가 여유로워져요.', tags: ['양식', '카페'], budget: '여유', minutes: 30, moods: ['좋음'], modes: ['외식'], color: 'peach', allergens: ['밀', '달걀', '우유'] },
    // 중식
    { id: 'mapo-tofu', title: '마파두부 덮밥', emoji: '🥘', scene: '든든한 매콤함', reason: '입맛이 없을 때도 칼칼한 한 그릇이면 충분해요.', tags: ['중식'], budget: '보통', minutes: 25, moods: ['피곤', '좋음'], modes: ['배달', '외식', '집밥'], color: 'red', allergens: ['대두', '밀'] },
    { id: 'jjajang', title: '짜장면 한 그릇', emoji: '🍜', scene: '고민 없는 국민 메뉴', reason: '뭘 먹을지 모르겠을 땐 짜장면이 늘 정답이에요.', tags: ['중식'], budget: '저렴', minutes: 15, moods: ['피곤', '우울'], modes: ['배달', '외식'], color: 'dark', allergens: ['밀', '대두'] },
    { id: 'jjamppong', title: '얼큰한 해물 짬뽕', emoji: '🍜', scene: '속 풀리는 매운 국물', reason: '얼큰한 국물 한 그릇이면 땀과 함께 피로가 빠져요.', tags: ['중식'], budget: '보통', minutes: 20, moods: ['피곤', '우울'], modes: ['배달', '외식'], color: 'red', allergens: ['밀', '해산물', '대두'] },
    { id: 'tangsuyuk', title: '찹쌀 탕수육', emoji: '🍖', scene: '바삭달콤한 기분 전환', reason: '바삭한 튀김옷에 새콤달콤 소스면 기분이 올라가요.', tags: ['중식'], budget: '보통', minutes: 30, moods: ['좋음'], modes: ['배달', '외식'], color: 'orange', allergens: ['밀', '대두', '달걀'] },
    { id: 'yangkkochi', title: '양꼬치와 꿔바로우', emoji: '🍢', scene: '지글지글 저녁 모임', reason: '구워 먹는 재미까지 있어 저녁 시간이 길어져요.', tags: ['중식'], budget: '여유', minutes: 60, moods: ['좋음'], modes: ['외식'], color: 'red', allergens: ['밀', '대두'] },
    { id: 'dimsum', title: '딤섬 세트', emoji: '🥟', scene: '한 입씩 골라 먹기', reason: '종류별로 하나씩 맛보는 재미가 쏠쏠해요.', tags: ['중식'], budget: '보통', minutes: 30, moods: ['좋음', '피곤'], modes: ['외식', '배달'], color: 'pink', allergens: ['밀', '해산물', '대두'] },
    // 일식
    { id: 'sushi', title: '연어 초밥 세트', emoji: '🍣', scene: '가볍고 깔끔하게', reason: '깔끔한 한 끼가 당길 때 부담 없이 즐기기 좋아요.', tags: ['일식'], budget: '여유', minutes: 25, moods: ['좋음', '피곤'], modes: ['배달', '외식'], color: 'pink', allergens: ['해산물', '달걀', '대두', '밀'] },
    { id: 'udon', title: '따끈한 우동', emoji: '🍜', scene: '속 편한 국물 한 그릇', reason: '복잡한 생각은 잠깐 내려놓고 편안하게 먹어요.', tags: ['일식'], budget: '저렴', minutes: 15, moods: ['피곤', '우울'], modes: ['배달', '외식', '집밥'], color: 'cream', allergens: ['밀', '해산물', '대두'] },
    { id: 'ramen', title: '진한 돈코츠 라멘', emoji: '🍜', scene: '진한 국물에 기대기', reason: '깊고 진한 국물이 허기와 피로를 한 번에 달래줘요.', tags: ['일식'], budget: '보통', minutes: 20, moods: ['피곤', '우울'], modes: ['외식', '배달'], color: 'cream', allergens: ['밀', '달걀', '대두'] },
    { id: 'donkatsu', title: '두툼한 수제 돈까스', emoji: '🍱', scene: '바삭하게 든든한 한 접시', reason: '바삭한 소리만으로도 기분이 좋아지는 메뉴예요.', tags: ['일식'], budget: '보통', minutes: 25, moods: ['좋음', '피곤'], modes: ['배달', '외식'], color: 'yellow', allergens: ['밀', '달걀', '우유', '대두'] },
    { id: 'sashimi', title: '모둠 회 한 접시', emoji: '🐟', scene: '신선하게 즐기는 저녁', reason: '신선한 한 점에 하루의 피로가 사르르 녹아요.', tags: ['일식'], budget: '여유', minutes: 60, moods: ['좋음'], modes: ['외식'], color: 'sky', allergens: ['해산물', '대두'] },
    { id: 'japanese-curry', title: '일본식 카레라이스', emoji: '🍛', scene: '포근하고 익숙한 맛', reason: '부드럽고 익숙한 맛이라 지친 날에도 술술 넘어가요.', tags: ['일식'], budget: '저렴', minutes: 15, moods: ['피곤', '우울'], modes: ['배달', '외식', '집밥'], color: 'orange', allergens: ['밀', '대두'] },
    // 분식
    { id: 'tteokbokki', title: '떡볶이와 튀김', emoji: '🍢', scene: '스트레스 풀리는 맛', reason: '매콤달콤한 한 입으로 오늘의 기분을 환기해봐요.', tags: ['분식'], budget: '저렴', minutes: 20, moods: ['좋음', '우울'], modes: ['배달', '외식'], color: 'yellow', allergens: ['밀', '해산물', '달걀', '대두'] },
    { id: 'gimbap', title: '참치 김밥 한 줄', emoji: '🍙', scene: '친근하고 간단하게', reason: '주머니도 마음도 가볍게 챙기는 익숙한 선택이에요.', tags: ['분식'], budget: '저렴', minutes: 10, moods: ['피곤', '좋음'], modes: ['배달', '외식', '집밥'], color: 'lime', allergens: ['해산물', '달걀', '대두', '밀'] },
    { id: 'ramyeon', title: '라면과 김밥 한 줄', emoji: '🍜', scene: '10분 만에 완성', reason: '빠르고 익숙한 조합으로 허기를 금세 달래요.', tags: ['분식'], budget: '저렴', minutes: 10, moods: ['피곤', '우울'], modes: ['집밥', '외식'], color: 'red', allergens: ['밀', '달걀', '대두', '해산물'] },
    { id: 'sundae-tteok', title: '순대와 어묵', emoji: '🍢', scene: '포장마차 감성', reason: '따끈한 어묵 국물이 몸도 마음도 녹여줘요.', tags: ['분식'], budget: '저렴', minutes: 15, moods: ['우울', '좋음'], modes: ['외식', '배달'], color: 'coral', allergens: ['밀', '해산물', '대두'] },
    // 샐러드
    { id: 'poke', title: '연어 포케', emoji: '🥗', scene: '가볍지만 든든하게', reason: '산뜻하고 건강해서 먹고 나면 몸이 가벼워요.', tags: ['샐러드'], budget: '여유', minutes: 15, moods: ['좋음', '피곤'], modes: ['배달', '외식'], color: 'green', allergens: ['해산물', '대두'] },
    { id: 'chicken-salad', title: '닭가슴살 샐러드', emoji: '🥗', scene: '가볍게 채우는 한 끼', reason: '속은 가볍게, 단백질은 든든하게 챙길 수 있어요.', tags: ['샐러드'], budget: '보통', minutes: 10, moods: ['좋음', '피곤'], modes: ['배달', '집밥', '외식'], color: 'lime', allergens: ['달걀', '우유'] },
    { id: 'grain-bowl', title: '곡물 샐러드 볼', emoji: '🥣', scene: '꼭꼭 씹는 건강한 포만감', reason: '씹을수록 고소해서 천천히 먹게 되는 한 그릇이에요.', tags: ['샐러드'], budget: '보통', minutes: 15, moods: ['좋음'], modes: ['배달', '외식', '집밥'], color: 'mint', allergens: ['견과류', '대두'] },
    // 디저트
    { id: 'cake-latte', title: '딸기 케이크와 라떼', emoji: '🍰', scene: '달콤한 쉼표', reason: '기운 없는 날엔 달콤한 한 조각이 힘이 돼요.', tags: ['디저트', '카페'], budget: '보통', minutes: 20, moods: ['우울', '좋음'], modes: ['외식'], color: 'pink', allergens: ['밀', '우유', '달걀'] },
    { id: 'bingsu', title: '팥빙수 한 그릇', emoji: '🍧', scene: '시원하게 나눠 먹기', reason: '한 숟갈씩 나눠 먹다 보면 더위도 피로도 녹아요.', tags: ['디저트'], budget: '보통', minutes: 20, moods: ['좋음'], modes: ['외식', '배달'], color: 'sky', allergens: ['우유', '견과류'] },
    { id: 'croissant', title: '크루아상과 아메리카노', emoji: '🥐', scene: '바삭한 아침 기분', reason: '바삭한 결 사이로 커피 향이 스며드는 작은 호사예요.', tags: ['디저트', '카페'], budget: '저렴', minutes: 15, moods: ['피곤', '좋음'], modes: ['외식'], color: 'cream', allergens: ['밀', '우유', '달걀'] }
  ],
  wear: [
    // 캐주얼
    { id: 'minimal-knit', title: '포근한 니트와 슬랙스', emoji: '🧶', scene: '차분한 미니멀 룩', reason: '손이 자주 가는 편안한 조합으로 하루를 시작해요.', tags: ['미니멀', '캐주얼'], budget: '보통', minutes: 10, moods: ['피곤', '우울'], modes: ['출근·약속', '편한 외출', '집콕'], color: 'cream' },
    { id: 'denim', title: '화이트 셔츠와 데님', emoji: '👖', scene: '언제나 좋은 캐주얼', reason: '어디서든 편안하고 실패 없는 조합이에요.', tags: ['캐주얼', '미니멀', '포멀'], budget: '보통', minutes: 10, moods: ['좋음', '피곤'], modes: ['출근·약속', '편한 외출'], color: 'blue' },
    { id: 'linen', title: '린넨 셔츠와 면바지', emoji: '🌿', scene: '바람이 잘 통하는 하루', reason: '답답함 없이 산뜻해서 오래 입어도 편안해요.', tags: ['미니멀', '캐주얼'], budget: '여유', minutes: 10, moods: ['좋음', '피곤'], modes: ['출근·약속', '편한 외출'], color: 'green' },
    { id: 'hoodie-jogger', title: '후드티와 조거팬츠', emoji: '🧥', scene: '편하게 툭 걸치기', reason: '고민 없이 걸쳐도 단정하고 움직이기 편해요.', tags: ['캐주얼', '편한 옷'], budget: '저렴', minutes: 5, moods: ['피곤', '좋음'], modes: ['편한 외출', '집콕'], color: 'sky' },
    { id: 'cardigan-tee', title: '가디건과 흰 티', emoji: '🧶', scene: '온도에 맞춰 여닫기', reason: '덥거나 추울 때 벗고 걸치기 좋아 하루 종일 편해요.', tags: ['캐주얼', '미니멀'], budget: '보통', minutes: 8, moods: ['좋음', '피곤'], modes: ['출근·약속', '편한 외출'], color: 'cream' },
    { id: 'chino-polo', title: '폴로 셔츠와 치노 팬츠', emoji: '👔', scene: '단정한 캐주얼', reason: '편하면서도 깔끔해서 어떤 약속에도 무난해요.', tags: ['캐주얼', '포멀'], budget: '보통', minutes: 10, moods: ['좋음'], modes: ['출근·약속', '편한 외출'], color: 'green' },
    { id: 'stripe-tee', title: '스트라이프 티와 청바지', emoji: '👕', scene: '산뜻하게 기본으로', reason: '기본템끼리 만나면 꾸민 티 없이 산뜻해 보여요.', tags: ['캐주얼'], budget: '저렴', minutes: 7, moods: ['좋음', '피곤'], modes: ['편한 외출', '집콕'], color: 'blue' },
    // 미니멀
    { id: 'beige-set', title: '베이지 톤온톤 셋업', emoji: '🤎', scene: '차분하게 정돈된 느낌', reason: '색을 맞추기만 해도 단정하고 차분해 보여요.', tags: ['미니멀'], budget: '보통', minutes: 10, moods: ['피곤', '좋음'], modes: ['출근·약속', '편한 외출'], color: 'cream' },
    { id: 'trench', title: '트렌치코트와 슬랙스', emoji: '🧥', scene: '걸치기만 해도 분위기', reason: '툭 걸치기만 해도 하루가 조금 특별해져요.', tags: ['미니멀', '포멀'], budget: '여유', minutes: 12, moods: ['좋음', '우울'], modes: ['출근·약속', '편한 외출'], color: 'peach' },
    { id: 'knit-vest', title: '니트 베스트와 셔츠', emoji: '🦺', scene: '단정한 레이어드', reason: '셔츠 위에 하나만 더해도 정성 들인 느낌이 나요.', tags: ['미니멀', '캐주얼'], budget: '보통', minutes: 10, moods: ['좋음'], modes: ['출근·약속', '편한 외출'], color: 'yellow' },
    { id: 'black-fit', title: '올블랙 편한 셋업', emoji: '🖤', scene: '꾸민 듯 편안하게', reason: '색 조합 고민 없이 깔끔한 분위기를 낼 수 있어요.', tags: ['스트릿', '미니멀', '편한 옷'], budget: '보통', minutes: 9, moods: ['우울', '피곤'], modes: ['출근·약속', '편한 외출', '집콕'], color: 'dark' },
    // 스트릿
    { id: 'street-layer', title: '후디와 와이드 팬츠', emoji: '🧢', scene: '가볍게 걸치는 스트릿 룩', reason: '움직임이 많은 날에도 편하고 나다운 스타일이에요.', tags: ['스트릿', '캐주얼', '편한 옷'], budget: '저렴', minutes: 8, moods: ['좋음', '피곤'], modes: ['출근·약속', '편한 외출', '집콕'], color: 'lavender' },
    { id: 'graphic-wide', title: '그래픽 티와 와이드 팬츠', emoji: '👕', scene: '힘 빼고 멋 내기', reason: '티 한 장으로 포인트를 주면 힘 빼고도 멋이 나요.', tags: ['스트릿', '캐주얼'], budget: '저렴', minutes: 8, moods: ['좋음'], modes: ['편한 외출'], color: 'lime' },
    { id: 'cargo', title: '카고 팬츠와 크롭 재킷', emoji: '🧢', scene: '활동적인 스트릿 룩', reason: '주머니 많은 바지 하나로 하루가 가벼워져요.', tags: ['스트릿'], budget: '보통', minutes: 10, moods: ['좋음'], modes: ['편한 외출'], color: 'green' },
    { id: 'varsity', title: '바시티 재킷과 데님', emoji: '🏈', scene: '경쾌하게 기분 전환', reason: '재킷 하나로 기분까지 경쾌해지는 조합이에요.', tags: ['스트릿', '캐주얼'], budget: '보통', minutes: 10, moods: ['좋음', '우울'], modes: ['편한 외출', '출근·약속'], color: 'red' },
    { id: 'bucket-hat', title: '버킷햇과 오버핏 티', emoji: '🎩', scene: '머리 안 감은 날의 구원', reason: '모자 하나로 준비 시간을 확 줄일 수 있어요.', tags: ['스트릿', '편한 옷'], budget: '저렴', minutes: 5, moods: ['피곤', '좋음'], modes: ['편한 외출'], color: 'orange' },
    // 스포티
    { id: 'sporty', title: '맨투맨과 조거 팬츠', emoji: '👟', scene: '가뿐한 액티브 룩', reason: '산책이나 가벼운 운동에도 그대로 이어갈 수 있어요.', tags: ['스포티', '캐주얼', '편한 옷'], budget: '저렴', minutes: 7, moods: ['좋음', '피곤'], modes: ['편한 외출', '집콕'], color: 'mint' },
    { id: 'leggings', title: '레깅스와 윈드브레이커', emoji: '🏃', scene: '바로 움직일 수 있게', reason: '입은 채로 바로 걷거나 뛸 수 있어 핑계가 사라져요.', tags: ['스포티', '편한 옷'], budget: '저렴', minutes: 5, moods: ['좋음', '피곤'], modes: ['편한 외출', '집콕'], color: 'mint' },
    { id: 'track-set', title: '트랙 재킷 셋업', emoji: '🎽', scene: '위아래 세트로 간편하게', reason: '세트라 고를 게 없어 아침이 편해져요.', tags: ['스포티', '스트릿'], budget: '보통', minutes: 6, moods: ['좋음'], modes: ['편한 외출', '집콕'], color: 'blue' },
    // 러블리
    { id: 'soft-dress', title: '가벼운 원피스와 가디건', emoji: '👗', scene: '산뜻한 약속 룩', reason: '고민 없이 툭 걸치면 단정하고 산뜻해 보여요.', tags: ['러블리', '미니멀', '포멀'], budget: '여유', minutes: 12, moods: ['좋음', '우울'], modes: ['출근·약속', '편한 외출'], color: 'pink' },
    { id: 'color-pop', title: '컬러 니트 포인트 룩', emoji: '🧥', scene: '기분을 바꾸는 색 한 점', reason: '좋아하는 색을 더하면 평범한 하루도 특별해져요.', tags: ['스트릿', '러블리'], budget: '여유', minutes: 12, moods: ['좋음', '우울'], modes: ['출근·약속', '편한 외출'], color: 'yellow' },
    { id: 'pleated', title: '플리츠 스커트와 블라우스', emoji: '👚', scene: '걸을 때마다 살랑', reason: '걸음마다 살랑이는 주름이 기분을 가볍게 해줘요.', tags: ['러블리', '포멀'], budget: '보통', minutes: 12, moods: ['좋음', '우울'], modes: ['출근·약속', '편한 외출'], color: 'pink' },
    { id: 'floral', title: '플라워 원피스와 플랫슈즈', emoji: '🌸', scene: '화사하게 나들이', reason: '한 벌로 끝나는 코디라 준비는 쉽고 기분은 화사해요.', tags: ['러블리'], budget: '보통', minutes: 10, moods: ['좋음'], modes: ['편한 외출', '출근·약속'], color: 'peach' },
    { id: 'ribbon-knit', title: '리본 니트와 롱스커트', emoji: '🎀', scene: '부드럽게 여성스럽게', reason: '포근한 니트에 작은 포인트면 기분이 한결 부드러워요.', tags: ['러블리', '미니멀'], budget: '보통', minutes: 12, moods: ['우울', '좋음'], modes: ['출근·약속', '편한 외출'], color: 'lavender' },
    // 포멀
    { id: 'tailored', title: '셔츠와 테일러드 재킷', emoji: '🧥', scene: '중요한 자리를 위한 한 벌', reason: '어깨선이 잡히면 자세도 마음도 반듯해져요.', tags: ['포멀', '미니멀'], budget: '여유', minutes: 15, moods: ['좋음'], modes: ['출근·약속'], color: 'dark' },
    { id: 'suit', title: '깔끔한 정장 셋업', emoji: '👔', scene: '격식이 필요한 날', reason: '고민할 필요 없이 가장 믿음직한 선택이에요.', tags: ['포멀'], budget: '여유', minutes: 15, moods: ['좋음', '피곤'], modes: ['출근·약속'], color: 'dark' },
    { id: 'blouse-slacks', title: '블라우스와 와이드 슬랙스', emoji: '👚', scene: '단정하지만 편하게', reason: '격식은 갖추되 하루 종일 편안하게 움직일 수 있어요.', tags: ['포멀', '미니멀'], budget: '보통', minutes: 12, moods: ['피곤', '좋음'], modes: ['출근·약속'], color: 'sky' },
    // 편한 옷
    { id: 'homewear', title: '부드러운 홈웨어 세트', emoji: '☁️', scene: '집에서 쉬는 날', reason: '집콕하는 날엔 몸을 조이지 않는 게 제일이에요.', tags: ['캐주얼', '스포티', '편한 옷'], budget: '저렴', minutes: 3, moods: ['피곤', '우울'], modes: ['집콕'], color: 'sky' },
    { id: 'fleece', title: '후리스와 조거 팬츠', emoji: '🧸', scene: '포근하게 감싸기', reason: '보드라운 감촉이 지친 몸을 포근하게 감싸줘요.', tags: ['편한 옷', '캐주얼'], budget: '저렴', minutes: 4, moods: ['피곤', '우울'], modes: ['집콕', '편한 외출'], color: 'coral' },
    { id: 'lounge', title: '잠옷처럼 편한 라운지 세트', emoji: '🛋️', scene: '아무것도 안 하는 날', reason: '오늘만큼은 편한 옷으로 몸부터 쉬게 해줘요.', tags: ['편한 옷'], budget: '저렴', minutes: 3, moods: ['피곤', '우울'], modes: ['집콕'], color: 'lavender' }
  ],
  do: [
    // 집에서
    { id: 'home-tea', title: '좋아하는 차 한 잔', emoji: '🍵', scene: '집에서 천천히 쉬기', reason: '피곤한 날엔 따뜻한 차와 조용한 시간이 최고예요.', tags: ['집콕'], budget: '저렴', minutes: 10, moods: ['피곤', '우울'], modes: ['집콕', '가벼운 외출', '문화생활'], color: 'mint' },
    { id: 'workout', title: '15분 홈 스트레칭', emoji: '🧘', scene: '몸을 깨우는 가벼운 운동', reason: '부담 없는 움직임으로 굳은 몸을 살짝 풀어봐요.', tags: ['운동', '집콕'], budget: '저렴', minutes: 15, moods: ['피곤', '좋음'], modes: ['집콕', '가벼운 외출'], color: 'lavender' },
    { id: 'movie', title: '좋아하는 영화 한 편', emoji: '🎬', scene: '집에서 작은 영화관', reason: '오늘은 좋아하는 장면 속에 잠깐 쉬어가요.', tags: ['집콕', '문화생활'], budget: '보통', minutes: 120, moods: ['피곤', '우울', '좋음'], modes: ['집콕', '문화생활'], color: 'blue' },
    { id: 'playlist', title: '플레이리스트 들으며 정리', emoji: '🎧', scene: '내 공간 가볍게 돌보기', reason: '좋아하는 음악 세 곡이면 정리도 덜 귀찮아져요.', tags: ['집콕'], budget: '저렴', minutes: 20, moods: ['피곤', '우울'], modes: ['집콕'], color: 'pink' },
    { id: 'stretch', title: '창가에서 햇빛 받기', emoji: '☀️', scene: '아주 작게 기분 전환', reason: '창문을 열고 햇빛을 받으며 깊게 숨 쉬어봐요.', tags: ['집콕', '운동'], budget: '저렴', minutes: 10, moods: ['피곤', '우울', '좋음'], modes: ['집콕'], color: 'orange' },
    { id: 'cook', title: '간단한 한 그릇 요리', emoji: '🍳', scene: '나를 위한 요리 시간', reason: '직접 만든 한 그릇은 뿌듯함까지 함께 채워줘요.', tags: ['요리', '집콕'], budget: '저렴', minutes: 40, moods: ['좋음', '피곤'], modes: ['집콕'], color: 'orange' },
    { id: 'journaling', title: '일기 쓰며 하루 정리', emoji: '📓', scene: '마음을 글로 꺼내기', reason: '머릿속 생각을 적어 내려가면 마음이 한결 정리돼요.', tags: ['집콕'], budget: '저렴', minutes: 15, moods: ['우울', '피곤'], modes: ['집콕'], color: 'cream' },
    { id: 'bath', title: '따뜻한 반신욕', emoji: '🛁', scene: '몸부터 풀어주기', reason: '따뜻한 물에 몸을 담그면 긴장이 스르르 풀려요.', tags: ['집콕'], budget: '저렴', minutes: 30, moods: ['피곤', '우울'], modes: ['집콕'], color: 'sky' },
    { id: 'puzzle', title: '퍼즐 맞추기', emoji: '🧩', scene: '손끝에 집중하는 시간', reason: '한 조각씩 맞추다 보면 잡생각이 사라져요.', tags: ['집콕'], budget: '저렴', minutes: 60, moods: ['피곤', '좋음'], modes: ['집콕'], color: 'lavender' },
    { id: 'game', title: '좋아하는 게임 한 판', emoji: '🎮', scene: '잠깐 다른 세계로', reason: '한 판만 하고 나면 기분이 리셋돼요.', tags: ['집콕'], budget: '저렴', minutes: 60, moods: ['좋음', '우울'], modes: ['집콕'], color: 'blue' },
    { id: 'baking', title: '쿠키 굽기', emoji: '🍪', scene: '집 안 가득 달콤한 냄새', reason: '오븐에서 퍼지는 냄새만으로도 기분이 좋아져요.', tags: ['요리', '집콕'], budget: '보통', minutes: 60, moods: ['좋음', '우울'], modes: ['집콕'], color: 'peach' },
    { id: 'plant', title: '화분 돌보기', emoji: '🪴', scene: '초록을 가까이', reason: '물 주고 잎을 닦다 보면 마음도 같이 차분해져요.', tags: ['집콕'], budget: '저렴', minutes: 15, moods: ['피곤', '우울'], modes: ['집콕'], color: 'green' },
    { id: 'yoga', title: '15분 요가', emoji: '🧘', scene: '호흡에 집중하기', reason: '천천히 숨 쉬며 몸을 늘이면 하루의 피로가 풀려요.', tags: ['운동', '집콕'], budget: '저렴', minutes: 15, moods: ['피곤', '좋음'], modes: ['집콕'], color: 'mint' },
    { id: 'nap', title: '20분 낮잠', emoji: '😴', scene: '잠깐 눈 붙이기', reason: '짧은 낮잠이 오후를 완전히 다르게 만들어줘요.', tags: ['집콕'], budget: '저렴', minutes: 20, moods: ['피곤'], modes: ['집콕'], color: 'cream' },
    { id: 'meal-prep', title: '내일 도시락 준비', emoji: '🍱', scene: '내일의 나를 위해', reason: '오늘 조금 움직이면 내일 아침이 훨씬 가벼워요.', tags: ['요리', '집콕'], budget: '저렴', minutes: 40, moods: ['좋음'], modes: ['집콕'], color: 'lime' },
    // 산책
    { id: 'walk', title: '동네 한 바퀴 산책', emoji: '🚶', scene: '바깥 공기 쐬기', reason: '10분만 걸어도 머릿속이 한결 가벼워질 거예요.', tags: ['산책'], budget: '저렴', minutes: 20, moods: ['피곤', '우울', '좋음'], modes: ['집콕', '가벼운 외출'], color: 'green' },
    { id: 'riverside', title: '천변 따라 걷기', emoji: '🌊', scene: '물소리 들으며 걷기', reason: '흐르는 물을 따라 걷다 보면 생각도 자연스레 흘러가요.', tags: ['산책'], budget: '저렴', minutes: 40, moods: ['좋음', '우울', '피곤'], modes: ['가벼운 외출'], color: 'sky' },
    { id: 'night-walk', title: '야경 보며 밤 산책', emoji: '🌃', scene: '하루 끝의 작은 여유', reason: '불빛 켜진 거리를 걸으면 하루가 차분히 마무리돼요.', tags: ['산책'], budget: '저렴', minutes: 30, moods: ['우울', '좋음'], modes: ['가벼운 외출'], color: 'dark' },
    { id: 'bike', title: '자전거 타고 한 바퀴', emoji: '🚲', scene: '바람 가르며 달리기', reason: '페달을 밟는 동안엔 고민이 따라오지 못해요.', tags: ['운동', '산책'], budget: '저렴', minutes: 40, moods: ['좋음'], modes: ['가벼운 외출'], color: 'green' },
    { id: 'hike', title: '가벼운 뒷산 오르기', emoji: '⛰️', scene: '숲길 따라 천천히', reason: '나무 사이를 걷다 보면 숨도 마음도 깊어져요.', tags: ['운동', '산책'], budget: '저렴', minutes: 90, moods: ['좋음'], modes: ['가벼운 외출'], color: 'green' },
    { id: 'run', title: '가벼운 저녁 러닝', emoji: '🏃', scene: '땀 흘리고 개운하게', reason: '20분만 뛰어도 답답함이 땀과 함께 빠져나가요.', tags: ['운동', '산책'], budget: '저렴', minutes: 30, moods: ['좋음', '우울'], modes: ['가벼운 외출'], color: 'orange' },
    // 운동
    { id: 'gym', title: '헬스장 한 시간', emoji: '🏋️', scene: '몸에 집중하는 시간', reason: '무게를 드는 동안엔 딴생각이 끼어들 틈이 없어요.', tags: ['운동'], budget: '보통', minutes: 60, moods: ['좋음', '피곤'], modes: ['가벼운 외출'], color: 'red' },
    { id: 'swim', title: '수영 한 바퀴', emoji: '🏊', scene: '물속에서 리셋', reason: '물에 들어가면 몸의 무게도 걱정도 가벼워져요.', tags: ['운동'], budget: '보통', minutes: 60, moods: ['좋음'], modes: ['가벼운 외출'], color: 'blue' },
    { id: 'climbing', title: '실내 클라이밍', emoji: '🧗', scene: '한 홀드씩 집중', reason: '다음 홀드만 생각하다 보면 어느새 머리가 맑아져요.', tags: ['운동', '문화생활'], budget: '보통', minutes: 90, moods: ['좋음'], modes: ['가벼운 외출', '문화생활'], color: 'orange' },
    { id: 'badminton', title: '배드민턴 한 게임', emoji: '🏸', scene: '가볍게 몸 풀기', reason: '셔틀콕을 주고받다 보면 웃음이 먼저 나와요.', tags: ['운동'], budget: '저렴', minutes: 60, moods: ['좋음'], modes: ['가벼운 외출'], color: 'lime' },
    { id: 'bowling', title: '볼링 한 게임', emoji: '🎳', scene: '가볍게 몸 쓰며 놀기', reason: '점수 상관없이 공 굴리다 보면 기분이 가벼워져요.', tags: ['운동', '문화생활'], budget: '보통', minutes: 60, moods: ['좋음'], modes: ['가벼운 외출', '문화생활'], color: 'lavender' },
    // 카페
    { id: 'book-cafe', title: '조용한 카페에서 책 읽기', emoji: '📖', scene: '나에게 집중하는 시간', reason: '커피 한 잔과 함께 천천히 나만의 시간을 보내요.', tags: ['문화생활', '산책', '카페'], budget: '보통', minutes: 60, moods: ['좋음', '피곤'], modes: ['가벼운 외출', '문화생활'], color: 'cream' },
    { id: 'market', title: '새로운 동네 빵집 가기', emoji: '🥐', scene: '가까운 곳에서 작은 발견', reason: '멀리 가지 않아도 소소한 즐거움을 만날 수 있어요.', tags: ['산책', '문화생활', '카페', '디저트'], budget: '보통', minutes: 30, moods: ['좋음', '우울'], modes: ['가벼운 외출', '문화생활'], color: 'yellow' },
    { id: 'dessert-cafe', title: '디저트 카페에서 당 충전', emoji: '🍰', scene: '달콤하게 쉬어 가기', reason: '달콤한 한 조각이면 가라앉은 기분이 조금 올라와요.', tags: ['카페', '문화생활'], budget: '보통', minutes: 45, moods: ['우울', '피곤'], modes: ['가벼운 외출', '문화생활'], color: 'pink' },
    // 문화생활
    { id: 'exhibition', title: '작은 전시 구경하기', emoji: '🖼️', scene: '느긋한 문화생활', reason: '새로운 장면을 보면 기분도 자연스레 환기돼요.', tags: ['문화생활'], budget: '여유', minutes: 120, moods: ['좋음', '우울'], modes: ['가벼운 외출', '문화생활'], color: 'peach' },
    { id: 'karaoke', title: '노래방에서 목청 풀기', emoji: '🎤', scene: '소리 지르며 스트레스 해소', reason: '좋아하는 노래 세 곡이면 답답함이 확 풀려요.', tags: ['문화생활'], budget: '보통', minutes: 60, moods: ['좋음', '우울'], modes: ['가벼운 외출', '문화생활'], color: 'pink' },
    { id: 'cinema', title: '영화관에서 큰 화면으로', emoji: '🎬', scene: '몰입하는 두 시간', reason: '큰 화면과 소리에 잠기면 머릿속 걱정이 잠시 멈춰요.', tags: ['문화생활'], budget: '보통', minutes: 150, moods: ['좋음', '우울', '피곤'], modes: ['문화생활'], color: 'blue' },
    { id: 'library', title: '도서관에서 책 빌리기', emoji: '📚', scene: '조용한 공간에서 숨 고르기', reason: '책장 사이를 거닐기만 해도 마음이 차분해져요.', tags: ['문화생활', '집콕'], budget: '저렴', minutes: 40, moods: ['피곤', '좋음'], modes: ['가벼운 외출', '문화생활'], color: 'cream' },
    { id: 'concert', title: '소극장 공연 보기', emoji: '🎭', scene: '눈앞에서 펼쳐지는 무대', reason: '가까이서 보는 무대의 에너지가 그대로 전해져요.', tags: ['문화생활'], budget: '여유', minutes: 120, moods: ['좋음', '우울'], modes: ['문화생활'], color: 'red' },
    { id: 'arcade', title: '오락실에서 놀기', emoji: '🕹️', scene: '동전 몇 개로 기분 전환', reason: '잠깐 어린 시절로 돌아가면 걱정이 작아져요.', tags: ['문화생활'], budget: '저렴', minutes: 40, moods: ['좋음', '우울'], modes: ['가벼운 외출', '문화생활'], color: 'yellow' },
    { id: 'board-game', title: '보드게임 카페', emoji: '♟️', scene: '머리 쓰며 웃기', reason: '게임 한 판이면 어색함도 지루함도 사라져요.', tags: ['문화생활', '카페'], budget: '보통', minutes: 120, moods: ['좋음'], modes: ['문화생활'], color: 'lavender' },
    { id: 'escape-room', title: '방탈출 카페', emoji: '🔐', scene: '한 시간의 몰입', reason: '문제에 빠져 있는 동안엔 다른 고민이 들어올 틈이 없어요.', tags: ['문화생활'], budget: '여유', minutes: 90, moods: ['좋음'], modes: ['문화생활'], color: 'dark' },
    { id: 'photo-booth', title: '네컷 사진 찍기', emoji: '📸', scene: '오늘을 남기기', reason: '사진 한 장이면 평범한 하루도 기억에 남아요.', tags: ['문화생활', '쇼핑'], budget: '저렴', minutes: 15, moods: ['좋음'], modes: ['가벼운 외출', '문화생활'], color: 'pink' },
    // 쇼핑
    { id: 'window-shopping', title: '쇼핑몰 가볍게 구경', emoji: '🛍️', scene: '사지 않아도 즐거운 구경', reason: '구경만 해도 기분 전환이 되고 걸음 수도 채워져요.', tags: ['쇼핑', '문화생활'], budget: '보통', minutes: 90, moods: ['좋음', '우울'], modes: ['가벼운 외출', '문화생활'], color: 'pink' },
    { id: 'stationery', title: '문구점 구경', emoji: '✏️', scene: '작은 것에서 오는 설렘', reason: '예쁜 펜 하나 고르는 일이 의외로 큰 기쁨이 돼요.', tags: ['쇼핑'], budget: '저렴', minutes: 30, moods: ['우울', '좋음'], modes: ['가벼운 외출'], color: 'yellow' },
    { id: 'flower', title: '꽃 한 송이 사 오기', emoji: '💐', scene: '나를 위한 작은 선물', reason: '책상 위 꽃 한 송이가 며칠을 환하게 해줘요.', tags: ['쇼핑', '산책'], budget: '저렴', minutes: 20, moods: ['우울', '좋음'], modes: ['가벼운 외출'], color: 'pink' },
    { id: 'market-tour', title: '전통시장 구경', emoji: '🧺', scene: '활기 속을 천천히', reason: '북적이는 시장을 걷다 보면 덩달아 기운이 나요.', tags: ['쇼핑', '산책'], budget: '저렴', minutes: 60, moods: ['좋음', '피곤'], modes: ['가벼운 외출'], color: 'orange' }
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
