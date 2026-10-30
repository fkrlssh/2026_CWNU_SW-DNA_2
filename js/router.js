// 화면 이동과 그리기를 담당해요.
// go('home')처럼 부르면 상태를 바꾸고, SCREENS의 그리기 함수로 화면을 다시 그려요.
import { state } from './state.js';
import { SCREENS } from './screens/index.js';
import { escapeHtml, tabBar } from './components.js';
import { brandIcon } from './brand.js';

const app = document.querySelector('#app');

// 하단 탭바가 보이는 화면들 (결정 흐름 중에는 탭바를 숨겨서 집중하게 해요)
const TAB_VIEWS = ['home', 'categories', 'history', 'profile'];

let lastScreenKey = null;
let navDirection = 'forward';
const enterHooks = {};
const leaveHooks = {};
const afterRenderHooks = [];

// 화면에 들어갈 때/나갈 때/그린 뒤에 실행할 일을 등록해요. (데이터 불러오기 등은 app.js에서 등록)
export function onEnter(view, fn) { enterHooks[view] = fn; }
export function onLeave(view, fn) { leaveHooks[view] = fn; }
export function afterRender(fn) { afterRenderHooks.push(fn); }

// 같은 화면 안에서 단계가 바뀔 때도 슬라이드되도록 화면 키에 단계 번호를 붙여요.
function screenKey() {
  if (state.view === 'onboarding') return `onboarding-${state.onboard.step}`;
  if (state.view === 'situation') return `situation-${state.questionIndex}`;
  if (state.view === 'quiz') return `quiz-${state.quiz.status}-${state.quiz.index}`;
  return state.view;
}

// 다음 render()가 뒤로 가는 방향(왼쪽에서 슬라이드)인지 정해요.
export function setDirection(direction) { navDirection = direction; }

export function go(view, { back = false } = {}) {
  if (state.view !== view) leaveHooks[state.view]?.();
  state.view = view;
  navDirection = back ? 'back' : 'forward';
  render();
  enterHooks[view]?.();
}

function header({ back, title }) {
  if (back) {
    return `<header class="topbar"><button type="button" class="back-button" data-action="${back.action}" aria-label="${escapeHtml(back.label)}">‹</button><span class="topbar-title">${escapeHtml(title || '')}</span><span class="topbar-spacer"></span></header>`;
  }
  return `<header class="topbar site-header">
    <button type="button" class="brand brand-home" data-action="tab" data-target="home" aria-label="하루 홈으로"><img src="${brandIcon}" alt="" />하루</button>
    <nav class="desktop-nav" aria-label="주요 메뉴">
      <button type="button" data-action="tab" data-target="home">오늘의 선택</button>
      <button type="button" data-action="tab" data-target="history">나의 기록</button>
      <button type="button" data-action="tab" data-target="profile">내 취향</button>
    </nav>
    <button type="button" class="header-chat" data-action="open-chat">하루에게 물어보기 <span aria-hidden="true">↗</span></button>
  </header>`;
}

export function render() {
  const draw = SCREENS[state.view] || SCREENS.home;
  const { main, cta = '', back = null, title = '' } = draw();
  const key = screenKey();
  const entering = key !== lastScreenKey;
  const showTabs = TAB_VIEWS.includes(state.view);
  const activeTab = state.view === 'categories' ? 'home' : state.view;

  app.className = `app-shell${showTabs ? ' has-tabs' : ''}${cta ? ' has-cta' : ''}`;
  app.dataset.view = state.view;
  const enterClass = entering ? (navDirection === 'back' ? ' enter-back' : ' enter') : '';
  // 하단 고정 버튼(cta)은 .screen 바깥에 둬야 슬라이드 애니메이션 중에도 제자리에 있어요.
  app.innerHTML = `${header({ back, title })}<main class="screen${enterClass}">${main}</main>${cta}${showTabs ? tabBar(activeTab) : ''}`;

  if (entering) {
    window.scrollTo(0, 0);
    app.querySelector('h1')?.focus({ preventScroll: true });
  }
  lastScreenKey = key;
  for (const fn of afterRenderHooks) fn();
}
