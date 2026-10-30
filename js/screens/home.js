// ③ 홈: 시간대별 인사 + 날짜·날씨 + 시간대에 맞는 카테고리 하나 크게, 나머지 둘은 작게
import { CATEGORIES } from '../data.js';
import { state, currentSlot, categoryInfo } from '../state.js';
import { escapeHtml, choiceCard } from '../components.js';

function todayLabel() {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
}

// 날씨 한 줄: 불러오는 중(스켈레톤) / 실패(다시 시도) / 성공
function weatherLine() {
  const { status, weather, isMock } = state.context;
  if (status === 'ready' && weather) return `<p class="weather-line">${escapeHtml(weather.text)}${weather.temp !== null && weather.temp !== undefined ? ` · ${weather.temp}°` : ''}${isMock ? ' <span class="mock-badge">예시</span>' : ''}</p>`;
  if (status === 'error') return `<p class="weather-line muted">날씨를 불러오지 못했어요 · <button type="button" class="link-button" data-action="context-retry">다시 시도</button></p>`;
  return '<div class="sk sk-line w60" role="status" aria-label="날씨 불러오는 중"></div>';
}

export function renderHome() {
  const slot = currentSlot();
  const main = categoryInfo(slot.category);
  const others = CATEGORIES.filter((category) => category.id !== slot.category);
  return {
    main: `<p class="date-line">${todayLabel()}</p>
      ${weatherLine()}
      <section class="greeting-card" aria-label="오늘의 알림">
        <p class="greeting-hello">${escapeHtml(slot.hello)}</p>
        <h1 tabindex="-1">${escapeHtml(slot.question)}</h1>
      </section>
      <h2 class="section-title">지금은 이걸 추천해요</h2>
      ${choiceCard({ emoji: main.emoji, title: main.title, desc: main.subtitle, action: 'start-category', data: { category: main.id }, size: 'big', tone: main.color })}
      <div class="mini-cards">${others.map((category) => `<button type="button" class="mini-card" data-action="start-category" data-category="${category.id}"><span aria-hidden="true">${category.emoji}</span>${category.title}</button>`).join('')}</div>
      <button type="button" class="chat-entry" data-action="open-chat">
        <span class="chat-entry-icon" aria-hidden="true">💬</span>
        <span class="chat-entry-copy"><strong>하루에게 물어보기</strong><small>“비 오는데 저녁 뭐 먹지?”처럼 편하게 물어보세요</small></span>
        <span class="chevron" aria-hidden="true">›</span>
      </button>`
  };
}
