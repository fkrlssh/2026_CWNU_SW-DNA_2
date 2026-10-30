// 하루 — 앱 시작점이에요.
// 구조: state(지금 상태) → screens/(화면 그리기) → 이 파일의 actions(버튼 누르면 할 일) → router(다시 그리기)
import { CONFIG } from './js/config.js';
import { api } from './js/api.js';
import { ONBOARDING_STEPS } from './js/data.js';
import { state, ANALYSIS_MESSAGES, activeQuestions, filledContext, emptyProfile } from './js/state.js';
import { go, render, onEnter, onLeave, afterRender, setDirection } from './js/router.js';
import { showToast, showModal, setupModal } from './js/components.js';
import { isStepValid } from './js/screens/onboarding.js';
import { applyBrandIcon } from './js/brand.js';

const app = document.querySelector('#app');
applyBrandIcon();

/* ───────────── 데이터 불러오기 ───────────── */

async function boot() {
  state.bootStatus = 'loading';
  render();
  try {
    const { profile, persona } = await api.getProfile();
    state.profile = profile;
    state.persona = persona;
    if (profile) go('home');
    else startOnboarding();
  } catch {
    state.bootStatus = 'error';
    render();
  }
}

// 처음 불러올 때는 이미 스켈레톤이 그려져 있으니 다시 그리지 않아요. (진입 애니메이션이 끊기지 않게)
// 에러 후 '다시 시도'일 때만 스켈레톤으로 바꿔 그려요.
async function loadContext() {
  const retrying = state.context.status === 'error';
  state.context.status = 'loading';
  if (retrying) render();
  try {
    const { weather, isMock } = await api.getContext();
    state.context = { status: 'ready', weather, isMock: Boolean(isMock) };
  } catch {
    state.context.status = 'error';
  }
  if (state.view === 'home') render();
}

async function loadHistory() {
  const retrying = state.history.status === 'error';
  state.history.status = 'loading';
  if (retrying) render();
  try {
    const { records } = await api.getHistory();
    state.history = { status: records.length ? 'ready' : 'empty', records };
  } catch {
    state.history.status = 'error';
  }
  if (state.view === 'history') render();
}

// 홈에 들어올 때 날씨를, 기록에 들어올 때 기록을 불러와요.
onEnter('home', () => { if (state.context.status !== 'ready') loadContext(); });
onEnter('history', loadHistory);

// 오래된 응답이 새 응답을 덮어쓰지 않도록 요청 번호를 매겨요.
let recRequestId = 0;
const placePreviewRequests = new WeakMap();
async function fetchRecommendations(refine = null) {
  const previous = state.rec.items;
  const baseItem = previous[state.rec.index] || null;
  const requestId = ++recRequestId;
  state.rec = { status: 'loading', items: [], index: 0, refine };
  if (state.view !== 'recommendations') go('recommendations');
  else render();
  try {
    const { items } = await api.recommend({
      category: state.category,
      context: filledContext(),
      refine,
      excludeIds: previous.map((item) => item.id),
      baseItem
    });
    if (requestId !== recRequestId) return;
    state.rec.items = items;
    state.rec.status = items.length ? 'ready' : 'empty';
    state.rec.fresh = true; // 새 카드가 하나씩 떠오르는 애니메이션용
  } catch {
    if (requestId !== recRequestId) return;
    state.rec.status = 'error';
  }
  if (state.view === 'recommendations') render();
}

/* ───────────── 온보딩 ───────────── */

function startOnboarding() {
  state.onboard = { step: 0, draft: emptyProfile(), editing: false, lastToggled: null };
  go('onboarding');
}

async function finishOnboarding() {
  const profile = state.onboard.draft;
  try {
    await api.saveProfile(profile);
  } catch {
    showToast('잠깐 문제가 생겼어요. 다시 눌러주세요.');
    return;
  }
  state.profile = profile;
  if (state.onboard.editing) {
    go('profile', { back: true });
    showToast('저장했어요. 다음 추천부터 반영할게요.');
  } else {
    startAnalysis('home');
  }
}

