import type { WeatherData, HourlyWeather, DailyForecast } from '@/lib/supabase';

// WMO Weather Interpretation Code → app weather data
const WMO_MAP: Record<number, { condition: string; desc_or: string; desc_en: string; icon: string }> = {
  0:  { condition: 'clear',        desc_or: 'ସ୍ୱଚ୍ଛ ଆକାଶ',          desc_en: 'Clear sky',           icon: '01d' },
  1:  { condition: 'clear',        desc_or: 'ଆଂଶିକ ସ୍ୱଚ୍ଛ',          desc_en: 'Mainly clear',        icon: '01d' },
  2:  { condition: 'clouds',       desc_or: 'ଆଂଶିକ ମେଘ',            desc_en: 'Partly cloudy',       icon: '02d' },
  3:  { condition: 'clouds',       desc_or: 'ଆଚ୍ଛାଦିତ ଆକାଶ',         desc_en: 'Overcast',            icon: '04d' },
  45: { condition: 'fog',          desc_or: 'କୁହୁଡ଼ି ଅଛି',             desc_en: 'Fog',                 icon: '50d' },
  48: { condition: 'fog',          desc_or: 'ତୁଷାର କୁହୁଡ଼ି',           desc_en: 'Icy fog',             icon: '50d' },
  51: { condition: 'drizzle',      desc_or: 'ହାଲୁକା ଝିଙ୍କି ବର୍ଷା',   desc_en: 'Light drizzle',       icon: '09d' },
  53: { condition: 'drizzle',      desc_or: 'ଝିଙ୍କି ବର୍ଷା',           desc_en: 'Drizzle',             icon: '09d' },
  55: { condition: 'drizzle',      desc_or: 'ଜୋରରେ ଝିଙ୍କି ବର୍ଷା',   desc_en: 'Heavy drizzle',       icon: '09d' },
  61: { condition: 'rain',         desc_or: 'ହାଲୁକା ବର୍ଷା',          desc_en: 'Light rain',          icon: '10d' },
  63: { condition: 'rain',         desc_or: 'ମଧ୍ୟମ ବର୍ଷା',            desc_en: 'Moderate rain',       icon: '10d' },
  65: { condition: 'rain',         desc_or: 'ଭାରି ବର୍ଷା',             desc_en: 'Heavy rain',          icon: '10d' },
  71: { condition: 'snow',         desc_or: 'ହାଲୁକା ତୁଷାର',           desc_en: 'Light snow',          icon: '13d' },
  73: { condition: 'snow',         desc_or: 'ତୁଷାରପାତ',              desc_en: 'Snow',                icon: '13d' },
  75: { condition: 'snow',         desc_or: 'ଭାରି ତୁଷାରପାତ',          desc_en: 'Heavy snow',          icon: '13d' },
  80: { condition: 'rain',         desc_or: 'ବର୍ଷା ଝାପ୍ଟ',            desc_en: 'Rain showers',        icon: '09d' },
  81: { condition: 'rain',         desc_or: 'ଭାରି ବର୍ଷା ଝାପ୍ଟ',       desc_en: 'Heavy showers',       icon: '09d' },
  82: { condition: 'rain',         desc_or: 'ଅତ୍ୟଧିକ ବର୍ଷା',          desc_en: 'Violent showers',     icon: '09d' },
  95: { condition: 'thunderstorm', desc_or: 'ଝଡ଼ ବଜ୍ର ବିଦ୍ୟୁତ',       desc_en: 'Thunderstorm',        icon: '11d' },
  96: { condition: 'thunderstorm', desc_or: 'ଶିଳାବୃଷ୍ଟି ସହ ବଜ୍ର',    desc_en: 'Thunderstorm + hail', icon: '11d' },
  99: { condition: 'thunderstorm', desc_or: 'ଭାରି ଶିଳାବୃଷ୍ଟି ବଜ୍ର',   desc_en: 'Thunderstorm + hail', icon: '11d' },
};

const ODIA_DAYS = ['ରବି', 'ସୋମ', 'ମଙ୍ଗଳ', 'ବୁଧ', 'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'];
const EN_DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function wmo(code: number) {
  return WMO_MAP[code] ?? { condition: 'clear', desc_or: 'ଆକାଶ', desc_en: 'Weather', icon: '01d' };
}

function advice(condition: string, temp: number): { or: string; en: string } {
  if (condition === 'thunderstorm') return { or: 'ଘରୁ ବାହାରନ୍ତୁ ନାହିଁ, ଝଡ଼ ଅଛି।',         en: 'Stay indoors, thunderstorm in area.' };
  if (condition === 'rain')         return { or: 'ଛତା ଧରି ବାହାରନ୍ତୁ।',                   en: 'Carry an umbrella today.' };
  if (condition === 'drizzle')      return { or: 'ଛୋଟ ଛତା ଯଥେଷ୍ଟ।',                      en: 'A light umbrella is enough.' };
  if (condition === 'fog')          return { or: 'ରାସ୍ତାରେ ସତର୍କ ରୁହ, କୁହୁଡ଼ି ଅଛି।',     en: 'Drive carefully, foggy conditions.' };
  if (temp >= 38)                   return { or: 'ପ୍ରଖର ଗ୍ରୀଷ୍ମ। ଛାଇରେ ରୁହ, ଜଳ ପିଅ।',   en: 'Very hot. Stay in shade and drink water.' };
  if (temp <= 12)                   return { or: 'ଶୀତ ଅଛି। ଗରମ ପୋଷାକ ପିନ୍ଧ।',            en: 'Cold weather. Wear warm clothes.' };
  if (condition === 'clouds')       return { or: 'ବର୍ଷା ହୋଇପାରେ, ଛତା ରଖ।',              en: 'May rain, keep umbrella handy.' };
  return { or: 'ଆଜି ଆବହାୱା ଭଲ ଅଛି।',                                                    en: 'Weather is pleasant today.' };
}

