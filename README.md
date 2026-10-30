# 하루 — 오늘의 결정 도우미

먹기·입기·하기 결정을 가볍게 돕는 모바일 우선 웹앱입니다. 현재 저장소에는 기존 정적 프로토타입과 백엔드 B의 Express/SQLite API가 함께 있습니다.

## 실행

```bash
pnpm install
pnpm start
```

기본 주소는 `http://localhost:3000`이며, 서버가 정적 프론트엔드도 함께 제공합니다.

## 환경변수

`.env.example`을 복사해 `.env`를 만들면 `pnpm start`·`pnpm dev`가 자동으로 읽습니다(`.env`가 없어도 기본값으로 실행됩니다). 테스트와 Docker 이미지는 `.env`를 읽지 않으므로 배포 환경에서는 플랫폼 환경변수로 넣습니다.

- `PORT`: HTTP 포트, 기본값 `3000`
- `HARU_DB_PATH`: SQLite 파일 위치
- `HARU_LATITUDE`, `HARU_LONGITUDE`: 날씨 조회 좌표
- `HARU_TIMEZONE`: 시간대, 기본값 `Asia/Seoul`
- `CODEX_ENABLED`: 백엔드 A의 실제 Codex 규칙 생성을 사용할 때만 `true`
- `OPENAI_API_KEY`: 챗봇(`POST /api/chat`)용 키. 없으면 챗봇만 안내 문구로 응답하고 나머지 기능은 정상 동작
- `OPENAI_CHAT_MODEL`: 챗봇 모델, 기본값 `gpt-5.4-mini`
- `CHAT_RATE_LIMIT_PER_MINUTE`: 사용자별 분당 챗봇 요청 상한, 기본값 `20`

## 주요 API

- `GET /_app/health`
- `POST /api/users`
- `GET`, `PUT /api/profile`
- `POST /api/rules/generate`
- `GET /api/context`
- `POST /api/recommend`
- `POST /api/decisions`
- `POST /api/decisions/:id/feedback`
- `GET /api/history`
- `POST /api/chat` — `{ messages: [{ role, content }], context?, excludeIds? }` → `{ reply, recommendations, degraded, engine }`. `Accept: text/event-stream`이면 답변 조각을 스트리밍

`POST /api/users`를 제외한 API 요청에는 `X-User-Id` 헤더가 필요합니다. 추천·규칙 생성·피드백 학습은 `server/backend_A/ai` 모듈과 연결되어 있습니다. `CODEX_ENABLED=false`일 때는 토큰을 쓰지 않는 A의 폴백 규칙을 사용합니다.

## 테스트

```bash
pnpm test
```

## 역할 및 Git 규칙

사용자의 명시적인 허락 없이는 커밋하거나 푸시하지 않습니다. 자세한 규칙은 `AGENTS.md`를 따릅니다.
