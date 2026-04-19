// Supabase Edge Function — fetch-weather
// Runs daily via Supabase cron scheduler
// Fetches Open-Meteo data for all 30 Odisha districts → upserts into weather table
// Free, no API key needed.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Districts ───────────────────────────────────────────────────────────────
const DISTRICTS = [
  { id: 1,  lat: 20.8408, lon: 85.1018 },
  { id: 2,  lat: 20.7160, lon: 83.4866 },
  { id: 3,  lat: 21.4942, lon: 86.9336 },
  { id: 4,  lat: 21.3360, lon: 83.6191 },
  { id: 5,  lat: 21.0544, lon: 86.5108 },
  { id: 6,  lat: 20.8449, lon: 84.3240 },
  { id: 7,  lat: 20.4625, lon: 85.8830 },
  { id: 8,  lat: 21.5353, lon: 84.7377 },
  { id: 9,  lat: 20.6507, lon: 85.5977 },
  { id: 10, lat: 19.3254, lon: 84.1017 },
  { id: 11, lat: 19.3921, lon: 84.9887 },
  { id: 12, lat: 20.2573, lon: 86.1707 },
  { id: 13, lat: 20.8386, lon: 86.3313 },
  { id: 14, lat: 21.8550, lon: 84.0063 },
  { id: 15, lat: 19.9068, lon: 83.1672 },
  { id: 16, lat: 20.4671, lon: 84.2299 },
  { id: 17, lat: 20.5019, lon: 86.4240 },
  { id: 18, lat: 21.6290, lon: 85.5811 },
  { id: 19, lat: 20.1833, lon: 85.8000 },
  { id: 20, lat: 18.8135, lon: 82.7126 },
  { id: 21, lat: 18.3512, lon: 81.8995 },
  { id: 22, lat: 21.9358, lon: 86.7390 },
  { id: 23, lat: 19.2295, lon: 82.5466 },
  { id: 24, lat: 20.1283, lon: 85.0956 },
  { id: 25, lat: 20.8083, lon: 82.5395 },
  { id: 26, lat: 19.8134, lon: 85.8312 },
  { id: 27, lat: 19.1700, lon: 83.4160 },
  { id: 28, lat: 21.4669, lon: 83.9812 },
  { id: 29, lat: 20.8308, lon: 83.9113 },
  { id: 30, lat: 22.1174, lon: 84.0302 },
];

// ─── WMO code → OWM-style condition + icon ───────────────────────────────────
function wmoToCondition(code: number, isDay: boolean): { condition: string; icon: string } {
  const d = isDay ? 'd' : 'n';
  if (code === 0 || code === 1)  return { condition: 'Clear',        icon: `01${d}` };
  if (code === 2)                return { condition: 'Clouds',        icon: `02${d}` };
  if (code === 3)                return { condition: 'Clouds',        icon: `04${d}` };
  if (code === 45 || code === 48)return { condition: 'Mist',          icon: `50${d}` };
  if (code >= 51 && code <= 55)  return { condition: 'Drizzle',       icon: `09${d}` };
  if (code >= 61 && code <= 65)  return { condition: 'Rain',          icon: `10${d}` };
  if (code >= 71 && code <= 77)  return { condition: 'Snow',          icon: `13${d}` };
  if (code >= 80 && code <= 82)  return { condition: 'Rain',          icon: `10${d}` };
  if (code >= 95)                return { condition: 'Thunderstorm',  icon: `11${d}` };
  return { condition: 'Clear', icon: `01${d}` };
}

