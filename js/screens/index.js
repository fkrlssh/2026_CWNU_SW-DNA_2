// 화면 이름 → 그리기 함수 목록. 새 화면을 만들면 여기에 한 줄 추가하면 돼요.
// 각 함수는 { main, cta?, back?, title? }를 돌려줘요.
import { state } from '../state.js';
import { loadingState, errorState } from '../components.js';
import { renderOnboarding } from './onboarding.js';
import { renderAnalyzing } from './analyzing.js';
import { renderHome } from './home.js';
import { renderCategories } from './categories.js';
import { renderSituation } from './situation.js';
import { renderRecommendations } from './recommendations.js';
import { renderDecision } from './decision.js';
import { renderHistory } from './history.js';
import { renderProfile } from './profile.js';
import { renderChat } from './chat.js';
import { renderPreferenceQuiz, renderPreferenceQuizResult } from './quiz.js';

// 앱을 처음 열 때 저장된 취향을 불러오는 화면
function renderBoot() {
  if (state.bootStatus === 'error') return { main: errorState({ action: 'boot-retry' }) };
  return { main: loadingState('하루를 준비하고 있어요…') };
}

export const SCREENS = {
  boot: renderBoot,
  onboarding: renderOnboarding,
  analyzing: renderAnalyzing,
  home: renderHome,
  categories: renderCategories,
  situation: renderSituation,
  recommendations: renderRecommendations,
  decision: renderDecision,
  history: renderHistory,
  profile: renderProfile,
  chat: renderChat,
  quiz: renderPreferenceQuiz,
  'quiz-result': renderPreferenceQuizResult
};
