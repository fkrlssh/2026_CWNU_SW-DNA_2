const weatherLabels = new Map([
  [0, ['clear', '맑음']], [1, ['clear', '대체로 맑음']], [2, ['cloudy', '구름 조금']], [3, ['cloudy', '흐림']],
  [45, ['fog', '안개']], [48, ['fog', '짙은 안개']], [51, ['rain', '약한 이슬비']], [53, ['rain', '이슬비']],
  [55, ['rain', '강한 이슬비']], [61, ['rain', '약한 비']], [63, ['rain', '비']], [65, ['rain', '강한 비']],
  [71, ['snow', '약한 눈']], [73, ['snow', '눈']], [75, ['snow', '강한 눈']], [80, ['rain', '소나기']],
  [81, ['rain', '소나기']], [82, ['rain', '강한 소나기']], [95, ['storm', '뇌우']]
]);

export function getTimeSlot(date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', hour12: false, timeZone: process.env.HARU_TIMEZONE || 'Asia/Seoul'
  }).format(date));
  if (hour < 6) return 'night';
  if (hour < 11) return 'morning';
  if (hour < 15) return 'lunch';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
}

export async function fetchContext() {
  const latitude = Number(process.env.HARU_LATITUDE || 35.2279);
  const longitude = Number(process.env.HARU_LONGITUDE || 128.6811);
  const timezone = process.env.HARU_TIMEZONE || 'Asia/Seoul';
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: String(latitude), longitude: String(longitude),
    current: 'temperature_2m,apparent_temperature,precipitation,weather_code', timezone
  }).toString();

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);
    const body = await response.json();
    const [weather, label] = weatherLabels.get(body.current.weather_code) || ['unknown', '알 수 없음'];
    return {
      weather, label, temperature: body.current.temperature_2m,
      apparentTemperature: body.current.apparent_temperature,
      precipitation: body.current.precipitation, timeSlot: getTimeSlot(), source: 'open-meteo'
    };
  } catch (error) {
    console.warn('날씨 API 폴백:', error.message);
    return { weather: 'unknown', label: '날씨 정보 없음', temperature: null, apparentTemperature: null, precipitation: null, timeSlot: getTimeSlot(), source: 'fallback' };
  }
}
