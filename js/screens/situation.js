// ⑤ 상황 입력: 한 화면에 질문 하나, 버튼을 누르면 바로 다음 질문으로 (다음 버튼 없음)
import { state, activeQuestions, categoryInfo } from '../state.js';
import { escapeHtml, choiceCard, progressBar } from '../components.js';

export function renderSituation() {
  const questions = activeQuestions();
  const question = questions[state.questionIndex];
  const category = categoryInfo();
  return {
    title: `${category.emoji} ${category.title}`,
    back: { action: 'situation-back', label: state.questionIndex === 0 ? '홈으로' : '이전 질문' },
    main: `${progressBar(state.questionIndex + 1, questions.length)}
      <h1 tabindex="-1">${escapeHtml(question.title)}</h1>
      <div class="choice-list">${question.options.map((option) => choiceCard({
        emoji: option.emoji, title: option.label, action: 'situation-choice', data: { key: question.key, value: option.value }
      })).join('')}</div>
      <button type="button" class="link-button skip" data-action="situation-skip">건너뛰고 바로 추천받기</button>`
  };
}