// ─── Odia weather phrases ────────────────────────────────────────────────────
function getPhrase(condition: string, temp: number): {
  description_or: string; description_en: string;
  advice_or: string;      advice_en: string;
} {
  const c = condition.toLowerCase();
  if (c === 'thunderstorm') return {
    description_or: 'ବଜ୍ର ସହ ବର୍ଷା!', description_en: 'Thunderstorm!',
    advice_or: 'ଘରେ ରୁହନ୍ତୁ, ଗଛ ତଳେ ଯାଆନ୍ତୁ ନାଁ।', advice_en: 'Stay indoors, avoid trees.',
  };
  if (c === 'rain') return {
    description_or: temp > 30 ? 'ଗରମ ସହ ବର୍ଷା ହେଉଛି!' : 'ବର୍ଷା ହେଉଛି!',
    description_en: temp > 30 ? 'Hot and rainy!' : "It's raining!",
    advice_or: 'ଛତା ନିଅନ୍ତୁ।', advice_en: 'Take an umbrella.',
  };
  if (c === 'drizzle') return {
    description_or: 'ହାଲୁକା ବର୍ଷା ହେଉଛି।', description_en: 'Light drizzle.',
    advice_or: 'ଛୋଟ ଛତା ଯଥେଷ୍ଟ।', advice_en: 'A light umbrella is enough.',
  };
  if (c === 'snow') return {
    description_or: 'ତୁଷାରପାତ ହେଉଛି!', description_en: 'Snowfall!',
    advice_or: 'ଗରମ କପଡ଼ା ପିନ୍ଧନ୍ତୁ।', advice_en: 'Wear warm clothes.',
  };
  if (c === 'mist' || c === 'fog' || c === 'haze') return {
    description_or: 'କୁହୁଡ଼ି ପଡ଼ିଛି।', description_en: 'Foggy / misty.',
    advice_or: 'ଯାନ ଚାଳନା ସାବଧାନ ଭାବେ କରନ୍ତୁ।', advice_en: 'Drive carefully.',
  };
  if (c === 'clouds') return {
    description_or: 'ମେଘୁଆ ଆକାଶ।', description_en: 'Cloudy sky.',
    advice_or: 'ବର୍ଷା ହୋଇପାରେ, ଛତା ସାଥରେ ରଖନ୍ତୁ।', advice_en: 'May rain, keep umbrella handy.',
  };
  // Clear — temperature based
  if (temp >= 40) return {
    description_or: 'ଅତ୍ୟଧିକ ଗରମ! ଲୁ ଲାଗୁଛି।', description_en: 'Extreme heat! Heat wave.',
    advice_or: 'ଘରୁ ବାହାରନ୍ତୁ ନାଁ, ପ୍ରଚୁର ପାଣି ପିଅନ୍ତୁ।', advice_en: 'Avoid going out, drink plenty of water.',
  };
  if (temp >= 35) return {
    description_or: 'ବହୁତ ଗରମ ଲାଗୁଛି!', description_en: "It's very hot!",
    advice_or: 'ଛାଇରେ ରୁହନ୍ତୁ, ପ୍ରଚୁର ପାଣି ପିଅନ୍ତୁ।', advice_en: 'Stay in shade, drink water.',
  };
  if (temp >= 28) return {
    description_or: 'ଗରମ ଲାଗୁଛି।', description_en: 'Warm and sunny.',
    advice_or: 'ବାହାରକୁ ଯିବା ବେଳେ ପାଣି ନିଅନ୍ତୁ।', advice_en: 'Carry water when going out.',
  };
  if (temp >= 20) return {
    description_or: 'ବହୁତ ଭଲ ପାଣିପାଗ!', description_en: 'Beautiful weather!',
    advice_or: 'ବାହାରକୁ ଯାଇ ଆନନ୍ଦ ନିଅନ୍ତୁ।', advice_en: 'Great day to go outside.',
  };
  if (temp >= 12) return {
    description_or: 'ଟିକେ ଥଣ୍ଡା ଲାଗୁଛି।', description_en: 'A bit chilly.',
    advice_or: 'ଗରମ ଜ୍ୟାକେଟ ପିନ୍ଧନ୍ତୁ।', advice_en: 'Wear a warm jacket.',
  };
  return {
    description_or: 'ବହୁତ ଥଣ୍ଡା! ଶୀତ ପଡ଼ୁଛି।', description_en: 'Very cold! Winter chill.',
    advice_or: 'ଗରମ କପଡ଼ା ପିନ୍ଧନ୍ତୁ।', advice_en: 'Bundle up warm before heading out.',
  };
}

