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

스트리밍은 `Accept: text/event-stream` 헤더를 사용합니다. `data` 이벤트로 `{ "delta": "..." }`가 전송되고 마지막 `done` 이벤트에 전체 응답이 담깁니다.

## 운영 설정

- `CORS_ORIGINS`: 쉼표로 구분한 허용 프론트 주소
- `CHAT_RATE_LIMIT_PER_MINUTE`: 사용자별 챗봇 분당 요청 수
- `OPENAI_API_KEY`: 서버 런타임에만 설정하며 프론트에 전달하지 않음
- `GET /_app/health`: 인증 없이 배포 상태 확인
