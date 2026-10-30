// ② 취향 분석 중: 통통 튀는 노란 원 + 몇 초마다 바뀌는 문구 (문구 교체는 app.js에서)
import { state, ANALYSIS_MESSAGES } from '../state.js';
import { bottomCta } from '../components.js';

export function renderAnalyzing() {
  // 60초가 넘거나 실패하면 기본 추천으로 넘어가요.
  if (state.analysis.status === 'failed') {
    return {
      main: `<div class="analysis">
        <div class="analysis-orb resting" aria-hidden="true">🙂</div>
        <h1 tabindex="-1">기본 추천으로 먼저 시작할게요</h1>
        <p class="lead">취향 분석은 나중에 '내 취향'에서 다시 할 수 있어요.</p>
      </div>`,
      cta: bottomCta({ label: '시작하기', action: 'analysis-skip' })
    };
  }
  return {
    main: `<div class="analysis" role="status">
      <div class="analysis-orb" aria-hidden="true"></div>
      <h1 tabindex="-1" id="analysis-msg">${ANALYSIS_MESSAGES[state.analysis.messageIndex]}</h1>
      <p class="lead">고른 취향으로 나만의 추천 규칙을 만들고 있어요.</p>
    </div>`
  };
}