function addAvoidFromInput() {
  const input = app.querySelector('#avoid-input');
  const words = (input?.value || '').split(',').map((word) => word.trim()).filter(Boolean);
  if (!words.length) return;
  const draft = state.onboard.draft;
  for (const word of words) if (!draft.avoid.includes(word)) draft.avoid.push(word);
  render();
  app.querySelector('#avoid-input')?.focus();
}

/* ───────────── 취향 분석 중 ───────────── */

let analysisTimer = null;
let analysisRunId = 0;
onLeave('analyzing', () => clearInterval(analysisTimer));

async function startAnalysis(returnTo) {
  const runId = ++analysisRunId;
  state.analysis = { status: 'running', returnTo, messageIndex: 0 };
  go('analyzing');

  // 몇 초마다 문구만 바꿔요. (화면 전체를 다시 그리지 않아요)
  clearInterval(analysisTimer);
  analysisTimer = setInterval(() => {
    state.analysis.messageIndex = Math.min(state.analysis.messageIndex + 1, ANALYSIS_MESSAGES.length - 1);
    const messageEl = document.querySelector('#analysis-msg');
    if (messageEl) messageEl.textContent = ANALYSIS_MESSAGES[state.analysis.messageIndex];
  }, 2000);

  // 정해진 시간(기본 60초)이 지나면 실패로 보고 기본 추천으로 넘어가요.
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), CONFIG.ANALYSIS_TIMEOUT_MS));
  try {
    const { persona } = await Promise.race([api.analyzeTaste(state.profile), timeout]);
    if (runId !== analysisRunId || state.view !== 'analyzing') return;
    state.persona = persona || state.persona;
    go(returnTo);
    showToast('취향 분석이 끝났어요. 이제 하루가 기억할게요.');
  } catch {
    if (runId !== analysisRunId || state.view !== 'analyzing') return;
    clearInterval(analysisTimer);
    state.analysis.status = 'failed';
    render();
  }
}

/* ───────────── 추천 카드 넘기기 ───────────── */

// 카드를 넘기면 아래 점 표시만 바꿔요. (다시 그리면 스크롤 위치가 초기화되니까요)
function setupCarousel() {
  const track = app.querySelector('.rec-track');
  if (!track) return;
  const cards = [...track.querySelectorAll('.rec-card')];
  const centerOf = (card) => card.offsetLeft + card.clientWidth / 2;
  const target = cards[state.rec.index];
  if (target) track.scrollLeft = centerOf(target) - track.clientWidth / 2;

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const center = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      cards.forEach((card, i) => {
        if (Math.abs(centerOf(card) - center) < Math.abs(centerOf(cards[nearest]) - center)) nearest = i;
      });
      if (nearest !== state.rec.index) setActiveCard(nearest);
    });
  }, { passive: true });
}

function scrollToCard(index) {
  const track = app.querySelector('.rec-track');
  const card = track?.querySelectorAll('.rec-card')[index];
  if (!card) return;
  setActiveCard(index);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  track.scrollTo({ left: card.offsetLeft + card.clientWidth / 2 - track.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
}

// 점을 누르거나 카드를 넘기면 선택 번호와 점 표시를 같이 바꿔요.
function setActiveCard(index) {
  state.rec.index = index;
  app.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
    dot.setAttribute('aria-selected', String(i === index));
  });
}

afterRender(() => {
  if (state.view === 'recommendations' && state.rec.status === 'ready') setupCarousel();
  if (state.view === 'decision') setupPlacePreviews();
  state.rec.fresh = false;

  // 방금 누른 칩만 살짝 커졌다 돌아오게 해요.
  if (state.onboard.lastToggled) {
    const { action, value } = state.onboard.lastToggled;
    app.querySelector(`[data-action="${action}"][data-value="${CSS.escape(value)}"]`)?.classList.add('pop');
    state.onboard.lastToggled = null;
  }
});

