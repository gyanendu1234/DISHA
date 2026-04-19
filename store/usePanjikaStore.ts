import { create } from 'zustand';
import { fetchMonthPanjika, MonthPanjikaData } from '@/lib/panjikaService';

const key = (year: number, month: number) => `${year}-${month}`;

interface PanjikaState {
  cache: Record<string, MonthPanjikaData>;
  loading: boolean;
  error: string | null;
  getMonthData: (year: number, month: number) => MonthPanjikaData | null;
  loadMonth: (year: number, month: number) => Promise<void>;
}

export const usePanjikaStore = create<PanjikaState>((set, get) => ({
  cache: {},
  loading: false,
  error: null,

  getMonthData: (year, month) => get().cache[key(year, month)] ?? null,

  loadMonth: async (year, month) => {
    const k = key(year, month);
    if (get().cache[k]) return;
    set({ loading: true, error: null });
    try {
      const data = await fetchMonthPanjika(year, month);
      set(s => ({ cache: { ...s.cache, [k]: data }, loading: false }));
    } catch {
      set({ loading: false, error: 'Failed to load panjika data' });
    }
  },
}));
