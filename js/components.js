// 여러 화면에서 같이 쓰는 UI 조각들이에요. 모두 HTML 문자열을 돌려줍니다.
// 버튼의 data-action 값은 app.js의 클릭 처리부에서 받아서 동작해요.

// 사용자 입력이나 데이터 글자를 HTML에 넣을 때는 꼭 이걸 거쳐요. (태그가 실행되지 않게)
export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

// { group: 'food', value: '한식' } → data-group="food" data-value="한식"
function dataAttrs(data = {}) {
  return Object.entries(data).map(([key, value]) => `data-${key}="${escapeHtml(value)}"`).join(' ');
}

// 받침 여부에 따라 '이에요/예요'처럼 조사를 골라줘요.
export function josa(word, withBatchim, withoutBatchim) {
  const last = String(word).charCodeAt(String(word).length - 1);
  const isHangul = last >= 0xac00 && last <= 0xd7a3;
  const hasBatchim = isHangul && (last - 0xac00) % 28 !== 0;
  return `${word}${hasBatchim ? withBatchim : withoutBatchim}`;
}

// 칩: 둥근 알약 모양. 선택되면 노란 배경 + 체크, danger면 빨간 계열(알레르기)
export function chip({ label, emoji = '', selected = false, danger = false, disabled = false, action, data = {} }) {
  const classes = ['chip', selected ? 'selected' : '', danger ? 'danger' : ''].filter(Boolean).join(' ');
  const check = selected ? '<span class="chip-check" aria-hidden="true">✓</span>' : '';
  return `<button type="button" class="${classes}" data-action="${action}" ${dataAttrs(data)} aria-pressed="${selected}"${disabled ? ' disabled' : ''}>${check}${emoji ? `<span aria-hidden="true">${emoji}</span>` : ''}${escapeHtml(label)}</button>`;
}

// 큰 선택 카드: 이모지 + 제목 + 한 줄 설명, 카드 전체가 버튼
export function choiceCard({ emoji, title, desc = '', action, data = {}, size = 'normal', tone = '' }) {
  return `<button type="button" class="choice-card ${size}" data-action="${action}" ${dataAttrs(data)}>
    <span class="choice-emoji ${tone}" aria-hidden="true">${emoji}</span>
    <span class="choice-copy"><strong>${escapeHtml(title)}</strong>${desc ? `<small>${escapeHtml(desc)}</small>` : ''}</span>
    <span class="chevron" aria-hidden="true">›</span>
  </button>`;
}

const BUDGET_LABEL = { 저렴: '💸 저렴', 보통: '💰 보통', 여유: '✨ 여유' };

// 추천 카드: 위쪽 그림 영역(이모지 + 파스텔 배경), 이름, 이유 한 줄, 가격대·소요시간 태그
export function recCard(item, index) {
  return `<article class="rec-card" style="--i:${index}" data-index="${index}" aria-label="추천 ${index + 1}: ${escapeHtml(item.title)}">
    <div class="rec-art tone-${escapeHtml(item.color)}">
      <span class="rec-scene">${escapeHtml(item.scene)}</span>
      <span class="rec-emoji" aria-hidden="true">${item.emoji}</span>
    </div>
    <div class="rec-body">
      <h2>${escapeHtml(item.title)}</h2>
      <p class="rec-reason"><span>왜 추천했냐면</span>${escapeHtml(item.reason)}</p>
      <div class="tag-line"><span class="tag">${BUDGET_LABEL[item.budget] || escapeHtml(item.budget)}</span><span class="tag">⏱️ 약 ${item.minutes}분</span></div>
    </div>
  </article>`;
}

// 로딩 상태: 스켈레톤 카드
export function skeletonCards(count = 1) {
  return Array.from({ length: count }, () => `<div class="skeleton-card" aria-hidden="true"><div class="sk sk-art"></div><div class="sk sk-line w70"></div><div class="sk sk-line w90"></div><div class="sk sk-line w40"></div></div>`).join('');
}

export function loadingState(text = '불러오는 중이에요…') {
  return `<div class="state-box" role="status"><div class="spinner" aria-hidden="true"></div><p>${escapeHtml(text)}</p></div>`;
}

// 에러 상태: "잠깐 문제가 생겼어요" + 다시 시도
export function errorState({ action = 'retry', data = {}, text = '잠깐 문제가 생겼어요' } = {}) {
  return `<div class="state-box error" role="alert"><span class="state-emoji" aria-hidden="true">🫠</span><p><strong>${escapeHtml(text)}</strong><br />잠시 후 다시 시도해 주세요.</p><button type="button" class="button outline" data-action="${action}" ${dataAttrs(data)}>다시 시도</button></div>`;
}

