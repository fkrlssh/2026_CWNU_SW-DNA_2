import { CATALOG, CATEGORIES, TASTE_GROUPS } from './data.js';

const STORAGE_KEY = 'haru-prototype-v1';
const app = document.querySelector('#app');

// 작은 프로토타입이라 별도 서버 대신 브라우저 저장소에서 취향과 기록을 불러옵니다.
function loadSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      profile: saved.profile || null,
      records: Array.isArray(saved.records) ? saved.records : []
    };
  } catch {
    return { profile: null, records: [] };
  }
}

const saved = loadSavedState();
const state = {
  profile: saved.profile,
  records: saved.records,
  view: saved.profile ? 'home' : 'onboarding',
  editingProfile: false,
  category: 'eat',
  answers: {},
  questionIndex: 0,
  candidates: [],
  candidateIndex: 0,
  currentChoice: null,
  currentRecordId: null,
  refine: null,
  recommendationSeed: 0
};

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: state.profile, records: state.records }));
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function categoryInfo(id = state.category) {
  return CATEGORIES.find((category) => category.id === id) || CATEGORIES[0];
}

function todayLabel() {
  return new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
}

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return { label: '좋은 아침이에요', title: '아침, 뭐 먹을까요?', category: 'eat', emoji: '🌤️' };
  if (hour >= 11 && hour < 15) return { label: '점심 시간이에요', title: '오늘 뭐 먹을까요?', category: 'eat', emoji: '☀️' };
  if (hour >= 15 && hour < 18) return { label: '잠깐 쉬어갈 시간이에요', title: '오늘은 뭐 하면 좋을까요?', category: 'do', emoji: '🌿' };
  if (hour >= 18 && hour < 22) return { label: '저녁 시간이에요', title: '저녁은 뭘 입고 나갈까요?', category: 'wear', emoji: '🌙' };
  return { label: '하루를 마무리할 시간이에요', title: '오늘은 어떻게 쉬어볼까요?', category: 'do', emoji: '🌙' };
}

function renderHeader() {
  return `<header class="topbar">
    <a href="#" class="brand" data-action="home" aria-label="하루 홈으로 이동"><img src="./brand-mark.svg" alt="" />하루 <small>오늘도 가볍게</small></a>
    <span class="topbar-note">고민은 줄이고, 하루는 가볍게</span>
  </header>`;
}

function renderNav() {
  const tabs = [
    { id: 'home', label: '홈', icon: '⌂' },
    { id: 'history', label: '기록', icon: '▤' },
    { id: 'profile', label: '내 취향', icon: '♡' }
  ];
  const active = state.view === 'history' ? 'history' : (state.view === 'onboarding' ? 'profile' : 'home');
  return `<nav class="bottom-nav" aria-label="하단 메뉴">${tabs.map((tab) => `<button class="nav-item ${active === tab.id ? 'active' : ''}" data-action="nav" data-target="${tab.id}" aria-label="${tab.label}"><span class="nav-icon">${tab.icon}</span><span>${tab.label}</span></button>`).join('')}</nav>`;
}

function renderHome() {
  const greeting = timeGreeting();
  return `<main class="screen">
    <div class="home-date"><span class="date-text">${todayLabel()}</span><span class="weather-pill">오늘 예시 날씨 · ☀️ 맑음 18°</span></div>
    <section class="alert-card" aria-label="오늘의 시간 알림">
      <span class="sun-mark" aria-hidden="true">${greeting.emoji}</span>
      <p class="alert-kicker">${greeting.label}</p>
      <h1>${greeting.title}</h1>
      <button class="button primary" data-action="open-categories">오늘의 선택 시작하기 <span aria-hidden="true">→</span></button>
    </section>
    <div class="section-heading"><h2>오늘은 하나만 정해도 충분해요.</h2></div>
    <div class="tip-card"><span class="tip-icon" aria-hidden="true">✨</span><span>먹기, 입기, 하기까지. 하루의 작은 결정을 한 곳에서 가볍게 도와드릴게요.</span></div>
  </main>`;
}

