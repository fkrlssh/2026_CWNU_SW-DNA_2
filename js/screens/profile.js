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

// 서버 태그와 화면 라벨이 다른 항목. 스키마를 아직 못 받았을 때 쓰는 대체표예요.
const TASTE_LABEL_FALLBACK = { 면요리: '면', 면소재: '면', 빵디저트: '빵·디저트', 떡분식: '떡·분식', 해물: '해산물', 실내시설: '실내 시설', 찜탕: '찜·탕', 생식: '회·샐러드' };

// 세부 취향 요약: 태그 이름 대신 서버 스키마의 라벨을 쓰고, 스키마가 아직 없으면 대체표를 써요.
function tasteSummaryChips(profile) {
  const like = profile.tastes?.like || [];
  const dislike = profile.tastes?.dislike || [];
  if (!like.length && !dislike.length) return '<span class="mini-chip">아직 안 골랐어요</span>';
  const labels = { ...TASTE_LABEL_FALLBACK };
  for (const groups of Object.values(state.tastes.schema?.groups || {})) {
    for (const group of groups) for (const option of group.options) labels[option.tag] = option.label;
  }
  const show = (tags, danger) => tags.slice(0, 6).map((tag) => `<span class="mini-chip${danger ? ' danger' : ''}">${danger ? '👎 ' : ''}${escapeHtml(labels[tag] || tag)}</span>`).join('');
  const more = like.length + dislike.length > 12 ? `<span class="mini-chip">+${like.length + dislike.length - 12}</span>` : '';
  return `${show(like, false)}${show(dislike, true)}${more}`;
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
      <button type="button" class="taste-section" data-action="open-tastes" aria-label="세부 취향 수정하기">
        <span class="taste-head"><strong>세부 취향 (형태·재질·색·활동 계열)</strong><span class="edit-link">${(profile.tastes?.like?.length || profile.tastes?.dislike?.length) ? '수정' : '고르기'}</span></span>
        <span class="taste-chips">${tasteSummaryChips(profile)}</span>
      </button>
      <section class="quiz-entry" aria-labelledby="quiz-entry-title">
        <span aria-hidden="true">✦</span>
        <div><p class="summary-kicker">5라운드 취향 퀴즈</p><h2 id="quiz-entry-title">고르는 것만으로<br />오늘의 취향을 더 알아봐요.</h2><p>음식·옷·활동 중 하나를 골라 3가지 선택을 비교해 보세요.</p></div>
        <button type="button" class="button outline" data-action="start-quiz">퀴즈 시작하기</button>
      </section>
      <button type="button" class="button outline full" data-action="reanalyze">🔄 취향 다시 분석하기</button>
      <button type="button" class="link-button reset" data-action="reset-all">처음부터 다시 시작하기</button>`
  };
}