// ─── Odia condition word (for forecast rows) ─────────────────────────────────
function conditionWord(condition: string, temp: number): string {
  const c = condition.toLowerCase();
  if (c === 'thunderstorm') return 'ବଜ୍ରବର୍ଷା';
  if (c === 'rain')         return 'ବର୍ଷା';
  if (c === 'drizzle')      return 'ହାଲୁକା ବର୍ଷା';
  if (c === 'snow')         return 'ତୁଷାର';
  if (c === 'mist' || c === 'fog' || c === 'haze') return 'କୁହୁଡ଼ି';
  if (c === 'clouds')       return 'ମେଘୁଆ';
  if (temp >= 35)           return 'ଗରମ';
  if (temp >= 25)           return 'ଖରା';
  if (temp >= 15)           return 'ଭଲ';
  return 'ଥଣ୍ଡା';
}

// ─── Season detection (Odisha) ───────────────────────────────────────────────
function getSeason(month: number): string {
  if (month >= 3 && month <= 5)  return 'Summer';
  if (month >= 6 && month <= 9)  return 'Monsoon';
  if (month >= 10 && month <= 11) return 'Autumn';
  return 'Winter';
}

// ─── Agri tips ───────────────────────────────────────────────────────────────
function getAgriTips(condition: string, temp: number, humidity: number, month: number) {
  const tips: { tip_or: string; tip_en: string; icon: string }[] = [];
  const c = condition.toLowerCase();
  const isRainy = c === 'rain' || c === 'drizzle' || c === 'thunderstorm';
  const season = getSeason(month);

  if (isRainy && season === 'Monsoon') {
    tips.push({
      tip_or: 'ବର୍ଷା ପରେ ଧାନ ରୋଇବା ଭଲ ସମୟ।',
      tip_en: 'Good time to transplant paddy after rain.',
      icon: '🌾',
    });
    tips.push({
      tip_or: 'ଜଳ ଜମା ହେଲେ ତୁରନ୍ତ ନିଷ୍କାସନ କରନ୍ତୁ।',
      tip_en: 'Drain waterlogged fields immediately.',
      icon: '💧',
    });
  }
  if (humidity > 80) {
    tips.push({
      tip_or: 'ଅଧିକ ଆର୍ଦ୍ରତା — ଫସଲରେ ଫଙ୍ଗସ ଓ ପୋକ ଧ୍ୟାନ ଦିଅନ୍ତୁ।',
      tip_en: 'High humidity — watch for fungal disease and pests.',
      icon: '🐛',
    });
  }
  if (temp >= 38 && season === 'Summer') {
    tips.push({
      tip_or: 'ଅତ୍ୟଧିକ ଗରମ — ସଞ୍ଜ ବେଳେ ସେଚ କରନ୍ତୁ।',
      tip_en: 'Extreme heat — water crops in the evening.',
      icon: '🌡️',
    });
  }
  if (season === 'Summer' && !isRainy) {
    tips.push({
      tip_or: 'ଗ୍ରୀଷ୍ମ ସମୟ — ଲଙ୍କା ଓ ଭେଣ୍ଡି ଲଗାଇବାର ଭଲ ସମୟ।',
      tip_en: 'Summer — good time for chilli and okra planting.',
      icon: '🌶️',
    });
  }
  if (season === 'Winter') {
    tips.push({
      tip_or: 'ଶୀତ ଋତୁ — ଆଳୁ, ଟମାଟୋ ଓ ଶୀତ ଶାଗ ଫସଲ ଭଲ।',
      tip_en: 'Winter — good for potato, tomato, and leafy vegetables.',
      icon: '🥔',
    });
  }
  if (tips.length === 0) {
    tips.push({
      tip_or: 'ଆଜି ଫସଲ ପରୀକ୍ଷା କରନ୍ତୁ।',
      tip_en: 'Check your crops today for any issues.',
      icon: '🌱',
    });
  }
  return tips.slice(0, 3);
}

