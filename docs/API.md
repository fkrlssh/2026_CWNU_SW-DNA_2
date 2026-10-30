# 하루 API 계약

기본 주소는 서버와 같은 origin이며, JSON 요청은 `Content-Type: application/json`을 사용합니다.

## 사용자 식별

1. 최초 실행 시 `POST /api/users`를 호출합니다.
2. 응답의 `userId`만 브라우저 `localStorage`에 보관합니다.
3. 이후 모든 `/api/*` 요청에 `X-User-Id: <userId>` 헤더를 보냅니다.

```json
{ "userId": "uuid" }
```

## 공통 오류

```json
{ "error": { "code": "INVALID_PROFILE", "message": "오류 설명" } }
```

주요 코드는 `USER_ID_REQUIRED`, `USER_NOT_FOUND`, `INVALID_JSON`, `PAYLOAD_TOO_LARGE`, `INVALID_PROFILE`, `INVALID_CONTEXT`, `INVALID_MESSAGES`, `NOT_FOUND`입니다.

## 프로필

`PUT /api/profile`

```json
{
  "answers": {
    "food": ["한식"],
    "style": ["캐주얼"],
    "activity": ["산책"],
    "budgetRange": "보통",
    "activeTime": "저녁형",
    "allergies": [],
    "dislikes": []
  }
}
```

조회는 `GET /api/profile`, 규칙 생성은 `POST /api/rules/generate`를 사용합니다.

## 상황과 추천

`GET /api/context`는 `weather`, `temperature`, `timeSlot`, `source`를 반환합니다.

`POST /api/recommend`

```json
{
  "category": "eat",
  "context": {
    "mood": "피곤",
    "budget": "저렴",
    "time": "10분",
    "mode": "집밥",
    "weather": "clear"
  },
  "refine": null,
  "excludeIds": []
}
```

`category`는 `eat`, `wear`, `do`이며 `refine`은 `cheaper`, `lighter`, `different`, `new` 중 하나입니다.

## 결정과 피드백

`POST /api/decisions`

```json
{ "category": "eat", "itemId": "gimbap", "context": {} }
```

응답의 `decisionId`로 `POST /api/decisions/:id/feedback`을 호출합니다.

```json
{ "rating": "good" }
```

평가는 `good`, `soso`, `bad`이며 기록 조회는 `GET /api/history`입니다.

## 챗봇

`POST /api/chat`

```json
{
  "messages": [{ "role": "user", "content": "오늘 저녁 추천해줘" }],
  "context": {},
  "excludeIds": []
}
```

메시지는 최대 20개, 각 내용은 최대 2000자입니다. `OPENAI_API_KEY`가 없거나 외부 호출이 실패하면 HTTP 요청은 성공하면서 `degraded: true`인 안내 응답을 반환합니다.

스트리밍은 `Accept: text/event-stream` 헤더를 사용합니다. `data` 이벤트로 `{ "delta": "..." }`가 전송되고 마지막 `done` 이벤트에 전체 응답이 담깁니다. 모델을 기다리는 동안 `status` 이벤트(`{ "stage": "thinking" | "recommending" | "answering" }`)와 `: keepalive` 주석 줄이 올 수 있으니 모르는 이벤트는 무시하면 됩니다.

응답의 `recommendations`는 1~5개입니다(사용자가 "5가지"처럼 개수를 말하면 최대 5개). `partial: true`는 추천은 골랐지만 답변 문장 생성에 실패해 기본 문구로 대신한 경우이며, 카드는 정상적으로 표시하면 됩니다.

## 장소 검색 (지도)

추천 항목은 "순두부찌개"처럼 종류라서, 항목별 검색어로 근처 실제 장소를 찾아 지도에 띄웁니다. 음식(`eat`)과 밖에서 하는 활동(`do`)만 해당하며, 옷(`wear`)과 집에서 하는 활동은 `source: "none"`으로 응답합니다.

`POST /api/places`

```json
{
  "category": "eat",
  "itemId": "soup-rice",
  "radiusKm": 2,
  "location": { "lat": 35.2222, "lng": 128.6834 }
}
```

- `radiusKm`(선택): 0 초과 20 이하. 없으면 온보딩 반경 → `PLACES_RADIUS_KM` 순으로 씁니다. 반경 조절 UI(드래그바)는 이 값만 바꿔 다시 호출하면 됩니다.
- `location`(선택): `PLACES_LOCATION_MODE=user`일 때만 쓰입니다. 기본 `fixed` 모드에서는 무시하고 고정 좌표(상남시장)에서 검색합니다.

```json
{
  "keyword": "순두부찌개",
  "center": { "lat": 35.2222, "lng": 128.6834, "label": "상남시장", "source": "fixed" },
  "radiusKm": 2,
  "places": [
    { "id": "123", "name": "가게 이름", "category": "한식", "address": "도로명 주소", "phone": "055-000-0000",
      "lat": 35.22, "lng": 128.68, "distanceM": 350, "mapUrl": "https://place.map.kakao.com/123" }
  ],
  "source": "live"
}
```

`source`는 `live`(검색), `cache`(10분 내 재사용), `none`(지도 없는 항목), `unavailable`(`KAKAO_REST_KEY` 없음), `error`(검색 실패) 중 하나이며, 어느 경우든 `places`는 배열입니다. 지도는 `center`를 중심으로 `places`를 마커로 그리고, `places`가 비어 있으면 지도를 숨기면 됩니다. 거리순으로 최대 3곳을 돌려줍니다.

## 취향 규칙 생성 제공자

`POST /api/rules/generate`의 응답 `status`는 규칙을 만든 제공자입니다: `api`(OpenAI 직접 호출, Structured Outputs), `codex`(Codex CLI), `fallback`(AI 없이 온보딩 칩만으로 만든 기본 규칙). `RULES_PROVIDER`로 고르며 비우면 `OPENAI_API_KEY`가 있을 때 `api`입니다. AI 호출은 사용자당 1회(답변이 같으면 재사용)이고 10~20초, 약 2~5천 토큰이 듭니다. 실패하면 1회 재시도 후 `fallback`으로 응답하며, 이후 다시 `POST /api/rules/generate`를 부르면 AI로 재시도합니다. AI 생성은 이 엔드포인트에서만 일어납니다. `/api/recommend`, `/api/chat`, `/api/places`는 저장된 규칙이 없으면 기다리지 않고 폴백 규칙을 쓰므로, 온보딩 저장 뒤에는 반드시 `POST /api/rules/generate`를 호출해 주세요.

## 운영 설정

- `RULES_PROVIDER`: `api` | `codex` | `fallback`. `OPENAI_RULES_MODEL`로 규칙 생성 모델을 따로 지정할 수 있습니다
- `KAKAO_REST_KEY`: 장소 검색용 Kakao REST API 키. 서버에만 두며 프론트의 지도 SDK는 별도의 JavaScript 키를 씁니다
- `PLACES_LOCATION_MODE`: `fixed`(기본, 고정 좌표) 또는 `user`(요청 좌표)
- `PLACES_CENTER_LAT`, `PLACES_CENTER_LNG`, `PLACES_CENTER_LABEL`: 고정 좌표, 기본값 상남시장
- `PLACES_RADIUS_KM`: 기본 반경(km), 기본값 2
- `CORS_ORIGINS`: 쉼표로 구분한 허용 프론트 주소
- `CHAT_RATE_LIMIT_PER_MINUTE`: 사용자별 챗봇 분당 요청 수
- `OPENAI_API_KEY`: 서버 런타임에만 설정하며 프론트에 전달하지 않음
- `GET /_app/health`: 인증 없이 배포 상태 확인