function renderCategories() {
  return `<main class="screen">
    <p class="eyebrow">오늘의 결정 · 하나만 골라요</p>
    <h1>어떤 걸 도와드릴까요?</h1>
    <p class="lead">지금 가장 고민되는 것 하나만 탭해주세요.</p>
    <section class="category-list" aria-label="결정 카테고리">${CATEGORIES.map((category) => `<button class="category-card" data-action="start-category" data-category="${category.id}">
      <span class="category-emoji ${category.color}" aria-hidden="true">${category.emoji}</span>
      <span class="category-copy"><strong>${category.title}</strong><span>${category.subtitle}</span></span><span class="chevron" aria-hidden="true">›</span>
    </button>`).join('')}</section>
    <div class="tip-card"><span class="tip-icon" aria-hidden="true">🌿</span><span>선택지를 세 개로만 줄였어요. 마음이 가는 쪽으로 골라주세요.</span></div>
    <button class="button ghost full" data-action="home">← 홈으로</button>
  </main>`;
}

function renderOnboarding() {
  const profile = state.profile || { food: [], style: [], activity: [], budgetRange: '보통', activeTime: '저녁형' };
  const groups = TASTE_GROUPS.map((group) => {
    const selected = Array.isArray(profile[group.id]) ? profile[group.id] : [];
    return `<section class="form-section">
      <div class="group-heading"><strong>${group.title}</strong><span>${selected.length >= 3 ? `${selected.length}개 골랐어요` : `세 가지 이상 골라주세요 · ${selected.length}/3`}</span></div>
      <div class="chips">${group.choices.map((choice) => `<button class="chip ${selected.includes(choice) ? 'selected' : ''}" data-action="toggle-taste" data-group="${group.id}" data-value="${choice}" aria-pressed="${selected.includes(choice)}">${choice}</button>`).join('')}</div>
    </section>`;
  }).join('');
  const budgets = ['아껴 쓰는 편', '보통', '조금 여유롭게'];
  const activeTimes = ['아침형', '낮형', '저녁형'];
  return `<main class="screen">
    <p class="eyebrow">${state.editingProfile ? '내 취향' : '처음 만나는 하루'}</p>
    <h1>${state.editingProfile ? '요즘 취향에 맞게<br />살짝 바꿔볼까요?' : '하루의 선택을<br />조금 가볍게 해볼까요?'}</h1>
    <p class="lead">좋아하는 걸 알려주시면, 다음 추천부터 꼭 기억해둘게요.</p>
    <div class="onboard-progress" aria-hidden="true"><span class="on"></span><span class="on"></span><span class="on"></span><span class="on"></span></div>
    ${groups}
    <section class="form-section">
      <div class="group-heading"><strong>예산과 활동 시간대</strong><span>언제 주로 움직이세요?</span></div>
      <div class="profile-selects">
        <div class="select-card"><label>예산 범위</label><div class="select-options">${budgets.map((value) => `<button class="${profile.budgetRange === value ? 'selected' : ''}" data-action="set-profile-value" data-key="budgetRange" data-value="${value}">${value}</button>`).join('')}</div></div>
        <div class="select-card"><label>주 활동 시간</label><div class="select-options">${activeTimes.map((value) => `<button class="${profile.activeTime === value ? 'selected' : ''}" data-action="set-profile-value" data-key="activeTime" data-value="${value}">${value}</button>`).join('')}</div></div>
      </div>
    </section>
    <div class="onboard-footer"><button class="button sun full" data-action="save-profile">${state.editingProfile ? '취향 저장하기' : '내 취향으로 시작하기'} <span aria-hidden="true">→</span></button><p class="benefit-line">취향과 선택 기록은 이 브라우저에만 저장돼요.</p></div>
  </main>`;
}