function agriTips(condition: string, temp: number, rain: number) {
  const tips: { tip_or: string; tip_en: string; icon: string }[] = [];
  if (condition === 'thunderstorm') {
    tips.push({ tip_or: 'ଝଡ଼ ବଜ୍ର ହେତୁ ଜମିକୁ ଯାଅ ନାହିଁ।', tip_en: 'Avoid going to fields during thunderstorm.', icon: '⚡' });
  } else if (rain > 70) {
    tips.push({ tip_or: 'ଚାଷ ଜମିରୁ ଜଳ ନିଷ୍କାସନ ବ୍ୟବସ୍ଥା କରନ୍ତୁ।', tip_en: 'Ensure proper drainage in fields today.', icon: '💧' });
  } else if (rain < 20 && temp > 32) {
    tips.push({ tip_or: 'ଫସଲକୁ ଜଳ ଦିଅ। ଆଜି ଖରା ଅଧିକ।', tip_en: 'Irrigate crops. High heat expected today.', icon: '🌾' });
  }
  if (condition === 'clear' && temp >= 26 && temp <= 36) {
    tips.push({ tip_or: 'ଅମଳ ଓ ଜମି କାମ ପାଇଁ ଅନୁକୂଳ ଦିନ।', tip_en: 'Good day for harvesting and field work.', icon: '☀️' });
  }
  if (tips.length === 0) {
    tips.push({ tip_or: 'ଆଜି ସ୍ୱାଭାବିକ କୃଷି କାର୍ଯ୍ୟ ଯୋଗ୍ୟ।', tip_en: 'Normal farming activities suitable today.', icon: '🌱' });
  }
  return tips.slice(0, 3);
}

export async function fetchWeatherFromOpenMeteo(
  lat: number,
  lon: number,
  districtId: number,
): Promise<WeatherData | null> {
  try {
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m' +
      '&hourly=temperature_2m,weather_code,precipitation_probability' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
      '&timezone=Asia%2FKolkata&forecast_days=7&wind_speed_unit=kmh';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let res: Response;
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return null;

    const d = await res.json();
    const cur = d.current as Record<string, number>;
    const today = new Date().toISOString().split('T')[0];

    const curWmo = wmo(cur.weather_code);
    const adv    = advice(curWmo.condition, cur.temperature_2m);

    // ── Hourly: today's 24 hours ──────────────────────────────────────────────
    const hTimes: string[]  = d.hourly.time;
    const hTemps: number[]  = d.hourly.temperature_2m;
    const hCodes: number[]  = d.hourly.weather_code;
    const hRain:  number[]  = d.hourly.precipitation_probability;

    const hourly: HourlyWeather[] = hTimes
      .map((t, i) => ({ t, temp: hTemps[i], code: hCodes[i], rain: hRain[i] }))
      .filter(({ t }) => t.startsWith(today))
      .map(({ t, temp, code }) => {
        const w = wmo(code);
        return { time: t.slice(11, 16), temp, icon: w.icon, condition: w.condition, desc_or: w.desc_or };
      });

    // Rain chance: current hour's value or today's daily max
    const nowHour  = new Date().getHours();
    const todayHourlyIdx = hTimes.findIndex(t => t.startsWith(today) && parseInt(t.slice(11, 13)) === nowHour);
    const rainChance = todayHourlyIdx >= 0 ? hRain[todayHourlyIdx] :
      (d.daily.precipitation_probability_max[0] ?? 0);

    // ── Daily 7-day forecast ──────────────────────────────────────────────────
    const dTimes: string[]  = d.daily.time;
    const dCodes: number[]  = d.daily.weather_code;
    const dHigh:  number[]  = d.daily.temperature_2m_max;
    const dLow:   number[]  = d.daily.temperature_2m_min;

    const forecast_7day: DailyForecast[] = dTimes.map((date, i) => {
      const dow = new Date(date).getDay();
      const w = wmo(dCodes[i]);
      return {
        date,
        day_or: ODIA_DAYS[dow],
        day_en: EN_DAYS[dow],
        icon: w.icon,
        temp_high: dHigh[i],
        temp_low:  dLow[i],
        condition: w.condition,
        desc_or:   w.desc_or,
      };
    });

    const todayIdx = dTimes.indexOf(today);

    return {
      district_id:    districtId,
      date:           today,
      temp_current:   Math.round(cur.temperature_2m),
      temp_high:      Math.round(todayIdx >= 0 ? dHigh[todayIdx] : cur.temperature_2m + 3),
      temp_low:       Math.round(todayIdx >= 0 ? dLow[todayIdx]  : cur.temperature_2m - 4),
      feels_like:     Math.round(cur.apparent_temperature),
      humidity:       Math.round(cur.relative_humidity_2m),
      wind_speed:     Math.round(cur.wind_speed_10m),
      rain_chance:    Math.round(rainChance),
      condition:      curWmo.condition,
      icon_code:      curWmo.icon,
      description_or: curWmo.desc_or,
      description_en: curWmo.desc_en,
      advice_or:      adv.or,
      advice_en:      adv.en,
      hourly,
      forecast_7day,
      agri_tips: agriTips(curWmo.condition, cur.temperature_2m, rainChance),
    };
  } catch {
    return null;
  }
}
