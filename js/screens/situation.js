// ⑤ 상황 입력: 라운드마다 질문 하나와 큰 선택 카드 3개. 카드를 누르면 바로 다음 라운드로 (다음 버튼 없음)
// 셋 다 아니면 '이 질문은 넘어갈게요'(이 라운드만 건너뜀), 급하면 '건너뛰고 바로 추천받기'(남은 라운드 모두 건너뜀)
import { state, activeQuestions, categoryInfo } from '../state.js';
import { escapeHtml, choiceCard, progressBar } from '../components.js';

export function renderSituation() {
  const questions = activeQuestions();
  const question = questions[state.questionIndex];
  const category = categoryInfo();
  const isLast = state.questionIndex >= questions.length - 1;
  return {
    title: `${category.emoji} ${category.title}`,
    back: { action: 'situation-back', label: state.questionIndex === 0 ? '홈으로' : '이전 질문' },
    main: `${progressBar(state.questionIndex + 1, questions.length)}
      <h1 tabindex="-1">${escapeHtml(question.title)}</h1>
      <div class="choice-list">${question.options.map((option) => choiceCard({
        emoji: option.emoji, title: option.label, action: 'situation-choice', data: { key: question.key, value: option.value }
      })).join('')}</div>
      <div class="situation-links">
        <button type="button" class="link-button" data-action="situation-pass">${isLast ? '상관없어요, 추천받기' : '이 질문은 넘어갈게요'}</button>
        ${isLast ? '' : '<button type="button" class="link-button skip" data-action="situation-skip">건너뛰고 바로 추천받기</button>'}
      </div>`
  };
}