function situationSteps() {
  const category = state.category;
  const modes = category === 'eat'
    ? [{ label: '배달로 편하게', value: '배달', emoji: '🛵' }, { label: '밖에서 먹기', value: '외식', emoji: '🍽️' }, { label: '집밥으로 간단히', value: '집밥', emoji: '🍳' }]
    : category === 'wear'
      ? [{ label: '출근이나 약속', value: '출근·약속', emoji: '👜' }, { label: '편하게 외출', value: '편한 외출', emoji: '🚶' }, { label: '집에서 쉬기', value: '집콕', emoji: '🏠' }]
      : [{ label: '집에서 여유롭게', value: '집콕', emoji: '🛋️' }, { label: '가볍게 외출', value: '가벼운 외출', emoji: '🌳' }, { label: '문화생활 즐기기', value: '문화생활', emoji: '🎨' }];
  return [
    { key: 'mood', title: '지금 기분은 어때요?', detail: '마음 가는 쪽으로 골라주세요', options: [{ label: '기분 좋아요', value: '좋음', emoji: '😊' }, { label: '조금 피곤해요', value: '피곤', emoji: '😮‍💨' }, { label: '기운이 가라앉았어요', value: '우울', emoji: '🌧️' }] },
    { key: 'budget', title: '오늘 예산은 어느 쪽인가요?', detail: '대략적인 느낌이면 충분해요', options: [{ label: '조금 아끼고 싶어요', value: '저렴', emoji: '🌱' }, { label: '평소처럼 괜찮아요', value: '보통', emoji: '👌' }, { label: '오늘은 여유 있어요', value: '여유', emoji: '✨' }] },
    { key: 'time', title: '얼마나 시간을 쓸 수 있어요?', detail: '지금 가능한 만큼만 골라요', options: [{ label: '10분 안에', value: '10분', emoji: '⏱️' }, { label: '1시간 정도', value: '1시간', emoji: '🕐' }, { label: '반나절도 괜찮아요', value: '반나절', emoji: '🌤️' }] },
    { key: 'mode', title: category === 'eat' ? '어떻게 해결하고 싶으세요?' : category === 'wear' ? '어디에 갈 예정이세요?' : '어떤 시간을 보내고 싶어요?', detail: '상황에 맞춰 추천을 골라볼게요', options: modes }
  ];
}

function renderSituation() {
  const steps = situationSteps();
  const current = steps[state.questionIndex];
  const category = categoryInfo();
  return `<main class="screen">
    <p class="eyebrow">${category.emoji} ${category.title} · 상황 입력</p>
    <h1>${current.title}</h1><p class="lead">${current.detail}</p>
    <div class="step-row" aria-label="질문 ${state.questionIndex + 1}/4">${steps.map((_, index) => `<span class="${index <= state.questionIndex ? 'on' : ''}"></span>`).join('')}</div>
    <div class="choice-list">${current.options.map((option) => `<button class="choice-card" data-action="situation-choice" data-key="${current.key}" data-value="${option.value}"><span>${option.emoji}　${option.label}</span><span aria-hidden="true">›</span></button>`).join('')}</div>
    <div class="situation-footnote">선택은 네 번이면 끝나요. 입력하지 않아도 충분히 좋은 추천을 드릴게요.</div>
    <div class="refine-back"><button class="button ghost" data-action="situation-back">← ${state.questionIndex === 0 ? '카테고리 다시 고르기' : '이전 질문'}</button><span class="date-text">${state.questionIndex + 1} / ${steps.length}</span></div>
  </main>`;
}

function selectedTasteTags() {
  const mapping = { eat: 'food', wear: 'style', do: 'activity' };
  return (state.profile && state.profile[mapping[state.category]]) || [];
}

function rateLabel(value) {
  return ({ '좋았어요': '😊 좋았어요', '보통': '🙂 보통', '별로': '🙁 별로' })[value] || '아직 평가 전';
}

