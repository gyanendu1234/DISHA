import { supabase } from './supabase';

export interface PanchangaDay {
  id: number;
  iso_date: string;
  day_of_month: number;
  month_number: number;
  weekday: string;
  tithi: string | null;
  paksha: string | null;
  nakshatra: string | null;
  festival: string | null;
  significance: string | null;
  has_festival: boolean;
  year: number;
}

export interface OdiaFestival {
  id: number;
  iso_date: string;
  month_number: number;
  festival_name: string;
  festival_name_or: string | null;
  significance: string | null;
  is_national_holiday: boolean;
  is_odia_specific: boolean;
  is_religious: boolean;
  is_bank_holiday: boolean;
  year: number;
}

export interface LunarEvent {
  id: number;
  iso_date: string;
  month_number: number;
  event_type: 'ekadashi' | 'amavasya' | 'purnima' | 'sankranti' | 'pradosh' | 'chaturthi';
  event_name: string;
  event_name_or: string | null;
  paksha: string | null;
  significance: string | null;
  is_major: boolean;
  year: number;
}

export interface AuspiciousDate {
  id: number;
  iso_date: string;
  month_number: number;
  date_type: 'marriage' | 'griha_pravesh';
  subha_start: string | null;
  subha_end: string | null;
  subha_end_next_day: boolean;
  nakshatra: string | null;
  tithi: string | null;
  notes: string | null;
  year: number;
}

export interface CalendarMonthInfo {
  id: number;
  month_number: number;
  month_name: string;
  days_in_month: number;
  marriage_dates_text: string | null;
  griha_pravesh_text: string | null;
  amabasya_text: string | null;
  purnima_text: string | null;
  ekadashi_text: string | null;
  sankranti_text: string | null;
  other_observances: string | null;
  astrological_notes: string | null;
  year: number;
}

export interface MonthPanjikaData {
  days: Record<number, PanchangaDay>;
  festivals: OdiaFestival[];
  lunarEvents: LunarEvent[];
  auspiciousDates: AuspiciousDate[];
  lunarByDay: Record<number, LunarEvent[]>;
  festivalsByDay: Record<number, OdiaFestival[]>;
  auspiciousByDay: Record<number, AuspiciousDate[]>;
  monthInfo: CalendarMonthInfo | null;
  hasData: boolean;
}

export async function fetchMonthPanjika(
  year: number,
  monthNumber: number,
): Promise<MonthPanjikaData> {
  const [daysRes, festivalsRes, lunarRes, auspRes, monthRes] = await Promise.all([
    supabase
      .from('odia_panchanga_days')
      .select('*')
      .eq('year', year)
      .eq('month_number', monthNumber)
      .order('day_of_month'),
    supabase
      .from('odia_festivals')
      .select('*')
      .eq('year', year)
      .eq('month_number', monthNumber)
      .order('iso_date'),
    supabase
      .from('odia_lunar_events')
      .select('*')
      .eq('year', year)
      .eq('month_number', monthNumber)
      .order('iso_date'),
    supabase
      .from('odia_auspicious_dates')
      .select('*')
      .eq('year', year)
      .eq('month_number', monthNumber)
      .order('iso_date'),
    supabase
      .from('odia_calendar_months')
      .select('*')
      .eq('year', year)
      .eq('month_number', monthNumber)
      .maybeSingle(),
  ]);

  const days: Record<number, PanchangaDay> = {};
  for (const d of daysRes.data ?? []) days[d.day_of_month] = d;

  const festivals: OdiaFestival[] = festivalsRes.data ?? [];
  const festivalsByDay: Record<number, OdiaFestival[]> = {};
  for (const f of festivals) {
    const day = new Date(f.iso_date).getUTCDate();
    if (!festivalsByDay[day]) festivalsByDay[day] = [];
    festivalsByDay[day].push(f);
  }

  const lunarEvents: LunarEvent[] = lunarRes.data ?? [];
  const lunarByDay: Record<number, LunarEvent[]> = {};
  for (const l of lunarEvents) {
    const day = new Date(l.iso_date).getUTCDate();
    if (!lunarByDay[day]) lunarByDay[day] = [];
    lunarByDay[day].push(l);
  }

  const auspiciousDates: AuspiciousDate[] = auspRes.data ?? [];
  const auspiciousByDay: Record<number, AuspiciousDate[]> = {};
  for (const a of auspiciousDates) {
    const day = new Date(a.iso_date).getUTCDate();
    if (!auspiciousByDay[day]) auspiciousByDay[day] = [];
    auspiciousByDay[day].push(a);
  }

  return {
    days,
    festivals,
    lunarEvents,
    auspiciousDates,
    lunarByDay,
    festivalsByDay,
    auspiciousByDay,
    monthInfo: monthRes.data ?? null,
    hasData: (daysRes.data?.length ?? 0) > 0,
  };
}
