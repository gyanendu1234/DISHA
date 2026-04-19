import { create } from 'zustand';
import { District, ODISHA_DISTRICTS, DEFAULT_DISTRICT } from '@/constants/districts';
import { FontSizeKey, Language } from '@/lib/storage';
import { WeatherData } from '@/lib/supabase';
import { Festival, FESTIVALS_2026 } from '@/constants/festivals';

interface AppState {
  // User prefs
  district: District;
  language: Language;
  fontSizeKey: FontSizeKey;
  fontScale: number;
  notifFestival: boolean;
  notifHoliday: boolean;
  notifWeather: boolean;
  isOnboarded: boolean;
  isReady: boolean;       // true once AsyncStorage prefs are loaded

  // Data
  weather: WeatherData | null;
  weatherAge: number;          // minutes since last fetch
  festivals: Festival[];
  isWeatherLoading: boolean;

  // Actions
  setDistrict: (d: District) => void;
  setLanguage: (l: Language) => void;
  setFontSize: (s: FontSizeKey) => void;
  setNotifPrefs: (p: { festival: boolean; holiday: boolean; weather: boolean }) => void;
  setOnboarded: () => void;
  setReady: () => void;
  setWeather: (w: WeatherData | null, ageMinutes?: number) => void;
  setWeatherLoading: (v: boolean) => void;
}

const FONT_SCALES: Record<FontSizeKey, number> = {
  small: 0.85,
  medium: 1,
  large: 1.25,
};

export const useAppStore = create<AppState>((set) => ({
  district: DEFAULT_DISTRICT,
  language: 'both',
  fontSizeKey: 'medium',
  fontScale: 1,
  notifFestival: true,
  notifHoliday: true,
  notifWeather: true,
  isOnboarded: false,
  isReady: false,

  weather: null,
  weatherAge: Infinity,
  festivals: FESTIVALS_2026,
  isWeatherLoading: false,

  setDistrict: (d) => set({ district: d }),
  setLanguage: (l) => set({ language: l }),
  setFontSize: (s) => set({ fontSizeKey: s, fontScale: FONT_SCALES[s] }),
  setNotifPrefs: (p) => set({ notifFestival: p.festival, notifHoliday: p.holiday, notifWeather: p.weather }),
  setOnboarded: () => set({ isOnboarded: true }),
  setReady: () => set({ isReady: true }),
  setWeather: (w, age = 0) => set({ weather: w, weatherAge: age }),
  setWeatherLoading: (v) => set({ isWeatherLoading: v }),
}));

// Selector helpers
export const selectUpcomingFestivals = (state: AppState) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return state.festivals
    .filter(f => new Date(f.date) >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
};

export const selectFestivalById = (id: string) => (state: AppState) =>
  state.festivals.find(f => f.id === id) ?? null;
