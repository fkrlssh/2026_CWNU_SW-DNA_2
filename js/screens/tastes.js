// ⑫ 세부 취향: 형태·재질·색·아우터·활동 계열 같은 종류형 취향을 좋아요/싫어요 칩으로 골라요.
// 칩을 한 번 누르면 좋아요, 두 번 누르면 싫어요, 세 번 누르면 해제. 저장하면 다음 추천부터 바로 반영돼요.
import { CATEGORIES } from '../data.js';
import { state } from '../state.js';
import { escapeHtml, loadingState, errorState } from '../components.js';

function tasteChip(option, draft) {
  const liked = draft.like.includes(option.tag);
  const disliked = draft.dislike.includes(option.tag);
  const classes = ['chip', liked ? 'selected' : '', disliked ? 'dislike' : ''].filter(Boolean).join(' ');
  const mark = liked ? '<span aria-hidden="true">👍</span>' : disliked ? '<span aria-hidden="true">👎</span>' : '';
  const stateLabel = liked ? '좋아요' : disliked ? '싫어요' : '선택 안 함';
  return `<button type="button" class="${classes}" data-action="tastes-toggle" data-tag="${escapeHtml(option.tag)}" aria-pressed="${liked || disliked}" aria-label="${escapeHtml(option.label)}, ${stateLabel}">${mark}${escapeHtml(option.label)}</button>`;
}

export function renderTastes() {
  const { status, schema, category, draft } = state.tastes;
  const back = { action: 'tastes-back', label: '내 취향으로' };
  const title = '세부 취향';
  if (status === 'loading' || status === 'idle') return { title, back, main: loadingState('취향 항목을 불러오고 있어요…') };
  if (status === 'error' || !schema) return { title, back, main: errorState({ action: 'tastes-retry' }) };

  const groups = schema.groups?.[category] || [];
  const tabs = CATEGORIES.map((item) => `<button type="button" class="seg-tab${item.id === category ? ' active' : ''}" data-action="tastes-category" data-category="${item.id}" aria-pressed="${item.id === category}">${item.emoji} ${escapeHtml(item.title)}</button>`).join('');
  const sections = groups.map((group) => `<section class="taste-group" aria-labelledby="taste-group-${group.key}">
      <h2 id="taste-group-${group.key}">${escapeHtml(group.label)}</h2>
      <div class="chips">${group.options.map((option) => tasteChip(option, draft)).join('')}</div>
    </section>`).join('');

  return {
    title,
    back,
    main: `<h1 tabindex="-1">조금 더 자세히<br />알려주세요</h1>
      <p class="lead">한 번 누르면 좋아요 👍, 두 번 누르면 싫어요 👎. 건너뛰어도 괜찮아요.</p>
      <div class="seg" role="group" aria-label="카테고리">${tabs}</div>
      ${sections}`,
    cta: `<div class="bottom-cta tastes-cta">
      <p class="pick-count">좋아요 ${draft.like.length} · 싫어요 ${draft.dislike.length}</p>
      <button type="button" class="button primary full" data-action="tastes-save">저장하고 반영하기</button>
    </div>`
  };
}
