// Conversational Odia weather phrases — no API needed, pure lookup

export interface WeatherPhrase {
  desc_or: string;
  advice_or: string;
  desc_en: string;
  advice_en: string;
  icon: string;
}

export interface AgriTip {
  tip_or: string;
  tip_en: string;
  icon: string;
}

// Map OpenWeatherMap condition codes to Odia phrases
export function getWeatherPhrase(
  condition: string, // OWM main condition: Clear, Clouds, Rain, Thunderstorm, Drizzle, Snow, Mist, Fog, Haze
  temp: number,
): WeatherPhrase {
  const cond = condition.toLowerCase();

  if (cond === 'thunderstorm') {
    return {
      desc_or: 'ବଜ୍ର ସହ ବର୍ଷା!',
      advice_or: 'ଘରେ ରୁହନ୍ତୁ, ଗଛ ତଳେ ଯାଆନ୍ତୁ ନାଁ ।',
      desc_en: 'Thunderstorm!',
      advice_en: 'Stay indoors, avoid trees.',
      icon: '⛈️',
    };
  }
  if (cond === 'rain') {
    if (temp > 30) return {
      desc_or: 'ଗରମ ସହ ବର୍ଷା ହେଉଛି!',
      advice_or: 'ଛତା ନିଅନ୍ତୁ ଓ ପାଣି ପିଅନ୍ତୁ।',
      desc_en: 'Hot and rainy!',
      advice_en: 'Take umbrella and stay hydrated.',
      icon: '🌧️',
    };
    return {
      desc_or: 'ବର୍ଷା ହେଉଛି!',
      advice_or: 'ଛତା ଧରି ବାହାରନ୍ତୁ।',
      desc_en: "It's raining!",
      advice_en: 'Take an umbrella.',
      icon: '🌧️',
    };
  }
  if (cond === 'drizzle') {
    return {
      desc_or: 'ହାଲୁକା ବର୍ଷା ହେଉଛି।',
      advice_or: 'ଛୋଟ ଛତା ଯଥେଷ୍ଟ।',
      desc_en: 'Light drizzle.',
      advice_en: 'A light umbrella is enough.',
      icon: '🌦️',
    };
  }
  if (cond === 'snow') {
    return {
      desc_or: 'ତୁଷାରପାତ ହେଉଛି!',
      advice_or: 'ଗରମ କପଡ଼ା ପିନ୍ଧନ୍ତୁ।',
      desc_en: 'Snowfall!',
      advice_en: 'Wear warm clothes.',
      icon: '❄️',
    };
  }
  if (cond === 'mist' || cond === 'fog' || cond === 'haze') {
    return {
      desc_or: 'କୁହୁଡ଼ି ପଡ଼ିଛି।',
      advice_or: 'ଯାନ ଚାଳନା ସାବଧାନ ଭାବେ କରନ୍ତୁ।',
      desc_en: 'Foggy / misty.',
      advice_en: 'Drive carefully.',
      icon: '🌫️',
    };
  }
  if (cond === 'clouds') {
    return {
      desc_or: 'ମେଘୁଆ ଆକାଶ।',
      advice_or: 'ବର୍ଷା ହୋଇପାରେ, ଛତା ସାଥରେ ରଖନ୍ତୁ।',
      desc_en: 'Cloudy sky.',
      advice_en: 'May rain, keep umbrella handy.',
      icon: '⛅',
    };
  }

  // Clear — temperature-based
  if (temp >= 40) return {
    desc_or: 'ଅତ୍ୟଧିକ ଗରମ! ଲୁ ଲାଗୁଛି।',
    advice_or: 'ଘରୁ ବାହାରନ୍ତୁ ନାଁ, ପ୍ରଚୁର ପାଣି ପିଅନ୍ତୁ।',
    desc_en: 'Extreme heat! Heat wave.',
    advice_en: 'Avoid going out, drink plenty of water.',
    icon: '🥵',
  };
  if (temp >= 35) return {
    desc_or: 'ବହୁତ ଗରମ ଲାଗୁଛି ଭାଇ!',
    advice_or: 'ଛାଇରେ ରୁହନ୍ତୁ, ପ୍ରଚୁର ପାଣି ପିଅନ୍ତୁ।',
    desc_en: "It's very hot!",
    advice_en: 'Stay in shade, drink water.',
    icon: '☀️',
  };
  if (temp >= 28) return {
    desc_or: 'ଗରମ ଲାଗୁଛି।',
    advice_or: 'ବାହାରକୁ ଯିବା ବେଳେ ପାଣି ନିଅନ୍ତୁ।',
    desc_en: 'Warm and sunny.',
    advice_en: 'Carry water when going out.',
    icon: '☀️',
  };
  if (temp >= 20) return {
    desc_or: 'ବହୁତ ଭଲ ପାଣିପାଗ!',
    advice_or: 'ବାହାରକୁ ଯାଇ ଆନନ୍ଦ ନିଅନ୍ତୁ।',
    desc_en: 'Beautiful weather!',
    advice_en: 'Great day to go outside.',
    icon: '🌤️',
  };
  if (temp >= 12) return {
    desc_or: 'ଟିକେ ଥଣ୍ଡା ଲାଗୁଛି।',
    advice_or: 'ଗରମ ଜ୍ୟାକେଟ ପିନ୍ଧନ୍ତୁ।',
    desc_en: 'A bit chilly.',
    advice_en: 'Wear a warm jacket.',
    icon: '🌥️',
  };
  return {
    desc_or: 'ବହୁତ ଥଣ୍ଡା! ଶୀତ ପଡ଼ୁଛି।',
    advice_or: 'ଗରମ କପଡ଼ା ପିନ୍ଧନ୍ତୁ, ଘରୁ ଗରମ ଖାଇ ବାହାରନ୍ତୁ।',
    desc_en: 'Very cold! Winter chill.',
    advice_en: 'Bundle up warm before heading out.',
    icon: '🥶',
  };
}

