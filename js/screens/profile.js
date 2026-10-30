// ⑩ 내 취향: 고른 취향 칩 묶음(누르면 수정) + 취향 다시 분석하기
import { ONBOARDING_STEPS } from '../data.js';
import { state } from '../state.js';
import { escapeHtml, emptyState } from '../components.js';

function tasteSection(step, index, profile) {
  let values = [];
  if (step.type === 'chips') values = profile[step.id] || [];
  if (step.type === 'basics') values = step.fields.map((field) => profile[field.key]).filter(Boolean);
  if (step.type === 'avoid') values = profile.avoid?.length ? profile.avoid : ['없어요'];
  const danger = step.type === 'avoid' && profile.avoid?.length;
  return `<button type="button" class="taste-section" data-action="edit-step" data-step="${index}" aria-label="${escapeHtml(step.title)} 수정하기">
    <span class="taste-head"><strong>${escapeHtml(step.title)}</strong><span class="edit-link">수정</span></span>
    <span class="taste-chips">${values.map((value) => `<span class="mini-chip${danger ? ' danger' : ''}">${escapeHtml(value)}</span>`).join('')}</span>
  </button>`;
}

export function renderProfile() {
  const profile = state.profile;
  if (!profile) {
    return { main: `<h1 tabindex="-1">내 취향</h1>${emptyState({ emoji: '💛', text: '아직 고른 취향이 없어요.<br />취향부터 알려주실래요?', actionLabel: '취향 고르기', action: 'start-onboarding' })}` };
  }
  return {
    main: `<h1 tabindex="-1">내 취향</h1>
      <section class="persona-card">
        <p class="summary-kicker">하루가 본 나는</p>
        <p class="persona-text">${state.persona ? escapeHtml(state.persona) : '아직 분석 전이에요'}</p>
      </section>
      <p class="lead">묶음을 누르면 바로 고칠 수 있어요.</p>
      <div class="taste-list">${ONBOARDING_STEPS.map((step, index) => tasteSection(step, index, profile)).join('')}</div>
      <button type="button" class="button outline full" data-action="reanalyze">🔄 취향 다시 분석하기</button>
      <button type="button" class="link-button reset" data-action="reset-all">처음부터 다시 시작하기</button>`
  };
}