// ─── Odia day names ───────────────────────────────────────────────────────────
const ODIA_DAYS = ['ରବି', 'ସୋମ', 'ମଙ୍ଗଳ', 'ବୁଧ', 'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'];
const EN_DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Fetch & process one district ────────────────────────────────────────────
async function processDistrict(districtId: number, lat: number, lon: number, today: string) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', [
    'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
    'precipitation_probability', 'weather_code', 'wind_speed_10m', 'is_day',
  ].join(','));
  url.searchParams.set('hourly', 'temperature_2m,weather_code,precipitation_probability');
  url.searchParams.set('daily', [
    'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max',
  ].join(','));
  url.searchParams.set('timezone', 'Asia/Kolkata');
  url.searchParams.set('forecast_days', '7');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo error for district ${districtId}: ${res.status}`);
  const data = await res.json();

  const cur = data.current;
  const isDay = cur.is_day === 1;
  const month = new Date(today).getMonth() + 1;

  const { condition, icon } = wmoToCondition(cur.weather_code, isDay);
  const phrase = getPhrase(condition, cur.temperature_2m);
  const agriTips = getAgriTips(condition, cur.temperature_2m, cur.relative_humidity_2m, month);

  // Hourly — pick every 3 hours for today (8 points: 00,03,06...21)
  const todayPrefix = today;
  const hourly = data.hourly.time
    .map((t: string, i: number) => ({ t, i }))
    .filter(({ t }: { t: string }) => t.startsWith(todayPrefix))
    .filter((_: unknown, idx: number) => idx % 3 === 0)
    .slice(0, 8)
    .map(({ t, i }: { t: string; i: number }) => {
      const { condition: hCond, icon: hIcon } = wmoToCondition(data.hourly.weather_code[i], true);
      return {
        time: t.split('T')[1]?.slice(0, 5) ?? '00:00',
        temp: Math.round(data.hourly.temperature_2m[i]),
        icon: hIcon,
        condition: hCond,
        desc_or: conditionWord(hCond, data.hourly.temperature_2m[i]),
      };
    });

  // 7-day forecast
  const forecast_7day = data.daily.time.map((date: string, i: number) => {
    const dow = new Date(date).getDay();
    const { condition: dCond, icon: dIcon } = wmoToCondition(data.daily.weather_code[i], true);
    return {
      date,
      day_or: ODIA_DAYS[dow],
      day_en: EN_DAYS[dow],
      icon: dIcon,
      temp_high: Math.round(data.daily.temperature_2m_max[i]),
      temp_low: Math.round(data.daily.temperature_2m_min[i]),
      condition: dCond,
      desc_or: conditionWord(dCond, data.daily.temperature_2m_max[i]),
    };
  });

  const row = {
    district_id:    districtId,
    date:           today,
    temp_current:   Math.round(cur.temperature_2m * 10) / 10,
    temp_high:      Math.round(data.daily.temperature_2m_max[0] * 10) / 10,
    temp_low:       Math.round(data.daily.temperature_2m_min[0] * 10) / 10,
    feels_like:     Math.round(cur.apparent_temperature * 10) / 10,
    humidity:       cur.relative_humidity_2m,
    wind_speed:     Math.round(cur.wind_speed_10m * 10) / 10,
    rain_chance:    cur.precipitation_probability ?? 0,
    condition,
    icon_code:      icon,
    description_or: phrase.description_or,
    description_en: phrase.description_en,
    advice_or:      phrase.advice_or,
    advice_en:      phrase.advice_en,
    hourly,
    forecast_7day,
    agri_tips:      agriTips,
  };

  const { error } = await supabase
    .from('weather')
    .upsert(row, { onConflict: 'district_id,date' });

  if (error) throw new Error(`Supabase upsert error for district ${districtId}: ${error.message}`);
  return districtId;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (_req) => {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD

  const results = { success: [] as number[], failed: [] as number[] };

  for (const district of DISTRICTS) {
    try {
      await processDistrict(district.id, district.lat, district.lon, today);
      results.success.push(district.id);
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(err);
      results.failed.push(district.id);
    }
  }

  console.log(`Done: ${results.success.length} success, ${results.failed.length} failed`);

  return new Response(JSON.stringify({
    date: today,
    success_count: results.success.length,
    failed_districts: results.failed,
  }), { headers: { 'Content-Type': 'application/json' } });
});
