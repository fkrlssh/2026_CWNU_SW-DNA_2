// ④ 카테고리: 뭐 먹지 / 뭐 입지 / 뭐 하지, 세로로 큰 카드 3개
import { CATEGORIES } from '../data.js';
import { choiceCard } from '../components.js';

export function renderCategories() {
  return {
    main: `<p class="eyebrow">오늘의 결정</p>
      <h1 tabindex="-1">어떤 걸 도와드릴까요?</h1>
      <p class="lead">지금 가장 고민되는 것 하나만 골라주세요.</p>
      <div class="category-list">${CATEGORIES.map((category) => choiceCard({
        emoji: category.emoji, title: category.title, desc: category.subtitle,
        action: 'start-category', data: { category: category.id }, size: 'big', tone: category.color
      })).join('')}</div>`
  };
}