// 빈 상태: 큰 이모지 + 안내 문구 + 행동 버튼
export function emptyState({ emoji = '📝', text, actionLabel, action, data = {} }) {
  return `<div class="state-box empty"><span class="state-emoji" aria-hidden="true">${emoji}</span><p>${text}</p>${actionLabel ? `<button type="button" class="button primary" data-action="${action}" ${dataAttrs(data)}>${escapeHtml(actionLabel)}</button>` : ''}</div>`;
}

// 단계형 화면 상단 진행 바 (예: 2 / 5)
export function progressBar(current, total) {
  const percent = Math.round((current / total) * 100);
  return `<div class="progress" role="progressbar" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${current}" aria-label="${total}단계 중 ${current}단계">
    <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
    <span class="progress-text">${current} / ${total}</span>
  </div>`;
}

// 하단 고정 기본 버튼 영역. extra에 리파인 칩 줄 같은 걸 함께 넣을 수 있어요.
export function bottomCta({ label, action, disabled = false, hint = '', extra = '', data = {} }) {
  return `<div class="bottom-cta">
    ${extra}
    ${hint ? `<p class="cta-hint">${escapeHtml(hint)}</p>` : ''}
    <button type="button" class="button primary full big" data-action="${action}" ${dataAttrs(data)} ${disabled ? 'disabled' : ''}>${escapeHtml(label)}</button>
  </div>`;
}

// 하단 탭바: 홈 / 기록 / 내 취향
export function tabBar(active) {
  const tabs = [
    { id: 'home', label: '홈', icon: '🏠' },
    { id: 'history', label: '기록', icon: '📅' },
    { id: 'profile', label: '내 취향', icon: '💛' }
  ];
  return `<nav class="tab-bar" aria-label="하단 메뉴">${tabs.map((tab) => `<button type="button" class="tab ${active === tab.id ? 'active' : ''}" data-action="tab" data-target="${tab.id}" ${active === tab.id ? 'aria-current="page"' : ''}><span class="tab-icon" aria-hidden="true">${tab.icon}</span><span>${tab.label}</span></button>`).join('')}</nav>`;
}

/* ───── 토스트와 확인 팝업 (index.html의 #toast, #modal-root를 써요) ───── */

let toastTimer = null;
export function showToast(message) {
  const toastEl = document.querySelector('#toast');
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

let modalConfirm = null;
let modalReturnFocus = null;
export function showModal({ title, text, confirmLabel, onConfirm, danger = false }) {
  const root = document.querySelector('#modal-root');
  modalConfirm = onConfirm;
  modalReturnFocus = document.activeElement;
  root.innerHTML = `<div class="modal-backdrop" data-modal="backdrop">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-text">
      <h2 id="modal-title">${escapeHtml(title)}</h2>
      <p id="modal-text">${escapeHtml(text)}</p>
      <div class="modal-actions">
        <button type="button" class="button outline" data-modal="cancel">취소</button>
        <button type="button" class="button ${danger ? 'danger' : 'primary'}" data-modal="confirm">${escapeHtml(confirmLabel)}</button>
      </div>
    </div>
  </div>`;
  root.querySelector('[data-modal="confirm"]').focus();
}

function closeModal() {
  document.querySelector('#modal-root').innerHTML = '';
  modalConfirm = null;
  modalReturnFocus?.focus?.();
}

// 팝업 버튼 처리: 배경·취소는 닫기, 확인은 닫고 실행
export function setupModal() {
  const root = document.querySelector('#modal-root');
  root.addEventListener('click', (event) => {
    const role = event.target.dataset?.modal;
    if (role === 'backdrop' || role === 'cancel') closeModal();
    if (role === 'confirm') {
      const action = modalConfirm;
      closeModal();
      action?.();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.innerHTML) closeModal();
  });
}

// 결정 완료 축하용 컨페티. CSS 애니메이션만 써요. (1초 이내)
export function confetti() {
  const colors = ['#FFD43B', '#FF8A65', '#7BD389', '#74B9FF', '#B39DDB'];
  const pieces = Array.from({ length: 16 }, (_, i) => {
    const angle = (360 / 16) * i;
    const distance = 70 + (i % 3) * 22;
    return `<span style="--a:${angle}deg;--d:${distance}px;--c:${colors[i % colors.length]};--delay:${(i % 4) * 30}ms"></span>`;
  }).join('');
  return `<div class="confetti" aria-hidden="true">${pieces}</div>`;
}
