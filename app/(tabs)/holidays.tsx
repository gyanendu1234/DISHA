import { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HOLIDAYS_2026, FESTIVALS_2026 } from '@/constants/festivals';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import { toOdiaNumerals, ODIA_DAYS_SHORT } from '@/constants/odia';
import { useDynamicFont } from '@/hooks/useDynamicFont';

type TabType = 'all' | 'bank' | 'govt';

const MONTHS_OR = ['ଜାନୁ', 'ଫେ', 'ମାର୍ଚ', 'ଏପ୍ରି', 'ମେ', 'ଜୁନ', 'ଜୁଲ', 'ଅଗ', 'ସେ', 'ଅକ୍ଟ', 'ନଭ', 'ଡ଼ି'];
const MONTHS_FULL_OR = ['ଜାନୁଆରୀ', 'ଫେବ୍ରୁଆରୀ', 'ମାର୍ଚ', 'ଏପ୍ରିଲ', 'ମେ', 'ଜୁନ', 'ଜୁଲାଇ', 'ଅଗଷ୍ଟ', 'ସେପ୍ଟେମ୍ବର', 'ଅକ୍ଟୋବର', 'ନଭେମ୍ବର', 'ଡ଼ିସେମ୍ବର'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_OR = ['ରବି', 'ସୋମ', 'ମଙ୍ଗ', 'ବୁଧ', 'ଗୁରୁ', 'ଶୁକ୍ର', 'ଶନି'];

export default function HolidaysScreen() {
  const router = useRouter();
  const fs = useDynamicFont();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // null = all months

  const filtered = useMemo(() => {
    return HOLIDAYS_2026.filter(h => {
      // 'bank' shows bank, both, AND govt (all Odisha govt holidays are effectively bank holidays)
      const tabMatch = activeTab === 'all'
        || (activeTab === 'bank' && (h.type === 'bank' || h.type === 'both' || h.type === 'govt'))
        || (activeTab === 'govt' && (h.type === 'govt' || h.type === 'both'));
      const d = new Date(h.date);
      const monthMatch = selectedMonth === null || d.getMonth() === selectedMonth;
      return tabMatch && monthMatch;
    });
  }, [activeTab, selectedMonth]);

  // Group by month
  const grouped = useMemo(() => {
    const map: Record<number, typeof HOLIDAYS_2026> = {};
    filtered.forEach(h => {
      const m = new Date(h.date).getMonth();
      if (!map[m]) map[m] = [];
      map[m].push(h);
    });
    // Sort months
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([month, holidays]) => ({ month: Number(month), holidays }));
  }, [filtered]);

  // Months that have holidays (for filter chips)
  const activeMonths = useMemo(() => {
    const s = new Set<number>();
    HOLIDAYS_2026.forEach(h => s.add(new Date(h.date).getMonth()));
    return Array.from(s).sort((a, b) => a - b);
  }, []);

  // Summary counts
  const totalBankHolidays = HOLIDAYS_2026.filter(h => h.type === 'bank' || h.type === 'both').length;
  const totalGovtHolidays = HOLIDAYS_2026.filter(h => h.type === 'govt' || h.type === 'both').length;
  const upcoming = HOLIDAYS_2026.filter(h => new Date(h.date) >= new Date()).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { fontSize: fs.lg }]}>ଛୁଟି ତାଲିକା</Text>
          <Text style={[styles.headerSub, { fontSize: fs.xs }]}>Holiday List 2026</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings' as any)} style={styles.settingsBtn} activeOpacity={0.8}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { fontSize: fs.xl }]}>{toOdiaNumerals(totalBankHolidays)}</Text>
          <Text style={[styles.summaryLabel, { fontSize: fs.xs }]}>ବ୍ୟାଙ୍କ ଛୁଟି</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { fontSize: fs.xl }]}>{toOdiaNumerals(totalGovtHolidays)}</Text>
          <Text style={[styles.summaryLabel, { fontSize: fs.xs }]}>ସରକାରୀ ଛୁଟି</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { fontSize: fs.xl }]}>{toOdiaNumerals(upcoming)}</Text>
          <Text style={[styles.summaryLabel, { fontSize: fs.xs }]}>ଆସନ୍ତା ଛୁଟି</Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {([['all', 'ସବୁ', 'All'], ['bank', '🏦 ବ୍ୟାଙ୍କ', 'Bank'], ['govt', '🏛️ ସରକାରୀ', 'Govt']] as const).map(([key, or, en]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabTextOr, activeTab === key && styles.tabTextActive]}>{or}</Text>
            <Text style={[styles.tabTextEn, activeTab === key && styles.tabTextActiveEn]}>{en}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Month Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContainer}>
          <TouchableOpacity
            style={[styles.chip, selectedMonth === null && styles.chipActive]}
            onPress={() => setSelectedMonth(null)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, selectedMonth === null && styles.chipTextActive]}>ସବୁ ମାସ</Text>
          </TouchableOpacity>
          {activeMonths.map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, selectedMonth === m && styles.chipActive]}
              onPress={() => setSelectedMonth(selectedMonth === m ? null : m)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, selectedMonth === m && styles.chipTextActive]}>
                {MONTHS_OR[m]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Holiday Groups */}
        {grouped.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyOr}>ଏହି ବର୍ଗରେ ଛୁଟି ନାହିଁ</Text>
            <Text style={styles.emptyEn}>No holidays in this category</Text>
          </View>
        )}

        {grouped.map(({ month, holidays }) => (
          <View key={month} style={styles.monthGroup}>
            <View style={styles.monthHeader}>
              <Text style={[styles.monthTitleOr, { fontSize: fs.md }]}>{MONTHS_FULL_OR[month]}</Text>
              <Text style={[styles.monthTitleEn, { fontSize: fs.xs }]}>{MONTHS_EN[month]} 2026</Text>
            </View>

            <View style={styles.holidayCard}>
              {holidays.map((h, i) => {
                const date = new Date(h.date);
                const dow = date.getDay();
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                return (
                  <View key={h.id} style={[styles.holidayRow, i > 0 && styles.holidayBorder, isPast && styles.pastRow]}>
                    {/* Date Badge */}
                    <View style={[styles.dateBadge, h.type === 'both' ? styles.dateBadgeBoth : h.type === 'bank' ? styles.dateBadgeBank : styles.dateBadgeGovt]}>
                      <Text style={styles.dateBadgeDayOr}>{toOdiaNumerals(date.getDate())}</Text>
                      <Text style={styles.dateBadgeDow}>{DAYS_OR[dow]}</Text>
                      <Text style={styles.dateBadgeDayEn}>{DAYS_EN[dow]}</Text>
                    </View>

                    {/* Info */}
                    <View style={styles.holidayInfo}>
                      <Text style={[styles.holidayNameOr, isPast && styles.pastText, { fontSize: fs.base }]}>
                        {h.name_or}
                      </Text>
                      <Text style={[styles.holidayNameEn, isPast && styles.pastText, { fontSize: fs.xs }]}>
                        {h.name_en}
                      </Text>

                      {/* Type badges */}
                      <View style={styles.typeBadges}>
                        {(h.type === 'bank' || h.type === 'both') && (
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>🏦 ବ୍ୟାଙ୍କ</Text>
                          </View>
                        )}
                        {(h.type === 'govt' || h.type === 'both') && (
                          <View style={[styles.typeBadge, styles.typeBadgeGovt]}>
                            <Text style={styles.typeBadgeText}>🏛️ ସରକାରୀ</Text>
                          </View>
                        )}
                        {h.is_odisha && (
                          <View style={[styles.typeBadge, styles.typeBadgeOdisha]}>
                            <Text style={styles.typeBadgeText}>ଓଡ଼ିଶା</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Status dot */}
                    {!isPast && (
                      <View style={[styles.upcomingDot,
                        (() => {
                          const daysLeft = Math.ceil((date.getTime() - Date.now()) / 86400000);
                          return daysLeft <= 7 ? styles.soonDot : {};
                        })()
                      ]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteOr}>
            📌 ଦ୍ରଷ୍ଟବ୍ୟ: ବ୍ୟାଙ୍କ ଛୁଟି RBI ନିର୍ଦ୍ଦେଶ ଅନୁଯାୟୀ। ସ୍ଥାନୀୟ ଛୁଟି ଭିନ୍ନ ହୋଇ ପାରେ।
          </Text>
          <Text style={styles.noteEn}>
            Note: Bank holidays as per RBI guidelines. Local holidays may vary.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primary,
    paddingTop: 8,
    paddingBottom: 14,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: FontSize.lg, fontFamily: 'NotoSansOdia-Bold', fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, marginTop: 1 },
  settingsBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingsIcon: { color: '#fff', fontSize: 18 },

  summaryRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: FontSize.xl, fontFamily: 'NotoSansOdia-Bold', color: Colors.primary, fontWeight: '700' },
  summaryLabel: { fontSize: FontSize.xs, fontFamily: 'NotoSansOdia', color: Colors.textSecondary, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabTextOr: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.textSecondary, fontWeight: '600' },
  tabTextEn: { fontSize: FontSize.xs, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  tabTextActiveEn: { color: Colors.primary },

  scroll: { paddingBottom: 16 },

  chipScroll: { flexGrow: 0 },
  chipContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.text },
  chipTextActive: { color: '#fff' },

  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 48 },
  emptyOr: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia', color: Colors.textSecondary, marginTop: 12 },
  emptyEn: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },

  monthGroup: { marginHorizontal: Spacing.md, marginTop: 16 },
  monthHeader: { marginBottom: 8 },
  monthTitleOr: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia-Bold', color: Colors.text, fontWeight: '700' },
  monthTitleEn: { fontSize: FontSize.xs, color: Colors.textSecondary },

  holidayCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  holidayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  holidayBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  pastRow: { opacity: 0.55 },

  dateBadge: {
    width: 44, alignItems: 'center', borderRadius: Radius.sm,
    paddingVertical: 6, backgroundColor: Colors.primary + '15',
  },
  dateBadgeBoth: { backgroundColor: Colors.primary + '20' },
  dateBadgeBank: { backgroundColor: Colors.accentDark + '30' },
  dateBadgeGovt: { backgroundColor: Colors.primaryDark + '20' },
  dateBadgeDayOr: { fontSize: 14, fontFamily: 'NotoSansOdia', color: Colors.primary, fontWeight: '700' },
  dateBadgeDayEn: { fontSize: 10, color: Colors.textSecondary },
  dateBadgeDow: { fontSize: 9, color: Colors.textSecondary, marginTop: 1 },

  holidayInfo: { flex: 1 },
  holidayNameOr: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '600' },
  holidayNameEn: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 1 },
  pastText: { color: Colors.textSecondary },

  typeBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  typeBadge: {
    backgroundColor: Colors.accent + '40',
    borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2,
  },
  typeBadgeGovt: { backgroundColor: Colors.primaryDark + '20' },
  typeBadgeOdisha: { backgroundColor: Colors.accent + '40' },
  typeBadgeText: { fontSize: FontSize.xs, fontFamily: 'NotoSansOdia', color: Colors.text },

  upcomingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  soonDot: { backgroundColor: Colors.accent },

  noteBox: {
    margin: Spacing.md,
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  noteOr: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.textSecondary },
  noteEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 },
});
