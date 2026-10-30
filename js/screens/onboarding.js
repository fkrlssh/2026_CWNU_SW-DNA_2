// ① 온보딩: 5단계, 상단 진행 바, 단계마다 한 질문
import { CONFIG } from '../config.js';
import { ONBOARDING_STEPS } from '../data.js';
import { state } from '../state.js';
import { escapeHtml, chip, progressBar, bottomCta } from '../components.js';

// 다음 버튼을 눌러도 되는지 검사해요.
export function isStepValid(step, draft) {
  if (step.type === 'chips') return (draft[step.id] || []).length >= CONFIG.MIN_TASTE_PICKS;
  if (step.type === 'basics') return step.fields.every((field) => draft[field.key]);
  if (step.type === 'avoid') return (draft.avoid || []).length > 0;
  return true;
}

function chipsStep(step, draft) {
  const picked = draft[step.id] || [];
  return `<div class="chips">${step.choices.map((choice) => chip({
    label: choice.label, emoji: choice.emoji, selected: picked.includes(choice.label),
    action: 'toggle-taste', data: { group: step.id, value: choice.label }
  })).join('')}</div>
  <p class="pick-count">${picked.length}개 골랐어요</p>`;
}

function basicsStep(step, draft) {
  return step.fields.map((field) => `<section class="field">
    <h2 class="field-label">${escapeHtml(field.label)}</h2>
    <div class="segmented">${field.options.map((option) => `<button type="button" class="segment ${draft[field.key] === option ? 'selected' : ''}" data-action="set-basic" data-key="${field.key}" data-value="${escapeHtml(option)}" aria-pressed="${draft[field.key] === option}">${escapeHtml(option)}</button>`).join('')}</div>
  </section>`).join('');
}

// 알레르기 단계: 자주 쓰는 칩 + 직접 입력 + '없어요'. 빨간 계열로 구분해요.
function avoidStep(step, draft) {
  const custom = (draft.avoid || []).filter((word) => !step.choices.includes(word));
  return `<div class="chips">${[...step.choices, ...custom].map((word) => chip({
    label: word, selected: draft.avoid.includes(word), danger: true, action: 'toggle-avoid', data: { value: word }
  })).join('')}</div>
  <div class="avoid-input">
    <label for="avoid-input" class="sr-only">못 먹는 음식 직접 입력</label>
    <input id="avoid-input" type="text" maxlength="20" placeholder="직접 입력 (예: 오이)" autocomplete="off" />
    <button type="button" class="button outline" data-action="add-avoid">추가</button>
  </div>
  <button type="button" class="button ghost full" data-action="avoid-none">없어요</button>`;
}

const HINTS = {
  chips: () => (CONFIG.MIN_TASTE_PICKS === 1 ? '하나 이상 골라주세요' : `${CONFIG.MIN_TASTE_PICKS}개 이상 골라주세요`),
  basics: () => '세 가지 모두 하나씩 골라주세요',
  avoid: () => "없다면 '없어요'를 눌러주세요"
};

export function renderOnboarding() {
  const { step: stepIndex, draft, editing } = state.onboard;
  const step = ONBOARDING_STEPS[stepIndex];
  const valid = isStepValid(step, draft);
  const body = step.type === 'chips' ? chipsStep(step, draft) : step.type === 'basics' ? basicsStep(step, draft) : avoidStep(step, draft);
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;

  return {
    title: '취향 설정',
    back: editing
      ? { action: 'onboard-cancel', label: '내 취향으로 돌아가기' }
      : stepIndex > 0 ? { action: 'onboard-back', label: '이전 단계' } : null,
    main: `${editing ? '' : progressBar(stepIndex + 1, ONBOARDING_STEPS.length)}
      <p class="eyebrow">${editing ? '내 취향 수정' : '처음 만나는 하루'}</p>
      <h1 tabindex="-1">${escapeHtml(step.title)}</h1>
      <p class="lead">${escapeHtml(step.desc)}</p>
      <div class="step-body">${body}</div>`,
    cta: bottomCta({
      label: editing ? '저장하기' : isLast ? '완료' : '다음',
      action: 'onboard-next',
      disabled: !valid,
      hint: valid ? '' : HINTS[step.type]()
    })
  };
}
