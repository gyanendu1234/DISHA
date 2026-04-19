import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// --- Types matching Supabase tables ---

export interface WeatherData {
  id?: number;
  district_id: number;
  date: string;
  temp_current: number;
  temp_high: number;
  temp_low: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  rain_chance: number;
  condition: string;
  icon_code: string;
  description_or: string;
  description_en: string;
  advice_or: string;
  advice_en: string;
  hourly: HourlyWeather[];
  forecast_7day: DailyForecast[];
  agri_tips: { tip_or: string; tip_en: string; icon: string }[];
  updated_at?: string;
}

export interface HourlyWeather {
  time: string;    // HH:MM
  temp: number;
  icon: string;
  condition: string;
  desc_or: string;
}

export interface DailyForecast {
  date: string;
  day_or: string;
  day_en: string;
  icon: string;
  temp_high: number;
  temp_low: number;
  condition: string;
  desc_or: string;
}

export interface MandiPrice {
  id?: number;
  district_id: number;
  date: string;
  commodity_local: string;
  commodity_en: string;
  price: number;
  unit: string;
  market_name: string;
}

// --- API Fetchers ---

export async function fetchWeather(districtId: number): Promise<WeatherData | null> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('weather')
    .select('*')
    .eq('district_id', districtId)
    .eq('date', today)
    .single();

  if (error) {
    console.warn('Weather fetch error:', error.message);
    return null;
  }
  return data as WeatherData;
}

export async function fetchFestivals(
  stateId: number,
  fromDate: string,
  toDate: string,
) {
  const { data, error } = await supabase
    .from('festivals')
    .select('*')
    .eq('state_id', stateId)
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date');

  if (error) {
    console.warn('Festivals fetch error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchHolidays(stateId: number, year: number) {
  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .eq('state_id', stateId)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date');

  if (error) {
    console.warn('Holidays fetch error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchMandiPrices(districtId: number) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('mandi_prices')
    .select('*')
    .eq('district_id', districtId)
    .eq('date', today)
    .order('commodity_en');

  if (error) {
    console.warn('Mandi prices fetch error:', error.message);
    return [];
  }
  return (data ?? []) as MandiPrice[];
}
