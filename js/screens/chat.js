// 💬 하루에게 물어보기: 챗봇 대화 화면
// 답변은 글자가 흘러나오듯 보이고(스트리밍), 함께 온 추천은 카드로 보여줘서 바로 결정할 수 있어요.
import { state } from '../state.js';
import { escapeHtml } from '../components.js';

const chatbotAvatar = `./icon_images/${encodeURIComponent('챗봇 갈색 아기 동물 캐릭터.png')}`;

export const CHAT_SUGGESTIONS = ['오늘 저녁 뭐 먹지?', '비 오는 날 뭐 하고 놀지?', '출근할 때 뭐 입을까?'];

function recommendationCards(message, messageIndex) {
  if (!message.recommendations?.length) return '';
  return `<div class="chat-recs">${message.recommendations.map((item, itemIndex) => `<div class="chat-rec">
    <span class="chat-rec-emoji tone-${escapeHtml(item.color || 'cream')}" aria-hidden="true">${item.emoji || '✨'}</span>
    <span class="chat-rec-copy"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.reason || '')}</small></span>
    <button type="button" class="button primary small" data-action="chat-pick" data-msg="${messageIndex}" data-item="${itemIndex}" aria-label="${escapeHtml(item.title)}로 결정하기">이걸로</button>
  </div>`).join('')}</div>`;
}

function bubble(message, index) {
  if (message.role === 'user') return `<div class="bubble user">${escapeHtml(message.content)}</div>`;
  const classes = ['bubble', 'bot', message.pending ? 'pending' : '', message.error || message.degraded ? 'muted' : ''].filter(Boolean).join(' ');
  const text = message.content || (message.pending ? '' : '…');
  return `<div class="bot-row">
    <span class="bot-avatar" aria-hidden="true"><img src="${chatbotAvatar}" alt="" /></span>
    <div class="bot-col">
      <div class="${classes}" ${message.pending ? 'id="chat-streaming"' : ''}>${escapeHtml(text)}${message.pending && !text ? '<span class="typing" aria-label="답변 쓰는 중"><i></i><i></i><i></i></span>' : ''}</div>
      ${recommendationCards(message, index)}
    </div>
  </div>`;
}

export function renderChat() {
  const { messages, status } = state.chat;
  const intro = `<div class="chat-intro">
      <p class="eyebrow">하루에게 물어보기</p>
      <h1 tabindex="-1">고민을 편하게 말해 주세요</h1>
      <p class="lead">취향과 오늘 날씨에 맞춰 골라드릴게요.</p>
      <div class="chips chat-suggestions">${CHAT_SUGGESTIONS.map((text) => `<button type="button" class="chip" data-action="chat-suggest" data-value="${escapeHtml(text)}">${escapeHtml(text)}</button>`).join('')}</div>
      <p class="chat-notice">알레르기나 재료 안전까지 보장하지는 않아요. 꼭 확인해 주세요.</p>
    </div>`;
  const sending = status === 'sending';
  return {
    title: '💬 하루에게 물어보기',
    back: { action: 'chat-back', label: '홈으로' },
    main: `${messages.length ? '<h1 class="sr-only" tabindex="-1">하루에게 물어보기</h1>' : intro}
      <div class="chat-log" role="log" aria-live="polite">${messages.map(bubble).join('')}</div>`,
    cta: `<div class="bottom-cta chat-form">
      <label for="chat-input" class="sr-only">메시지 입력</label>
      <input id="chat-input" type="text" maxlength="500" autocomplete="off" placeholder="예: 비 오는데 저녁 뭐 먹지?" ${sending ? 'disabled' : ''} />
      <button type="button" class="button primary send-button" data-action="chat-send" aria-label="보내기" ${sending ? 'disabled' : ''}>↑</button>
    </div>`
  };
}
