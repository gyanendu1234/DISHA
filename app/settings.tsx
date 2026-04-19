import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Switch, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { ODISHA_DISTRICTS } from '@/constants/districts';
import { saveDistrictId, saveLanguage, saveFontSize, saveNotifPrefs, Language, FontSizeKey } from '@/lib/storage';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import { toOdiaNumerals } from '@/constants/odia';
import { useDynamicFont } from '@/hooks/useDynamicFont';

type Section = 'district' | null;

export default function SettingsScreen() {
  const router = useRouter();
  const {
    district, language, fontSizeKey,
    notifFestival, notifHoliday, notifWeather,
    setDistrict, setLanguage, setFontSize, setNotifPrefs,
  } = useAppStore();

  const [expandedSection, setExpandedSection] = useState<Section>(null);
  const fs = useDynamicFont();

  async function handleDistrictSelect(d: typeof ODISHA_DISTRICTS[0]) {
    setDistrict(d);
    await saveDistrictId(d.id);
    setExpandedSection(null);
  }

  async function handleLanguage(l: Language) {
    setLanguage(l);
    await saveLanguage(l);
  }

  async function handleFontSize(s: FontSizeKey) {
    setFontSize(s);
    await saveFontSize(s);
  }

  async function handleNotif(key: 'festival' | 'holiday' | 'weather', val: boolean) {
    const prefs = {
      festival: key === 'festival' ? val : notifFestival,
      holiday: key === 'holiday' ? val : notifHoliday,
      weather: key === 'weather' ? val : notifWeather,
    };
    setNotifPrefs(prefs);
    await saveNotifPrefs(prefs);
  }

  const DIVISIONS = [...new Set(ODISHA_DISTRICTS.map(d => d.division))].sort();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ସେଟିଂ</Text>
          <Text style={styles.headerSub}>Settings</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* District */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { fontSize: fs.base }]}>📍 ଜିଲ୍ଲା ଚୟନ</Text>
          <Text style={[styles.sectionHeaderEn, { fontSize: fs.xs }]}>Select District</Text>

          <TouchableOpacity
            style={styles.districtCurrent}
            onPress={() => setExpandedSection(expandedSection === 'district' ? null : 'district')}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.districtCurrentOr}>{district.name_or}</Text>
              <Text style={styles.districtCurrentEn}>{district.name_en} · {district.division}</Text>
            </View>
            <Text style={styles.chevron}>{expandedSection === 'district' ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {expandedSection === 'district' && (
            <View style={styles.districtList}>
              {DIVISIONS.map(div => (
                <View key={div}>
                  <Text style={styles.divisionHeader}>{div}</Text>
                  {ODISHA_DISTRICTS.filter(d => d.division === div).map(d => (
                    <TouchableOpacity
                      key={d.id}
                      style={[styles.districtOption, d.id === district.id && styles.districtOptionActive]}
                      onPress={() => handleDistrictSelect(d)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.districtOptionInfo}>
                        <Text style={[styles.districtOptionOr, d.id === district.id && styles.districtOptionActiveText, { fontSize: fs.base }]}>
                          {d.name_or}
                        </Text>
                        <Text style={[styles.districtOptionEn, { fontSize: fs.xs }]}>{d.name_en}</Text>
                      </View>
                      {d.id === district.id && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { fontSize: fs.base }]}>🗣️ ଭାଷା</Text>
          <Text style={[styles.sectionHeaderEn, { fontSize: fs.xs }]}>Language</Text>
          <View style={styles.optionGroup}>
            {([
              ['both', 'ଦ୍ୱିଭାଷୀ', 'Odia + English'],
              ['or', 'ଓଡ଼ିଆ', 'Odia only'],
              ['en', 'ଇଂରାଜୀ', 'English only'],
            ] as [Language, string, string][]).map(([key, or, en]) => (
              <TouchableOpacity
                key={key}
                style={[styles.optionItem, language === key && styles.optionItemActive]}
                onPress={() => handleLanguage(key)}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={[styles.optionOr, language === key && styles.optionActiveText, { fontSize: fs.base }]}>{or}</Text>
                  <Text style={[styles.optionEn, { fontSize: fs.xs }]}>{en}</Text>
                </View>
                {language === key && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Font Size */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { fontSize: fs.base }]}>🔤 ଅକ୍ଷର ଆକାର</Text>
          <Text style={[styles.sectionHeaderEn, { fontSize: fs.xs }]}>Font Size</Text>
          <View style={styles.fontRow}>
            {([
              ['small', 'ଛୋଟ', 'A', 13],
              ['medium', 'ସାଧାରଣ', 'A', 18],
            ] as [FontSizeKey, string, string, number][]).map(([key, or, letter, size]) => (
              <TouchableOpacity
                key={key}
                style={[styles.fontBtn, fontSizeKey === key && styles.fontBtnActive]}
                onPress={() => handleFontSize(key)}
                activeOpacity={0.7}
              >
                <Text style={[{ fontSize: size, color: fontSizeKey === key ? '#fff' : Colors.text, fontWeight: '700' }]}>{letter}</Text>
                <Text style={[styles.fontBtnLabel, fontSizeKey === key && styles.fontBtnLabelActive]}>{or}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { fontSize: fs.base }]}>🔔 ବିଜ୍ଞପ୍ତି</Text>
          <Text style={[styles.sectionHeaderEn, { fontSize: fs.xs }]}>Notifications</Text>
          <View style={styles.card}>
            {([
              ['festival', '🪔', 'ପର୍ବ ରିମାଇଣ୍ଡର', 'Festival reminders (1 day before)', notifFestival],
              ['holiday', '🏦', 'ଛୁଟି ସୂଚନା', 'Holiday alerts (evening before)', notifHoliday],
              ['weather', '🌤️', 'ପାଣିପାଗ ସତର୍କତା', 'Weather alerts (cyclone, heavy rain)', notifWeather],
            ] as [('festival'|'holiday'|'weather'), string, string, string, boolean][]).map(([key, emoji, or, en, val], i) => (
              <View key={key} style={[styles.notifRow, i > 0 && styles.notifBorder]}>
                <Text style={styles.notifEmoji}>{emoji}</Text>
                <View style={styles.notifInfo}>
                  <Text style={styles.notifOr}>{or}</Text>
                  <Text style={styles.notifEn}>{en}</Text>
                </View>
                <Switch
                  value={val}
                  onValueChange={(v) => handleNotif(key, v)}
                  trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                  thumbColor={val ? Colors.primary : '#f4f3f4'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { fontSize: fs.base }]}>ℹ️ ବିଷୟରେ</Text>
          <Text style={[styles.sectionHeaderEn, { fontSize: fs.xs }]}>About Disha</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>ସଂସ୍କରଣ / Version</Text>
              <Text style={styles.aboutVal}>1.0.0</Text>
            </View>
            <View style={[styles.aboutRow, styles.notifBorder]}>
              <Text style={styles.aboutLabel}>ଓଡ଼ିଶା ର ଲୋକଙ୍କ ପାଇଁ</Text>
              <Text style={styles.aboutVal}>🔱</Text>
            </View>
            <View style={[styles.aboutRow, styles.notifBorder]}>
              <Text style={styles.aboutLabel}>ଆପଣଙ୍କ ଦୈନିକ ସାଥୀ</Text>
              <Text style={styles.aboutVal}>ଦିଶା</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 16 },

  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 12,
    paddingHorizontal: Spacing.sm,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#fff', fontSize: FontSize.xl, lineHeight: FontSize.xl + 2 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: FontSize.md, fontFamily: 'NotoSansOdia-Bold', fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, marginTop: 1 },

  section: { marginHorizontal: Spacing.md, marginTop: 20 },
  sectionHeader: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia-Bold', color: Colors.text, fontWeight: '700' },
  sectionHeaderEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1, marginBottom: 10 },

  districtCurrent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  districtCurrentOr: { fontSize: FontSize.md, fontFamily: 'NotoSansOdia-Bold', color: Colors.primary, fontWeight: '700' },
  districtCurrentEn: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 14, color: Colors.textSecondary },

  districtList: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginTop: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    maxHeight: 360,
  },
  divisionHeader: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  districtOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  districtOptionActive: { backgroundColor: Colors.primary + '12' },
  districtOptionInfo: { flex: 1 },
  districtOptionOr: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '600' },
  districtOptionActiveText: { color: Colors.primary },
  districtOptionEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  checkmark: { color: Colors.primary, fontSize: 18, fontWeight: '700' },

  optionGroup: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  optionItemActive: { backgroundColor: Colors.primary + '12' },
  optionOr: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '600' },
  optionActiveText: { color: Colors.primary },
  optionEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },

  fontRow: { flexDirection: 'row', gap: 12 },
  fontBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    elevation: 1,
  },
  fontBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  fontBtnLabel: { fontSize: FontSize.xs, fontFamily: 'NotoSansOdia', color: Colors.textSecondary, marginTop: 4 },
  fontBtnLabelActive: { color: '#fff' },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: 10,
  },
  notifBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  notifEmoji: { fontSize: 22 },
  notifInfo: { flex: 1 },
  notifOr: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '600' },
  notifEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },

  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  aboutLabel: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.text },
  aboutVal: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
});
