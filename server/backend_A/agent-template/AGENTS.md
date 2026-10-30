# AGENTS.md — 하루 취향 프로필 생성 규칙

이 파일은 Codex 에이전트의 작업 디렉터리(`server/agent-template/`)에 놓입니다. 에이전트는 작업을 시작할 때 이 파일을 자동으로 읽습니다. 짧게 유지하세요. 여기 적힌 내용은 호출마다 토큰으로 들어갑니다.

---

## 역할

온보딩 답변으로 한 사용자의 **추천 규칙 JSON**을 만든다. 코드 작성, 저장소 탐색, 패키지 설치, 네트워크 사용은 하지 않는다. 필요한 입력(답변, 허용 태그, 상황 키)은 프롬프트에 모두 들어 있으므로 파일을 읽을 필요가 없다.

## 산출물

1. `output/rules.json` 에 저장
2. 최종 응답은 같은 JSON **만** 출력. 설명, 마크다운, 코드펜스 금지

## JSON 형식

```json
{
  "version": 1,
  "persona": "사용자 취향 한 줄 요약 (40자 이내)",
  "weights": {
    "always":      { "tag.comfort": 0.5 },
    "mood.tired":  { "tag.light": 2, "tag.delivery": 1.5, "tag.outdoor": -2 },
    "weather.rain":{ "tag.indoor": 2, "tag.outdoor": -3 },
    "budget.low":  { "price.1": 2.5, "price.3": -3 },
    "with.friend": { "tag.group": 2, "tag.solo": -1 }
  },
  "hard": {
    "exclude_tags": ["seafood"],
    "exclude_types": [],
    "max_price_level": 2,
    "radius_km": 2
  },
  "novelty": 0.3,
  "reasons": {
    "tag.light": "피곤한 날엔 가볍게",
    "tag.delivery": "나가지 않아도 돼요"
  }
}
```

## 형식 규칙

- **weights 키**: `"always"` 또는 `"<상황키>.<값>"`. 상황키와 값은 프롬프트의 `contextKeys` 안에서만 쓴다. (`mood.tired`, `time.30`, `budget.low`, `with.alone`, `weather.rain` …)
- **feature 키**: `tag.<태그>` · `price.<1|2|3>` · `type.<food|do|wear>`. 태그는 프롬프트의 `tags` 목록 안에서만 쓴다. 목록에 없는 태그를 만들지 않는다.
- **delta**: -5 ~ 5, 소수 가능. 0은 쓰지 않는다.
- weights 항목은 전체 **20~45개**. 상황키 하나마다 feature **3개 이상**. 답변에 근거가 없는 상황키는 비워도 된다.
- **hard.exclude_tags**: 알레르기와 "절대 싫다"고 답한 것. **알레르기는 반드시 포함**한다.
- **hard.max_price_level**: 예산 답변 low=1, mid=2, high=3. 답변이 애매하면 2.
- **hard.radius_km**: 활동 반경 답변 그대로. 없으면 3.
- **novelty**: 새로운 시도를 좋아하면 0.5~0.8, 익숙한 게 편하다고 하면 0.1~0.3.
- **reasons**: 가중치가 큰 feature **8~15개**에 25자 이내 한국어 문구. 카드에 "이유 한 줄"로 그대로 노출되므로 반말·이모지 금지, 친근한 존댓말.
- **persona**: 40자 이내. 예) "매운 음식 즐기고 집에서 쉬는 걸 선호하는 자취생"

## 끝내기 전 자가 검증

- [ ] 모든 weights 키가 `always` 또는 `contextKeys` 조합인가
- [ ] 모든 feature 키의 태그가 `tags` 목록 안에 있는가
- [ ] delta 가 전부 -5 ~ 5 범위이고 0이 없는가
- [ ] 알레르기 답변이 `hard.exclude_tags` 에 전부 들어 있는가
- [ ] `output/rules.json` 이 유효한 JSON 이고 최종 응답과 동일한가

## 금지

- `output/rules.json` 쓰기 외의 셸 명령 실행 (`ls`, `cat`, `find`, 테스트 실행 등 불필요)
- 다른 파일 생성·수정, 네트워크 접근
- 답변에 없는 알레르기·질병·상황을 추측해서 넣는 것
- 특정 상호명·브랜드를 feature 로 쓰는 것