function updatePlacePanel(target, stateName, buildContent) {
  target.dataset.placeState = stateName;
  const panel = target.querySelector('.place-preview-panel');
  if (!panel) return;
  panel.replaceChildren();
  buildContent(panel);
}

function placeMessage(panel, text) {
  const message = document.createElement('p');
  message.className = 'place-preview-message';
  message.textContent = text;
  panel.append(message);
}

function renderPlaceResults(panel, result) {
  const title = document.createElement('strong');
  title.textContent = `${result.center?.label || '주변'} 추천 장소`;
  panel.append(title);
  const list = document.createElement('ul');
  for (const place of result.places) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.textContent = place.name;
    link.href = place.mapUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const meta = document.createElement('span');
    meta.textContent = `${place.address}${place.distanceM === null || place.distanceM === undefined ? '' : ` · ${place.distanceM}m`}`;
    item.append(link, meta);
    list.append(item);
  }
  panel.append(list);
}

async function loadPlacePreview(target) {
  if (target.dataset.placeState === 'loading' || target.dataset.placeState === 'ready' || placePreviewRequests.has(target)) return;
  const { category, itemId } = target.dataset;
  if (!category || !itemId || !api.getPlaces) return;
  updatePlacePanel(target, 'loading', (panel) => placeMessage(panel, '주변 장소를 찾는 중이에요…'));
  const request = api.getPlaces({ category, itemId });
  placePreviewRequests.set(target, request);
  try {
    const result = await request;
    if (!target.isConnected) return;
    if (result.places?.length) {
      updatePlacePanel(target, 'ready', (panel) => renderPlaceResults(panel, result));
      return;
    }
    const message = result.source === 'none'
      ? '집에서 즐기는 추천이라 주변 장소가 없어요.'
      : result.source === 'unavailable'
        ? '카카오 장소 검색 키를 설정하면 주변 장소를 보여드려요.'
        : '주변에서 맞는 장소를 찾지 못했어요.';
    updatePlacePanel(target, 'empty', (panel) => placeMessage(panel, message));
  } catch {
    if (target.isConnected) updatePlacePanel(target, 'error', (panel) => placeMessage(panel, '장소를 불러오지 못했어요. 다시 올려 보세요.'));
  } finally {
    placePreviewRequests.delete(target);
  }
}

function setupPlacePreviews() {
  app.querySelectorAll('[data-place-preview]').forEach((target) => {
    target.addEventListener('pointerenter', () => loadPlacePreview(target));
    target.addEventListener('focus', () => loadPlacePreview(target));
  });
}

/* ───────────── 결정 + 피드백 ───────────── */

async function confirmChoice() {
  const item = state.rec.items[state.rec.index];
  if (!item) return;
  state.decision = { item, id: null, status: 'saving', feedback: 'idle', rating: null };
  go('decision');
  await saveDecision();
}

async function saveDecision() {
  const retrying = state.decision.status === 'error';
  state.decision.status = 'saving';
  if (retrying) render();
  try {
    const { decisionId } = await api.saveDecision({ category: state.category, item: state.decision.item, context: filledContext() });
    state.decision.id = decisionId;
    state.decision.status = 'saved';
    // 성공하면 만족도 버튼만 풀어줘요. 화면 전체를 다시 그리면 축하 애니메이션이 끊겨요.
    if (state.view === 'decision' && !retrying) {
      app.querySelectorAll('.feedback-button').forEach((button) => { button.disabled = false; });
      return;
    }
  } catch {
    state.decision.status = 'error';
  }
  if (state.view === 'decision') render();
}

/* ───────────── 챗봇 ───────────── */