function scoreItem(item, index) {
  const answers = state.answers;
  let score = 0;
  const chosenTags = selectedTasteTags();
  if (item.tags.some((tag) => chosenTags.includes(tag))) score += 5;
  if (item.moods.includes(answers.mood)) score += 3;
  if (item.modes.includes(answers.mode)) score += 5;
  const budgetRank = { 저렴: 0, 보통: 1, 여유: 2 };
  const requestedBudget = budgetRank[answers.budget] ?? 1;
  const itemBudget = budgetRank[item.budget] ?? 1;
  score += 3 - Math.abs(requestedBudget - itemBudget) * 2;
  if (answers.time === '10분') score += item.minutes <= 10 ? 6 : item.minutes <= 20 ? 1 : -4;
  if (answers.time === '1시간') score += item.minutes <= 60 ? 4 : 0;
  if (answers.time === '반나절') score += item.minutes > 30 ? 3 : 1;
  if (state.profile?.budgetRange === '아껴 쓰는 편' && itemBudget === 0) score += 1;
  if (state.profile?.budgetRange === '조금 여유롭게' && itemBudget === 2) score += 1;

  // 과거에 좋았던 선택의 태그는 조금 더, 아쉬웠던 선택은 덜 추천합니다.
  for (const record of state.records) {
    if (!record.tags || !record.rating) continue;
    const overlap = record.tags.some((tag) => item.tags.includes(tag));
    if (overlap && record.rating === '좋았어요') score += 1.4;
    if (overlap && record.rating === '별로') score -= 1.8;
  }
  if (state.refine === 'cheaper') score += itemBudget === 0 ? 4 : itemBudget === 1 ? 1 : -4;
  if (state.refine === 'lighter') score += item.minutes <= 15 ? 4 : item.minutes <= 30 ? 1 : -3;
  if (state.refine === 'different' && state.currentChoice) {
    const sharesType = item.tags.some((tag) => state.currentChoice.tags.includes(tag));
    score += sharesType ? -5 : 3;
  }
  if (state.refine === 'new') score += ((index + state.recommendationSeed * 7) % CATALOG[state.category].length) / 100;
  return score;
}

function buildRecommendations() {
  const items = CATALOG[state.category] || CATALOG.eat;
  const ranked = items.map((item, index) => ({ item, score: scoreItem(item, index), index }));
  ranked.sort((a, b) => b.score - a.score || ((a.index + state.recommendationSeed) % items.length) - ((b.index + state.recommendationSeed) % items.length));
  const previousIds = new Set(state.candidates.map((item) => item.id));
  // 새 추천은 직전 후보를 제외하고 남은 목업 데이터에서 세 개를 다시 고릅니다.
  let picked = state.refine === 'new' && previousIds.size
    ? ranked.filter(({ item }) => !previousIds.has(item.id)).slice(0, 3)
    : ranked.slice(0, 3);
  if (picked.length < 3) {
    const pickedIds = new Set(picked.map(({ item }) => item.id));
    picked = [...picked, ...ranked.filter(({ item }) => !pickedIds.has(item.id)).slice(0, 3 - picked.length)];
  }
  state.candidates = picked.map(({ item }) => item);
  state.candidateIndex = 0;
  state.view = 'recommendations';
}

function renderRecommendations() {
  if (!state.candidates.length) buildRecommendations();
  const current = state.candidates[state.candidateIndex] || state.candidates[0];
  const category = categoryInfo();
  const options = state.candidates.map((item, index) => `<button class="candidate-pill ${index === state.candidateIndex ? 'active' : ''}" data-action="candidate-select" data-index="${index}" aria-label="후보 ${index + 1} 비교">후보 ${index + 1}</button>`).join('');
  return `<main class="screen">
    <p class="eyebrow">${category.emoji} ${category.title} · 취향에 맞춰 골랐어요</p>
    <h1>오늘은 이거 어때요?</h1>
    <p class="lead">하나씩 비교해보고 마음에 드는 걸 골라요.</p>
    <div class="recommend-meta"><span>추천 후보</span><span>${state.candidateIndex + 1} / 3</span></div>
    <div class="candidate-pills" role="tablist" aria-label="추천 후보 비교">${options}</div>
    <article class="candidate-card" data-swipe-card="true" aria-label="${escapeHtml(current.title)} 추천 카드">
      <div class="candidate-art tone-${current.color}"><span class="art-label">${escapeHtml(current.scene)}</span><span class="emoji" aria-hidden="true">${current.emoji}</span></div>
      <div class="candidate-body"><p class="candidate-overline">오늘의 ${category.title.replace('뭐 ', '')} 추천</p><h2>${escapeHtml(current.title)}</h2><p class="candidate-reason">${escapeHtml(current.reason)}</p>
        <div class="tag-line"><span class="tag">${escapeHtml(current.budget)} 예산</span><span class="tag">약 ${current.minutes}분</span>${current.tags.slice(0, 2).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
    </article>
    <p class="card-swipe-hint">옆으로 밀거나 위의 후보 버튼을 눌러 비교해보세요</p>
    <div class="recommend-actions"><button class="button sun" data-action="confirm-choice">이걸로 할래요</button><button class="button outline" data-action="open-refine">다른 추천</button></div>
  </main>`;
}

