// ⑨ 기록: 이번 주 요약 카드(스포티파이 결산 느낌) + 날짜별 결정 목록
import { state, RATING, categoryInfo } from '../state.js';
import { escapeHtml, josa, loadingState, errorState, emptyState } from '../components.js';

// 기록 날짜를 '오늘 / 어제 / 10월 28일 (화)'처럼 보여줘요.
function dayLabel(time) {
  const date = new Date(time);
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(new Date()) - startOf(date)) / 86400000);
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(date);
}

function summaryCard(records) {
  const weekAgo = Date.now() - 7 * 86400000;
  const week = records.filter((record) => record.createdAt >= weekAgo);
  if (!week.length) {
    return '<section class="summary-card"><p class="summary-kicker">이번 주 하루</p><p class="summary-main">이번 주는 아직 기록이 없어요</p></section>';
  }
  // 이번 주에 가장 많이 나온 태그를 찾아요.
  const counts = new Map();
  for (const record of week) for (const tag of record.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);
  const [topTag] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topRecord = week.find((record) => (record.tags || []).includes(topTag));
  const goodCount = week.filter((record) => record.rating === 'good').length;
  return `<section class="summary-card" aria-label="이번 주 요약">
    <p class="summary-kicker">이번 주 하루</p>
    <p class="summary-main">이번 주 가장 많이 고른 건<br /><strong>${escapeHtml(josa(topTag, '이에요', '예요'))}</strong> ${topRecord?.emoji || '✨'}</p>
    <div class="summary-stats"><span><b>${week.length}</b>번 결정</span><span><b>${goodCount}</b>번 좋았어요</span></div>
  </section>`;
}

function historyItem(record) {
  const category = categoryInfo(record.category);
  // 아직 평가 안 한 기록은 여기서 바로 만족도를 남길 수 있어요.
  const rating = record.rating
    ? `<span class="history-rating" aria-label="만족도 ${RATING[record.rating].label}">${RATING[record.rating].emoji}</span>`
    : `<span class="rate-inline" role="group" aria-label="어땠는지 알려주세요">${Object.entries(RATING).map(([key, value]) => `<button type="button" data-action="rate-record" data-id="${escapeHtml(record.id)}" data-rating="${key}" aria-label="${value.label}">${value.emoji}</button>`).join('')}</span>`;
  return `<article class="history-item">
    <span class="history-icon" aria-hidden="true">${category.emoji}</span>
    <span class="history-copy"><strong>${escapeHtml(record.title)}</strong><small>${category.title}</small></span>
    ${rating}
  </article>`;
}

function body() {
  const { status, records } = state.history;
  if (status === 'error') return errorState({ action: 'history-retry' });
  if (status === 'empty') return emptyState({ emoji: '📝', text: '아직 기록이 없어요.<br />첫 결정을 해볼까요?', actionLabel: '첫 결정 하러 가기', action: 'go-categories' });
  if (status !== 'ready') return `<div class="sk sk-summary" aria-hidden="true"></div>${loadingState('기록을 불러오는 중이에요…')}`;

  const groups = new Map();
  for (const record of records) {
    const label = dayLabel(record.createdAt);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(record);
  }
  return `${summaryCard(records)}
    ${[...groups.entries()].map(([label, list]) => `<section class="day-group">
      <h2 class="day-label">${escapeHtml(label)}</h2>
      ${list.map(historyItem).join('')}
    </section>`).join('')}`;
}

export function renderHistory() {
  return {
    main: `<h1 tabindex="-1">나의 기록</h1>
      <p class="lead">고른 만큼 하루가 나를 더 잘 알게 돼요.</p>
      ${body()}`
  };
}