async function sendChat(text) {
  const content = text.trim();
  if (!content || state.chat.status === 'sending') return;
  const { messages } = state.chat;
  messages.push({ role: 'user', content });
  const reply = { role: 'assistant', content: '', pending: true, recommendations: [] };
  messages.push(reply);
  state.chat.status = 'sending';
  render();

  // 서버에는 내용이 있는 대화만 최근 20개까지 보내요.
  const history = messages
    .filter((message) => !message.pending && !message.error && message.content.trim())
    .slice(-20)
    .map(({ role, content: body }) => ({ role, content: body }));
  try {
    const result = await api.chat({
      messages: history,
      context: { weather: state.context.weather?.code },
      // 답변이 흘러들어오는 동안에는 말풍선 글자만 바꿔요.
      onDelta: (delta) => {
        reply.content += delta;
        const bubbleEl = document.querySelector('#chat-streaming');
        if (bubbleEl) bubbleEl.textContent = reply.content;
        scrollChatToBottom();
      }
    });
    Object.assign(reply, { content: result.reply, recommendations: result.recommendations, degraded: result.degraded, pending: false });
  } catch {
    Object.assign(reply, { content: '잠깐 문제가 생겼어요. 다시 보내 주세요.', pending: false, error: true });
  }
  state.chat.status = 'idle';
  if (state.view === 'chat') {
    render();
    app.querySelector('#chat-input')?.focus();
  }
}

function scrollChatToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

afterRender(() => {
  if (state.view === 'chat' && state.chat.messages.length) scrollChatToBottom();
});

/* ───────────── 버튼별 할 일 ───────────── */

function toggleIn(list, value) {
  return list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];
}

function beginCategory(categoryId) {
  state.category = categoryId;
  state.answers = {};
  state.questionIndex = 0;
  state.rec = { status: 'idle', items: [], index: 0, refine: null };
  go('situation');
}

