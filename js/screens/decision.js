// ⑧ 결정·피드백: 고른 카드 크게 + 축하 애니메이션 + 만족도 3버튼
import { state, RATING } from '../state.js';
import { recCard, errorState, bottomCta, confetti } from '../components.js';

function feedbackArea() {
  const { status, feedback, rating } = state.decision;
  if (status === 'error') return errorState({ action: 'decision-retry', text: '기록을 저장하지 못했어요' });
  if (feedback === 'done') {
    return `<div class="thanks"><span aria-hidden="true">${RATING[rating].emoji}</span><p><strong>알려줘서 고마워요</strong><br />다음 추천에 반영할게요.</p></div>`;
  }
  // 기록 저장이 끝나기 전이나 피드백 전송 중에는 버튼을 잠가요.
  const disabled = status !== 'saved' || feedback === 'sending' ? 'disabled' : '';
  return `<section class="feedback" aria-labelledby="feedback-title">
    <h2 id="feedback-title">나중에 어땠는지 알려주세요</h2>
    <div class="feedback-buttons">${Object.entries(RATING).map(([key, value]) => `<button type="button" class="feedback-button" data-action="feedback" data-rating="${key}" ${disabled}><span aria-hidden="true">${value.emoji}</span>${value.label}</button>`).join('')}</div>
  </section>`;
}

export function renderDecision() {
  const { item, feedback } = state.decision;
  return {
    main: `<div class="celebrate">
        ${confetti()}
        <div class="check-badge" aria-hidden="true">✓</div>
        <h1 tabindex="-1">좋은 선택이에요!</h1>
        <p class="lead">이제 고민은 끝. 오늘을 즐겨요.</p>
      </div>
      <div class="decision-card">${recCard(item, 0, { placePreview: ['eat', 'do'].includes(state.category), category: state.category })}</div>
      ${feedbackArea()}`,
    cta: feedback === 'done'
      ? bottomCta({ label: '기록 보러 가기', action: 'tab', data: { target: 'history' }, extra: '<button type="button" class="button ghost full" data-action="tab" data-target="home">홈으로</button>' })
      : bottomCta({ label: '홈으로', action: 'tab', data: { target: 'home' } })
  };
}
