// ⑤ 상황 입력: 한 화면에 질문 하나, 버튼을 누르면 바로 다음 질문으로 (다음 버튼 없음)
// 선택지마다 이모지·이름·한 줄 설명을 보여주고, 이미 고른 답은 위에 작은 칩으로 보여줘요.
import { state, activeQuestions, categoryInfo } from '../state.js';
import { escapeHtml, progressBar } from '../components.js';

// 지금까지 고른 답을 '😊 기분 · 좋아요' 같은 칩으로 보여줘요.
function answeredChips(questions) {
  const chips = questions.slice(0, state.questionIndex).map((question) => {
    const picked = question.options.find((option) => option.value === state.answers[question.key]);
    if (!picked) return '';
    return `<span class="answer-chip"><span aria-hidden="true">${picked.emoji}</span>${escapeHtml(question.label)} · ${escapeHtml(picked.label)}</span>`;
  }).join('');
  return chips ? `<div class="answer-chips" aria-label="지금까지 고른 답">${chips}</div>` : '';
}

function optionButton(question, option) {
  return `<button type="button" class="situation-option" data-action="situation-choice" data-key="${question.key}" data-value="${escapeHtml(option.value)}" aria-label="${escapeHtml(option.label)}, ${escapeHtml(option.desc || '')}">
    <span class="so-emoji tone-${escapeHtml(option.tone || 'cream')}" aria-hidden="true">${option.emoji}</span>
    <span class="so-copy"><strong>${escapeHtml(option.label)}</strong>${option.desc ? `<small>${escapeHtml(option.desc)}</small>` : ''}</span>
    <span class="so-arrow" aria-hidden="true">›</span>
  </button>`;
}

export function renderSituation() {
  const questions = activeQuestions();
  const question = questions[state.questionIndex];
  const category = categoryInfo();
  return {
    title: `${category.emoji} ${category.title}`,
    back: { action: 'situation-back', label: state.questionIndex === 0 ? '홈으로' : '이전 질문' },
    main: `<div class="situation">
      ${progressBar(state.questionIndex + 1, questions.length)}
      ${answeredChips(questions)}
      <p class="situation-step">질문 ${state.questionIndex + 1} · ${escapeHtml(question.label || '')}</p>
      <h1 tabindex="-1">${escapeHtml(question.title)}</h1>
      ${question.hint ? `<p class="lead situation-hint">${escapeHtml(question.hint)}</p>` : ''}
      <div class="situation-options count-${question.options.length}">${question.options.map((option) => optionButton(question, option)).join('')}</div>
      <button type="button" class="link-button skip" data-action="situation-skip">건너뛰고 바로 추천받기</button>
    </div>`
  };
}
