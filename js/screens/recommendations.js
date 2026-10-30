// ⑥ 추천 카드 + ⑦ 리파인: 카드 3장 가로 스와이프, 점 인디케이터, 하단에 [이걸로 할래요] + 리파인 칩
import { state, categoryInfo } from '../state.js';
import { escapeHtml, chip, recCard, skeletonCards, errorState, emptyState, bottomCta } from '../components.js';

const REFINES = [
  { id: 'cheaper', label: '더 싸게', emoji: '💸' },
  { id: 'lighter', label: '더 가볍게', emoji: '🥗' },
  { id: 'different', label: '다른 종류', emoji: '🔄' },
  { id: 'new', label: '새로 추천', emoji: '✨' }
];

function cardsArea() {
  const { status, items, index } = state.rec;
  if (status === 'error') return errorState({ action: 'rec-retry' });
  if (status === 'empty') {
    return emptyState({ emoji: '🤔', text: '조건에 딱 맞는 추천을 못 찾았어요.<br />조건을 조금 바꿔볼까요?', actionLabel: '조건 다시 고르기', action: 'restart-situation' });
  }
  if (status !== 'ready') {
    // 리파인을 누르면 카드 자리에 스켈레톤이 나왔다가 새 카드로 바뀌어요.
    return `<div class="rec-loading" role="status" aria-label="추천을 고르는 중">${skeletonCards(1)}</div>`;
  }
  return `<div class="rec-track${state.rec.fresh ? ' fresh' : ''}" tabindex="0" aria-label="추천 카드 ${items.length}개, 옆으로 넘겨보세요">${items.map((item, i) => recCard(item, i)).join('')}</div>
    <div class="dots" role="tablist" aria-label="추천 카드 선택">${items.map((item, i) => `<button type="button" role="tab" class="dot ${i === index ? 'active' : ''}" data-action="rec-dot" data-index="${i}" aria-label="${i + 1}번째 추천: ${escapeHtml(item.title)}" aria-selected="${i === index}"></button>`).join('')}</div>`;
}

export function renderRecommendations() {
  const { status, refine } = state.rec;
  const category = categoryInfo();
  const ready = status === 'ready';
  const loading = status === 'loading' || status === 'idle';
  const refineRow = `<div class="refine-row" role="group" aria-label="추천 다듬기">${REFINES.map((option) => chip({
    label: option.label, emoji: option.emoji, selected: refine === option.id, action: 'refine', data: { refine: option.id }, disabled: loading
  })).join('')}</div>`;
  return {
    title: `${category.emoji} ${category.title}`,
    back: { action: 'rec-back', label: '조건 다시 고르기' },
    main: `<h1 tabindex="-1">오늘은 이거 어때요?</h1>
      <p class="lead">${!ready ? '취향과 상황에 맞춰 고르고 있어요.' : state.rec.items.length > 1 ? `옆으로 넘겨서 ${state.rec.items.length}개를 비교해 보세요.` : '조건에 딱 맞는 건 이거 하나예요.'}</p>
      ${cardsArea()}`,
    cta: bottomCta({ label: '이걸로 할래요', action: 'confirm-choice', disabled: !ready, extra: refineRow })
  };
}