function renderRefine() {
  const category = categoryInfo();
  const refinements = [
    { id: 'cheaper', title: '더 싸게', description: '예산을 아끼는 선택으로', emoji: '🌱' },
    { id: 'lighter', title: '더 가볍게', description: '시간과 부담을 줄여서', emoji: '🪽' },
    { id: 'different', title: '다른 종류', description: '조금 새로운 방향으로', emoji: '🔀' },
    { id: 'new', title: '새로 추천', description: '후보를 새롭게 골라서', emoji: '✨' }
  ];
  return `<main class="screen">
    <p class="eyebrow">${category.emoji} 추천 다듬기</p><h1>어떤 쪽이 더 끌리세요?</h1><p class="lead">한 번 탭하면 새로운 후보를 골라드릴게요.</p>
    <div class="refine-intro">방금 추천한 <strong>${escapeHtml(state.currentChoice?.title || state.candidates[0]?.title || '')}</strong>와 조금 다른 선택도 찾아볼 수 있어요.</div>
    ${refinements.map((option) => `<button class="refine-option" data-action="refine" data-refine="${option.id}"><span><strong>${option.emoji}　${option.title}</strong><small>${option.description}</small></span><span aria-hidden="true">›</span></button>`).join('')}
    <div class="refine-back"><button class="button ghost" data-action="back-recommendations">← 추천으로 돌아가기</button><span class="date-text">후보는 항상 세 개</span></div>
  </main>`;
}

function renderDone() {
  const item = state.currentChoice;
  return `<main class="screen done-screen">
    <div class="celebration" aria-hidden="true">${item?.emoji || '🎉'}</div>
    <p class="eyebrow">오늘의 결정 완료</p>
    <h1>잘 골랐어요!<br />이제 고민 끝이에요.</h1>
    <p class="lead">선택한 만큼 오늘이 한결 가벼워질 거예요.</p>
    <section class="done-card"><p class="done-label">오늘의 선택</p><strong>${escapeHtml(item?.title || '')}</strong><p>${escapeHtml(item?.reason || '')}</p></section>
    <button class="button sun full" data-action="go-feedback">어땠는지 알려주기 <span aria-hidden="true">→</span></button>
    <button class="button ghost full" data-action="home">나중에 알려줄게요</button>
  </main>`;
}

function renderFeedback() {
  const item = state.currentChoice;
  const choices = [
    { label: '좋았어요', value: '좋았어요', emoji: '😊', sub: '다음에도 이런 느낌으로 추천할게요' },
    { label: '보통이에요', value: '보통', emoji: '🙂', sub: '기억해두고 조금 더 다듬어볼게요' },
    { label: '별로였어요', value: '별로', emoji: '🙁', sub: '다음에는 다른 쪽을 찾아볼게요' }
  ];
  return `<main class="screen">
    <p class="eyebrow">하루의 취향 배우기</p><h1>어땠어요?</h1><p class="lead">${escapeHtml(item?.title || '오늘의 선택')}는 마음에 들었나요?</p>
    <div class="feedback-options">${choices.map((choice) => `<button class="feedback-option" data-action="feedback" data-rating="${choice.value}"><span class="face" aria-hidden="true">${choice.emoji}</span><span><strong>${choice.label}</strong><br /><span class="date-text">${choice.sub}</span></span></button>`).join('')}</div>
    <p class="benefit-line">솔직한 한 번의 피드백이 다음 추천을 바꿔요.</p>
  </main>`;
}

