import { CATEGORIES } from '../data.js';
import { state, categoryInfo } from '../state.js';
import { choiceCard, errorState, escapeHtml, loadingState, progressBar, recCard } from '../components.js';

function focusLabel(round) {
  return state.quiz.dimensions.find((dimension) => dimension.key === round.focus)?.label || round.focus;
}

function quizCategorySelect() {
  return {
    title: '취향 퀴즈',
    back: { action: 'quiz-close', label: '내 취향으로' },
    main: `<p class="eyebrow">5 rounds · 3 choices</p>
      <h1 tabindex="-1">어느 취향부터<br />알아볼까요?</h1>
      <p class="lead">가볍게 5번만 골라 주세요. 선택은 바로 다음 추천에 반영돼요.</p>
      <div class="quiz-category-list">${CATEGORIES.map((category) => choiceCard({
        emoji: category.emoji, title: category.title, desc: `${category.subtitle} · 퀴즈 시작`, action: 'quiz-category', data: { category: category.id }, size: 'big', tone: category.color
      })).join('')}</div>`
  };
}

export function renderPreferenceQuiz() {
  const quiz = state.quiz;
  if (quiz.status === 'choose' || quiz.status === 'idle') return quizCategorySelect();
  if (quiz.status === 'loading' || quiz.status === 'submitting') return { title: '취향 퀴즈', back: { action: 'quiz-close', label: '내 취향으로' }, main: loadingState(quiz.status === 'submitting' ? '선택을 바탕으로 취향을 정리하고 있어요…' : '나에게 맞는 세 가지를 고르는 중이에요…') };
  if (quiz.status === 'error') return { title: '취향 퀴즈', back: { action: 'quiz-close', label: '내 취향으로' }, main: errorState({ action: 'quiz-retry', text: '퀴즈를 불러오지 못했어요' }) };

  const round = quiz.rounds[quiz.index];
  if (!round) return quizCategorySelect();
  const pick = quiz.answers[quiz.index]?.pick;
  const total = quiz.rounds.length;
  const category = categoryInfo(quiz.category);
  return {
    title: `${category.emoji} 취향 퀴즈`,
    back: { action: 'quiz-back', label: quiz.index ? '이전 질문으로' : '카테고리 고르기' },
    main: `<section class="quiz-card" aria-labelledby="quiz-question">
      <div class="quiz-topline"><span>취향 퀴즈</span><span>${round.round} / ${total}</span></div>
      ${progressBar(round.round, total)}
      <p class="quiz-focus">${escapeHtml(focusLabel(round))}</p>
      <h1 id="quiz-question" tabindex="-1">${escapeHtml(round.question.replace(/^.*?:\s*/, ''))}</h1>
      <p class="lead">고민 말고 더 끌리는 쪽을 눌러 주세요.</p>
      <div class="quiz-options" role="radiogroup" aria-label="${focusLabel(round)} 선택지">
        ${round.options.map((option) => `<button type="button" class="quiz-option${pick === option.itemId ? ' selected' : ''}" data-action="quiz-pick" data-item-id="${escapeHtml(option.itemId)}" role="radio" aria-checked="${pick === option.itemId}">
          <span class="quiz-option-emoji" aria-hidden="true">${escapeHtml(option.emoji)}</span><span><strong>${escapeHtml(option.title)}</strong><small>${escapeHtml(option.scene)}</small></span><b aria-hidden="true">${pick === option.itemId ? '✓' : ''}</b>
        </button>`).join('')}
      </div>
      <button type="button" class="link-button quiz-skip" data-action="quiz-skip">셋 다 별로예요</button>
    </section>`,
    cta: `<div class="bottom-cta quiz-next"><button type="button" class="button primary full big" data-action="quiz-next" ${pick === undefined ? 'disabled' : ''}>${quiz.index === total - 1 ? '결과 보기' : '다음'} <span aria-hidden="true">→</span></button></div>`
  };
}

function evidenceSummary(evidence = {}) {
  const rows = Object.values(evidence).filter((row) => row?.side && row.side !== '상관없음');
  if (!rows.length) return '<p class="quiz-empty-evidence">이번 선택에서는 뚜렷한 축이 없어요. 다음에 다시 해도 좋아요.</p>';
  return `<ul class="quiz-evidence">${rows.map((row) => `<li><strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(row.side)} 좋아요</span></li>`).join('')}</ul>`;
}

export function renderPreferenceQuizResult() {
  const result = state.quiz.result;
  const category = categoryInfo(state.quiz.category);
  if (!result) return quizCategorySelect();
  return {
    title: `${category.emoji} 취향 결과`,
    back: { action: 'quiz-back-to-profile', label: '내 취향으로' },
    main: `<section class="quiz-result" aria-labelledby="quiz-result-title">
      <p class="eyebrow">취향 퀴즈 완료</p>
      <h1 id="quiz-result-title" tabindex="-1">오늘의 취향을<br />이렇게 찾았어요.</h1>
      <p class="lead">선택한 기준은 저장되어 다음 추천에도 반영돼요.</p>
      <section class="quiz-evidence-card" aria-label="이번 퀴즈에서 찾은 취향">${evidenceSummary(result.evidence)}</section>
      <div class="quiz-result-heading"><p class="eyebrow">바로 추천하는 ${category.title}</p><h2>지금은 이런 선택이 어울려요.</h2></div>
      <div class="quiz-result-cards">${result.items.map((item, index) => recCard(item, index)).join('')}</div>
    </section>`,
    cta: `<div class="bottom-cta quiz-result-cta"><button type="button" class="button outline full" data-action="quiz-restart">다른 취향도 알아보기</button><button type="button" class="button primary full big" data-action="quiz-open-recommendations">추천 자세히 보기 <span aria-hidden="true">→</span></button></div>`
  };
}