// Get Odia description for a weather condition (one word, for 7-day forecast row)
export function getConditionWord(condition: string, temp: number): { or: string; en: string } {
  const cond = condition.toLowerCase();
  if (cond === 'thunderstorm') return { or: 'ବଜ୍ରବର୍ଷା', en: 'Storm' };
  if (cond === 'rain') return { or: 'ବର୍ଷା', en: 'Rainy' };
  if (cond === 'drizzle') return { or: 'ହାଲୁକା ବର୍ଷା', en: 'Drizzle' };
  if (cond === 'snow') return { or: 'ତୁଷାର', en: 'Snow' };
  if (cond === 'mist' || cond === 'fog' || cond === 'haze') return { or: 'କୁହୁଡ଼ି', en: 'Foggy' };
  if (cond === 'clouds') return { or: 'ମେଘୁଆ', en: 'Cloudy' };
  // Clear
  if (temp >= 35) return { or: 'ଗରମ', en: 'Hot' };
  if (temp >= 25) return { or: 'ଖରା', en: 'Sunny' };
  if (temp >= 15) return { or: 'ଭଲ', en: 'Pleasant' };
  return { or: 'ଥଣ୍ଡା', en: 'Cold' };
}

// Agricultural tips based on weather + season
export function getAgriTips(
  condition: string,
  temp: number,
  humidity: number,
  season_en: string,
): AgriTip[] {
  const tips: AgriTip[] = [];
  const cond = condition.toLowerCase();
  const isRainy = cond === 'rain' || cond === 'drizzle' || cond === 'thunderstorm';
  const isSummer = season_en === 'Summer';
  const isMonsoon = season_en === 'Monsoon';
  const isWinter = season_en === 'Winter';

  if (isRainy && isMonsoon) {
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
  if (temp >= 38 && isSummer) {
    tips.push({
      tip_or: 'ଅତ୍ୟଧିକ ଗରମ — ଫସଲ ଜଳ ସଂଚୟ ଭାଙ୍ଗିଯାଏ। ସଞ୍ଜ ବେଳେ ସେଚ କରନ୍ତୁ।',
      tip_en: 'Extreme heat — water crops in the evening to reduce evaporation.',
      icon: '🌡️',
    });
  }
  if (isSummer && !isRainy) {
    tips.push({
      tip_or: 'ଗ୍ରୀଷ୍ମ ସମୟ — ଲଙ୍କା ଓ ଭେଣ୍ଡି ଲଗାଇବାର ଭଲ ସମୟ।',
      tip_en: 'Summer season — good time for chilli and okra planting.',
      icon: '🌶️',
    });
  }
  if (isWinter) {
    tips.push({
      tip_or: 'ଶୀତ ଋତୁ — ଆଳୁ, ଟମାଟୋ ଓ ଶୀତ ଶାଗ ଫସଲ ଭଲ।',
      tip_en: 'Winter season — good for potato, tomato, and leafy vegetables.',
      icon: '🥔',
    });
  }
  if (tips.length === 0) {
    tips.push({
      tip_or: 'ଆଜି ଫସଲ ପ‌ ରୀ‌ ଦ ` ର ‌ ‍ ‍ ‌ ‍ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌',
      tip_en: 'Check your crops today for any issues.',
      icon: '🌱',
    });
  }
  return tips.slice(0, 3);
}

// Weather icon emoji from OWM icon code
export function getWeatherEmoji(iconCode: string): string {
  const map: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌦️', '09n': '🌦️',
    '10d': '🌧️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return map[iconCode] ?? '🌤️';
}