function getTopPreferences() {
  const counts = new Map();
  for (const group of TASTE_GROUPS) {
    for (const tag of state.profile?.[group.id] || []) counts.set(tag, 0.15);
  }
  for (const record of state.records) {
    if (!record.tags) continue;
    const weight = record.rating === '좋았어요' ? 2 : record.rating === '별로' ? 0.2 : 1;
    for (const tag of record.tags) counts.set(tag, (counts.get(tag) || 0) + weight);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function renderHistory() {
  const records = [...state.records].sort((a, b) => b.createdAt - a.createdAt);
  const favorites = getTopPreferences();
  const recent = records.length ? `<div class="history-list">${records.map((record) => {
    const date = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(new Date(record.createdAt));
    return `<article class="history-card"><span class="history-emoji" aria-hidden="true">${record.emoji || '✨'}</span><span class="history-copy"><strong>${escapeHtml(record.title)}</strong><small>${escapeHtml(record.categoryTitle)} · ${date}</small></span><span class="history-rate">${rateLabel(record.rating)}</span></article>`;
  }).join('')}</div>` : `<div class="empty-state"><span class="empty-emoji">📝</span>아직 결정 기록이 없어요.<br />오늘의 작은 선택부터 남겨볼까요?<div style="margin-top:15px"><button class="button sun" data-action="home">오늘 선택하기</button></div></div>`;
  return `<main class="screen">
    <p class="eyebrow">선택이 쌓이면 취향이 보여요</p>
    <div class="history-head"><div><h1>나의 기록</h1><p class="lead">지금까지 ${records.length}번, 스스로 잘 골랐어요.</p></div><span class="count-badge">${records.length}번의 선택</span></div>
    <section class="summary-card"><p class="summary-title">요즘 자주 고른 취향</p><div class="summary-tags">${favorites.length ? favorites.map(([tag, count]) => `<span class="summary-tag">${escapeHtml(tag)} <b>${Math.max(1, Math.round(count))}</b></span>`).join('') : '<span class="summary-tag">취향을 고르면 여기에 보여요</span>'}</div></section>
    <div class="section-heading"><h2>지난 선택</h2><span>피드백도 다음 추천에 반영돼요</span></div>${recent}
  </main>`;
}

function renderContent() {
  switch (state.view) {
    case 'onboarding': return renderOnboarding();
    case 'home': return renderHome();
    case 'categories': return renderCategories();
    case 'situation': return renderSituation();
    case 'recommendations': return renderRecommendations();
    case 'refine': return renderRefine();
    case 'done': return renderDone();
    case 'feedback': return renderFeedback();
    case 'history': return renderHistory();
    default: return renderHome();
  }
}

function render() {
  const needsOnboarding = !state.profile && state.view === 'onboarding';
  app.classList.toggle('no-tabs', needsOnboarding);
  app.innerHTML = `${renderHeader()}${renderContent()}${needsOnboarding ? '' : renderNav()}<div class="toast" role="status" aria-live="polite"></div>`;
}

function showToast(message) {
  const toast = document.querySelector('.toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2000);
}

function beginCategory(categoryId) {
  state.category = categoryId;
  state.answers = {};
  state.questionIndex = 0;
  state.currentChoice = null;
  state.refine = null;
  state.view = 'situation';
  render();
}

function saveProfile() {
  const profile = state.profile || { food: [], style: [], activity: [], budgetRange: '보통', activeTime: '저녁형' };
  const missing = TASTE_GROUPS.find((group) => (profile[group.id] || []).length < 3);
  if (missing) {
    showToast(`${missing.title}에서 세 가지 이상 골라주세요.`);
    return;
  }
  state.profile = profile;
  state.editingProfile = false;
  state.view = 'home';
  saveState();
  render();
  showToast('취향을 저장했어요. 이제 하루가 기억할게요.');
}

function confirmChoice() {
  const choice = state.candidates[state.candidateIndex];
  if (!choice) return;
  state.currentChoice = choice;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  state.currentRecordId = id;
  state.records.unshift({
    id,
    title: choice.title,
    emoji: choice.emoji,
    tags: choice.tags,
    category: state.category,
    categoryTitle: categoryInfo().title,
    createdAt: Date.now(),
    rating: null
  });
  saveState();
  state.view = 'done';
  render();
}

app.addEventListener('click', (event) => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const action = control.dataset.action;

  if (action === 'home') {
    state.view = 'home';
    state.editingProfile = false;
    render();
  } else if (action === 'nav') {
    const target = control.dataset.target;
    if (target === 'profile') {
      state.editingProfile = true;
      state.view = 'onboarding';
    } else {
      state.editingProfile = false;
      state.view = target;
    }
    render();
  } else if (action === 'start-category') {
    beginCategory(control.dataset.category);
  } else if (action === 'open-categories') {
    state.view = 'categories';
    render();
  } else if (action === 'toggle-taste') {
    const group = control.dataset.group;
    const value = control.dataset.value;
    const profile = state.profile || { food: [], style: [], activity: [], budgetRange: '보통', activeTime: '저녁형' };
    profile[group] = profile[group] || [];
    profile[group] = profile[group].includes(value) ? profile[group].filter((entry) => entry !== value) : [...profile[group], value];
    state.profile = profile;
    render();
  } else if (action === 'set-profile-value') {
    const profile = state.profile || { food: [], style: [], activity: [], budgetRange: '보통', activeTime: '저녁형' };
    profile[control.dataset.key] = control.dataset.value;
    state.profile = profile;
    render();
  } else if (action === 'save-profile') {
    saveProfile();
  } else if (action === 'situation-choice') {
    state.answers[control.dataset.key] = control.dataset.value;
    state.questionIndex += 1;
    if (state.questionIndex >= situationSteps().length) {
      state.recommendationSeed += 1;
      state.refine = null;
      buildRecommendations();
    }
    render();
  } else if (action === 'situation-back') {
    if (state.questionIndex === 0) state.view = 'home';
    else {
      state.questionIndex -= 1;
      const key = situationSteps()[state.questionIndex].key;
      delete state.answers[key];
    }
    render();
  } else if (action === 'candidate-select') {
    state.candidateIndex = Number(control.dataset.index) || 0;
    render();
  } else if (action === 'confirm-choice') {
    confirmChoice();
  } else if (action === 'open-refine') {
    state.currentChoice = state.candidates[state.candidateIndex];
    state.view = 'refine';
    render();
  } else if (action === 'refine') {
    state.refine = control.dataset.refine;
    state.recommendationSeed += 1;
    buildRecommendations();
    render();
    showToast('새로운 후보 세 개를 골라봤어요.');
  } else if (action === 'back-recommendations') {
    state.view = 'recommendations';
    render();
  } else if (action === 'go-feedback') {
    state.view = 'feedback';
    render();
  } else if (action === 'feedback') {
    const rating = control.dataset.rating;
    const record = state.records.find((entry) => entry.id === state.currentRecordId);
    if (record) record.rating = rating;
    saveState();
    state.view = 'home';
    render();
    showToast(rating === '좋았어요' ? '기억해둘게요. 다음 추천에 반영할게요!' : '알려주셔서 고마워요. 다음엔 더 잘 골라볼게요.');
  }
});

// 추천 카드는 모바일에서는 손가락으로 좌우 밀어 비교할 수 있어요.
let swipeStartX = null;
app.addEventListener('pointerdown', (event) => {
  if (event.target.closest('[data-swipe-card]')) swipeStartX = event.clientX;
});
app.addEventListener('pointerup', (event) => {
  if (swipeStartX === null || !event.target.closest('[data-swipe-card]')) return;
  const delta = event.clientX - swipeStartX;
  swipeStartX = null;
  if (Math.abs(delta) < 45 || !state.candidates.length) return;
  const direction = delta < 0 ? 1 : -1;
  state.candidateIndex = (state.candidateIndex + direction + state.candidates.length) % state.candidates.length;
  render();
});

render();
