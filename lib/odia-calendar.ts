import { PANCHANG_MONTHS, toOdiaNumerals } from '@/constants/odia';

// Odia Panchang (Saka Solar Calendar) conversion
// Odia New Year starts on ~14 April (Maha Vishuba Sankranti)

interface OdiaDate {
  day: number;
  day_or: string;
  month_or: string;
  month_en: string;
  year: number;
  year_or: string;
  season_or: string;
  season_en: string;
  era_or: string;
  full_or: string;
  full_en: string;
}

// Approximate start dates (day of year) for each Odia month
// Based on solar calendar — exact dates shift slightly year to year
const ODIA_MONTH_START_MD: [number, number][] = [
  [4, 14],  // Baishakha  — ~14 April
  [5, 15],  // Jyeshtha   — ~15 May
  [6, 15],  // Ashadha    — ~15 June
  [7, 16],  // Shrabana   — ~16 July
  [8, 16],  // Bhadrab    — ~16 August
  [9, 16],  // Ashwina    — ~16 September
  [10, 16], // Kartika    — ~16 October
  [11, 15], // Margashira — ~15 November
  [12, 15], // Pousha     — ~15 December
  [1, 14],  // Magha      — ~14 January (next year)
  [2, 13],  // Phalguna   — ~13 February
  [3, 15],  // Chaitra    — ~15 March
];

export function getOdiaDate(date: Date): OdiaDate {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  const year = date.getFullYear();

  let odiaMonthIndex = 11; // default to Chaitra
  for (let i = 0; i < ODIA_MONTH_START_MD.length; i++) {
    const [sm, sd] = ODIA_MONTH_START_MD[i];
    const nextIdx = (i + 1) % ODIA_MONTH_START_MD.length;
    const [nm, nd] = ODIA_MONTH_START_MD[nextIdx];

    const startDate = new Date(year, sm - 1, sd);
    let endYear = year;
    if (nm < sm) endYear = year + 1;
    const endDate = new Date(endYear, nm - 1, nd - 1);

    if (date >= startDate && date <= endDate) {
      odiaMonthIndex = i;
      break;
    }
  }

  const [sm, sd] = ODIA_MONTH_START_MD[odiaMonthIndex];
  let startYear = year;
  if (sm > month || (sm === month && sd > day)) startYear = year - 1;
  if (sm < 4 && month >= 4) startYear = year; // Jan-Mar months that fall in next solar year

  const monthStart = new Date(startYear, sm - 1, sd);
  const odiaDay = Math.floor((date.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Saka year: Gregorian - 78 before April 14, Gregorian - 77 after
  let sakaYear: number;
  const isAfterOdiaNewYear = (month > 4) || (month === 4 && day >= 14);
  sakaYear = isAfterOdiaNewYear ? year - 78 : year - 79;

  const panchang = PANCHANG_MONTHS[odiaMonthIndex];

  return {
    day: Math.max(1, Math.min(32, odiaDay)),
    day_or: toOdiaNumerals(Math.max(1, Math.min(32, odiaDay))),
    month_or: panchang.or,
    month_en: panchang.en,
    year: sakaYear,
    year_or: toOdiaNumerals(sakaYear),
    season_or: panchang.season_or,
    season_en: panchang.season_en,
    era_or: 'ଶକାବ୍ଦ',
    full_or: `${toOdiaNumerals(Math.max(1, odiaDay))} ${panchang.or} ${toOdiaNumerals(sakaYear)}`,
    full_en: `${Math.max(1, odiaDay)} ${panchang.en} ${sakaYear}`,
  };
}

export function getCurrentOdiaMonth(): { or: string; en: string; season_or: string; season_en: string } {
  return getOdiaDate(new Date());
}

// Format a Gregorian date as full Odia date string
export function formatOdiaDate(date: Date): string {
  const od = getOdiaDate(date);
  return `${od.day_or} ${od.month_or} ${od.year_or} (${od.era_or})`;
}

// Days until a given date
export function daysUntil(targetDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// Is a date today
export function isToday(dateStr: string): boolean {
  const today = new Date();
  const d = new Date(dateStr);
  return today.toDateString() === d.toDateString();
}

// Format time as HH:MM
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Get current month's dates with Odia info
export function getCalendarMonth(year: number, month: number): {
  date: Date;
  dayOfWeek: number;
  odiaDay: number;
} [] {
  const days = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const od = getOdiaDate(date);
    days.push({ date, dayOfWeek: date.getDay(), odiaDay: od.day });
  }
  return days;
}
