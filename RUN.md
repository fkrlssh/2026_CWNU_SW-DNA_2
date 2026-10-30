# 하루 실행 방법

서버(API)와 프론트(화면)를 각각 띄웁니다. 서버가 아직 `js/` 폴더를 서빙하지 않아서 프론트는 따로 띄워야 합니다. (BACKEND_ISSUES.md 1번)

## 준비물

- **Node.js 22.9 이상:** 서버가 내장 SQLite(`node:sqlite`)와 `--env-file-if-exists`를 씁니다. `node --version`으로 확인하세요.
- **pnpm:** 따로 설치하지 않아도 `npx pnpm@10.18.1 ...`로 쓸 수 있습니다.
- **Python 3:** 프론트를 띄울 때만 필요합니다. VS Code의 Live Server 확장을 써도 됩니다.

## 1. 처음 한 번

```bash
npx pnpm@10.18.1 install
cp .env.example .env
```

`.env`에서 `CORS_ORIGINS`에 프론트 주소를 추가하세요.

```
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5500,http://127.0.0.1:5500
```

## 2. 서버 실행 (터미널 1)

```bash
npx pnpm@10.18.1 start
```

루트의 `.env`를 자동으로 읽습니다. `.env`를 고친 뒤에는 서버를 껐다 켜야 적용됩니다.

정상이면 `http://localhost:3000/_app/health`가 `{"status":"ok"}`를 돌려줍니다.

## 3. 프론트 실행 (터미널 2)

```bash
python -m http.server 5500
```

브라우저에서 `http://localhost:5500`을 엽니다. `index.html`을 더블클릭해서 여는(file://) 방식은 모듈 스크립트 때문에 동작하지 않습니다.

## 환경변수 이름

| 이름 | 설명 | 기본값 |
|---|---|---|
| `PORT` | 서버 포트 | 3000 |
| `HARU_DB_PATH` | SQLite 파일 위치 | `./data/haru.sqlite` |
| `HARU_LATITUDE`, `HARU_LONGITUDE` | 날씨 조회 좌표 | 창원 |
| `HARU_TIMEZONE` | 시간대 | `Asia/Seoul` |
| `CORS_ORIGINS` | 허용할 프론트 주소 (쉼표로 구분) | 3000만 |
| `CODEX_ENABLED` | AI 규칙 생성 사용 여부 | `false` (폴백 규칙) |
| `CODEX_TIMEOUT_MS`, `CODEX_CONCURRENCY` | Codex 실행 제한 | 90000, 2 |
| `OPENAI_API_KEY` | 챗봇용 키. **절대 커밋 금지** (`.env`는 `.gitignore`에 들어 있음) | 없음 |
| `OPENAI_CHAT_MODEL` | 챗봇 모델 | `gpt-5.4-mini` |
| `CHAT_RATE_LIMIT_PER_MINUTE` | 사용자별 챗봇 분당 요청 수 | 20 |

## 목업 ↔ 서버 연동 전환

- **기본은 서버 연동입니다.** `js/config.js`의 `USE_MOCK: false`
- **서버 없이 화면만 보기:** 주소 뒤에 `?mock=normal`을 붙이세요. (예: `http://localhost:5500/?mock=normal`)
  - 아예 바꾸려면 `USE_MOCK: true`로 바꿉니다.
- **목업 상황 연습:**
  - `?mock=error` 에러 화면
  - `?mock=empty` 빈 화면
  - `?mock=slow` 느린 응답
  - `?mock=timeout` 분석 시간 초과
- **서버 주소 바꾸기:** `js/config.js`의 `API_BASE`를 쓰거나 주소 뒤에 `?api=http://서버주소:3000`을 붙이세요.
  - 비워두면 페이지가 3000번에서 열렸을 때는 같은 주소, 그 외에는 `localhost:3000`을 씁니다.
- **시간대 고정 (시연용):** `?slot=lunch` (morning·lunch·afternoon·evening·night)

## 자주 나는 오류

| 증상 | 원인 | 해결 |
|---|---|---|
| 화면이 하얗고 콘솔에 `js/config.js 404` | `localhost:3000`에서 열었음 | 프론트를 5500으로 따로 띄우기 |
| 모든 요청이 `CORS` 오류 | `CORS_ORIGINS`에 프론트 주소가 없음 | `.env`에 주소 추가 후 서버 재시작 |
| `Error: No such built-in module: node:sqlite` 또는 `bad option: --env-file-if-exists` | Node 버전이 낮음 | Node 22.9 이상 설치 |
| `EADDRINUSE: 3000` | 이미 서버가 떠 있음 | 기존 서버 종료 (Windows: 작업 관리자에서 node 종료) |
| 홈의 날씨가 "날씨 정보 없음 · 예시" | 날씨 API 연결 실패 (서버가 폴백함) | 인터넷 연결 확인. 기능은 그대로 동작 |
| 챗봇이 "지금은 답변을 드리기 어려워요" | `OPENAI_API_KEY`가 없거나 잘못됨 | `.env`에 키 입력 후 서버 재시작 |
| 온보딩이 계속 처음부터 나옴 | 서버 DB(`data/haru.sqlite`)를 지웠음 | 정상. 새 사용자로 다시 시작됨 |

## 테스트

```bash
node --test
```
