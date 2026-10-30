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

function formatQuestion(question) {
  const marker = question.indexOf(' 뭐 ');
  if (marker === -1) return escapeHtml(question);
  return `${escapeHtml(question.slice(0, marker))}<br class="question-break" />${escapeHtml(question.slice(marker + 1))}`;
}

export function renderHome() {
  const slot = currentSlot();
  const main = categoryInfo(slot.category);
  const others = CATEGORIES.filter((category) => category.id !== slot.category);
  return {
    main: `<section class="home-hero" aria-label="오늘의 추천">
        <div class="home-hero-copy">
          <p class="home-kicker">오늘의 결정 메모</p>
          <div class="home-context"><span class="date-line">${todayLabel()}</span>${weatherLine()}</div>
          <div class="hero-intro">
            <p class="greeting-hello">${escapeHtml(slot.hello)}</p>
            <h1 tabindex="-1">${formatQuestion(slot.question)}</h1>
            <p class="home-lead">정답을 고르는 대신,<br class="desktop-break" /> 지금의 나에게 잘 맞는 쪽을 같이 찾아요.</p>
          </div>
          <div class="hero-choice">
            <p class="section-kicker">지금 골라보기</p>
            ${choiceCard({ emoji: main.emoji, title: main.title, desc: main.subtitle, action: 'start-category', data: { category: main.id }, size: 'big', tone: main.color })}
          </div>
          <button type="button" class="chat-entry" data-action="open-chat">
            <span class="chat-entry-icon" aria-hidden="true">✦</span>
            <span class="chat-entry-copy"><strong>하루에게 바로 물어보기</strong><small>“비 오는데 저녁 뭐 먹지?”처럼 편하게 물어보세요</small></span>
            <span class="chevron" aria-hidden="true">↗</span>
          </button>
        </div>
        <div class="home-mosaic" aria-hidden="true">
          <div class="mosaic-column mosaic-column-a"><span class="mosaic-tile mosaic-photo photo-burger"><img src="/hero_images/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg" alt="" /></span><span class="mosaic-tile mosaic-photo photo-chicken"><img src="/hero_images/kevin-kevin-nwmZhwOSVnM-unsplash.jpg" alt="" /></span><span class="mosaic-tile mosaic-photo photo-pizza"><img src="/hero_images/ivan-torres-MQUqbmszGGM-unsplash.jpg" alt="" /></span></div>
          <div class="mosaic-column mosaic-column-b"><span class="mosaic-tile mosaic-photo photo-jacket"><img src="/hero_images/victoria-priessnitz-VsCBt8j-qg4-unsplash.jpg" alt="" /></span><span class="mosaic-tile mosaic-photo photo-cap"><img src="/hero_images/sonu-kumar-8XZBP38QJFM-unsplash.jpg" alt="" /></span><span class="mosaic-tile mosaic-photo photo-jeans"><img src="/hero_images/jason-leung-EtOMMg1nSR8-unsplash.jpg" alt="" /></span></div>
          <div class="mosaic-column mosaic-column-c"><span class="mosaic-tile mosaic-photo photo-game"><img src="/hero_images/kade-tyack-u3ruGMN29nk-unsplash.jpg" alt="" /></span><span class="mosaic-tile mosaic-photo photo-projector"><img src="/hero_images/alex-litvin-MAYsdoYpGuk-unsplash.jpg" alt="" /></span><span class="mosaic-tile mosaic-photo photo-reading"><img src="/hero_images/blaz-photo-zMRLZh40kms-unsplash.jpg" alt="" /></span></div>
        </div>
      </section>
      <section class="home-explore" aria-labelledby="explore-title">
        <div><p class="section-kicker">다른 고민도 바로 시작해요</p><h2 id="explore-title" class="section-title">오늘의 선택을<br class="desktop-break" /> 가볍게 열어보세요.</h2></div>
        <div class="mini-cards">${others.map((category) => `<button type="button" class="mini-card" data-action="start-category" data-category="${category.id}"><span aria-hidden="true">${category.emoji}</span><strong>${category.title}</strong><small>${category.subtitle}</small><b aria-hidden="true">↗</b></button>`).join('')}</div>
      </section>
      <section class="home-story" aria-labelledby="story-title">
        <div class="home-story-intro"><p class="section-kicker">하루를 쓰는 방법</p><h2 id="story-title">작은 고민을<br />가벼운 선택으로.</h2><p>정답을 정해 주기보다, 지금의 기분과 상황에 어울리는 시작점을 함께 찾아드려요.</p></div>
        <ol class="story-steps">
          <li><span>01</span><strong>내 취향</strong><p>좋아하는 것과 피하고 싶은 것을 알려주세요.</p></li>
          <li><span>02</span><strong>지금 상황</strong><p>기분, 시간, 예산을 짧게 골라요.</p></li>
          <li><span>03</span><strong>오늘의 추천</strong><p>고민을 덜어 줄 선택지를 받아보세요.</p></li>
        </ol>
      </section>`
  };
}