const actions = {
  'boot-retry': () => boot(),

  // 온보딩
  'toggle-taste': (el) => {
    const { group, value } = el.dataset;
    state.onboard.draft[group] = toggleIn(state.onboard.draft[group] || [], value);
    state.onboard.lastToggled = { action: 'toggle-taste', value };
    render();
  },
  'set-basic': (el) => {
    state.onboard.draft[el.dataset.key] = el.dataset.value;
    render();
  },
  'toggle-avoid': (el) => {
    state.onboard.draft.avoid = toggleIn(state.onboard.draft.avoid || [], el.dataset.value);
    state.onboard.lastToggled = { action: 'toggle-avoid', value: el.dataset.value };
    render();
  },
  'add-avoid': () => addAvoidFromInput(),
  'avoid-none': () => {
    state.onboard.draft.avoid = [];
    finishOnboarding();
  },
  'onboard-next': () => {
    const { step, draft, editing } = state.onboard;
    if (!isStepValid(ONBOARDING_STEPS[step], draft)) return;
    if (editing || step === ONBOARDING_STEPS.length - 1) return finishOnboarding();
    state.onboard.step += 1;
    setDirection('forward');
    render();
  },
  'onboard-back': () => {
    state.onboard.step = Math.max(0, state.onboard.step - 1);
    setDirection('back');
    render();
  },
  'onboard-cancel': () => go('profile', { back: true }),
  'start-onboarding': () => startOnboarding(),
  'analysis-skip': () => go(state.analysis.returnTo),

  // 홈·카테고리
  'context-retry': () => loadContext(),
  'start-category': (el) => beginCategory(el.dataset.category),
  'go-categories': () => go('categories'),
  tab: (el) => go(el.dataset.target, { back: true }),

  // 상황 입력
  'situation-choice': (el) => {
    state.answers[el.dataset.key] = el.dataset.value;
    if (state.questionIndex >= activeQuestions().length - 1) return fetchRecommendations();
    state.questionIndex += 1;
    setDirection('forward');
    render();
  },
  'situation-skip': () => fetchRecommendations(),
  'situation-back': () => {
    if (state.questionIndex === 0) return go('home', { back: true });
    state.questionIndex -= 1;
    delete state.answers[activeQuestions()[state.questionIndex].key];
    setDirection('back');
    render();
  },

  // 추천·리파인
  'rec-dot': (el) => scrollToCard(Number(el.dataset.index)),
  'rec-retry': () => fetchRecommendations(state.rec.refine),
  'rec-back': () => {
    state.questionIndex = 0;
    state.answers = {};
    go('situation', { back: true });
  },
  'restart-situation': () => beginCategory(state.category),
  refine: (el) => fetchRecommendations(el.dataset.refine),
  'confirm-choice': () => confirmChoice(),

  // 결정·피드백
  'decision-retry': () => saveDecision(),
  feedback: async (el) => {
    const rating = el.dataset.rating;
    state.decision.feedback = 'sending';
    render();
    try {
      await api.saveFeedback(state.decision.id, rating);
      state.decision.feedback = 'done';
      state.decision.rating = rating;
      render();
      showToast('다음 추천에 반영할게요');
    } catch {
      state.decision.feedback = 'idle';
      render();
      showToast('잠깐 문제가 생겼어요. 다시 눌러주세요.');
    }
  },

  // 기록
  'history-retry': () => loadHistory(),
  'rate-record': async (el) => {
    const { id, rating } = el.dataset;
    try {
      await api.saveFeedback(id, rating);
      const record = state.history.records.find((entry) => entry.id === id);
      if (record) record.rating = rating;
      render();
      showToast('다음 추천에 반영할게요');
    } catch {
      showToast('잠깐 문제가 생겼어요. 다시 눌러주세요.');
    }
  },

  // 챗봇
  'open-chat': () => {
    go('chat');
    if (state.context.status !== 'ready') loadContext();
  },
  'chat-back': () => go('home', { back: true }),
  'chat-suggest': (el) => sendChat(el.dataset.value),
  'chat-send': () => {
    const input = app.querySelector('#chat-input');
    const text = input?.value || '';
    if (input) input.value = '';
    sendChat(text);
  },
  // 챗봇이 추천한 카드로 바로 결정해요. (결정·피드백 흐름은 추천 화면과 같아요)
  'chat-pick': (el) => {
    const item = state.chat.messages[Number(el.dataset.msg)]?.recommendations?.[Number(el.dataset.item)];
    if (!item) return;
    state.category = item.category || 'eat';
    state.answers = {};
    state.rec = { status: 'ready', items: [item], index: 0, refine: null };
    confirmChoice();
  },

  // 내 취향
  'edit-step': (el) => {
    state.onboard = { step: Number(el.dataset.step), draft: structuredClone({ ...emptyProfile(), ...state.profile }), editing: true, lastToggled: null };
    go('onboarding');
  },
  reanalyze: () => showModal({
    title: '취향 다시 분석하기',
    text: '다시 분석하면 시간이 조금 걸려요. 진행할까요?',
    confirmLabel: '진행할게요',
    onConfirm: () => startAnalysis('profile')
  }),
  'reset-all': () => showModal({
    title: '처음부터 다시 시작할까요?',
    text: '고른 취향과 결정 기록이 모두 지워져요.',
    confirmLabel: '모두 지우기',
    danger: true,
    onConfirm: async () => {
      await api.resetAll();
      state.profile = null;
      state.persona = null;
      state.history = { status: 'idle', records: [] };
      startOnboarding();
    }
  })
};

app.addEventListener('click', (event) => {
  const control = event.target.closest('[data-action]');
  if (!control || control.disabled) return;
  actions[control.dataset.action]?.(control);
});

// 알레르기 입력 칸·챗봇 입력 칸에서 엔터를 누르면 바로 추가/전송돼요.
app.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.target.id === 'chat-input' && !event.isComposing) {
    event.preventDefault();
    actions['chat-send']();
    return;
  }
  if (event.key === 'Enter' && event.target.id === 'avoid-input' && !event.isComposing) {
    event.preventDefault();
    addAvoidFromInput();
  }
});

setupModal();
boot();
