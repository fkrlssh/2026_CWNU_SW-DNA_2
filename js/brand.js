const ICONS = {
  default: `./icon_images/${encodeURIComponent('하루 구름 하늘 아이콘.png')}`,
  halloween: `./icon_images/${encodeURIComponent('호박과 구름으로 만든 하루 아이콘.png')}`,
};

export function isHalloweenSeason(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric',
  }).formatToParts(date).map(({ type, value }) => [type, value]));
  return Number(parts.month) === 10 && [30, 31].includes(Number(parts.day));
}

export const brandIcon = isHalloweenSeason() ? ICONS.halloween : ICONS.default;

export function applyBrandIcon() {
  document.querySelector('link[rel~="icon"]')?.setAttribute('href', brandIcon);
}
