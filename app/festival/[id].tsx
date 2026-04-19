import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { selectFestivalById } from '@/store/useAppStore';
import { useAppStore } from '@/store/useAppStore';
import { FESTIVALS_2026 } from '@/constants/festivals';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import { toOdiaNumerals } from '@/constants/odia';
import { daysUntil } from '@/lib/odia-calendar';
import { scheduleFestivalReminder, cancelReminder, requestNotificationPermission } from '@/lib/notifications';

const ENGLISH_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const ODIA_DAYS = ['ରବିବାର','ସୋମବାର','ମଙ୍ଗଳବାର','ବୁଧବାର','ଗୁରୁବାର','ଶୁକ୍ରବାର','ଶନିବାର'];

export default function FestivalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [reminderSet, setReminderSet] = useState(false);

  const festival = FESTIVALS_2026.find(f => f.id === id) ?? null;

  if (!festival) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.backHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>ଫେରନ୍ତୁ</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={styles.notFoundOr}>ପର୍ବ ମିଳିଲା ନାହିଁ</Text>
          <Text style={styles.notFoundEn}>Festival not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const date = new Date(festival.date);
  const dow = date.getDay();
  const daysLeft = daysUntil(festival.date);
  const isPast = daysLeft < 0;

  async function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)' as any);
  }

  async function toggleReminder() {
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert(
        'ଅନୁମତି ଦରକାର',
        'ରିମାଇଣ୍ଡର ପାଇଁ ଆପ ବିଜ୍ଞପ୍ତି ଅନୁମତି ଦିଅନ୍ତୁ।\nPlease allow notification permission for reminders.',
        [{ text: 'ଠିକ ଅଛି / OK' }]
      );
      return;
    }
    if (reminderSet) {
      await cancelReminder(festival.id);
      setReminderSet(false);
    } else {
      await scheduleFestivalReminder(festival.id, festival.name_or, festival.name_en, festival.date);
      setReminderSet(true);
      Alert.alert(
        '🔔 ରିମାଇଣ୍ଡର ଲଗାଗଲା!',
        `${festival.name_or} ର ୧ ଦିନ ଆଗରୁ ଆପଣଙ୍କୁ ସୂଚିତ କରାଯିବ।\nYou will be reminded 1 day before ${festival.name_en}.`,
        [{ text: 'ଧନ୍ୟବାଦ / Thanks' }]
      );
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      {/* Back Navigation */}
      <View style={styles.backHeader}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>ଫେରନ୍ତୁ</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroEmoji}>{festival.emoji}</Text>
          {!isPast && daysLeft <= 30 && (
            <View style={[styles.countdownBadge, daysLeft === 0 && styles.todayBadge]}>
              <Text style={styles.countdownText}>
                {daysLeft === 0 ? '🎉 ଆଜି!' : `ଆଉ ${toOdiaNumerals(daysLeft)} ଦିନ`}
              </Text>
            </View>
          )}
          {isPast && (
            <View style={styles.pastBadge}>
              <Text style={styles.pastBadgeText}>ସମ୍ପନ୍ନ</Text>
            </View>
          )}
        </View>

        {/* Name & Date */}
        <View style={styles.titleSection}>
          <Text style={styles.nameOr}>{festival.name_or}</Text>
          <Text style={styles.nameEn}>{festival.name_en}</Text>

          <View style={styles.dateRow}>
            <Text style={styles.dateOr}>
              {ODIA_DAYS[dow]}, {toOdiaNumerals(date.getDate())} {ENGLISH_MONTHS[date.getMonth()]} {toOdiaNumerals(date.getFullYear())}
            </Text>
            <Text style={styles.dateEn}>
              {ODIA_DAYS[dow]}, {date.getDate()} {ENGLISH_MONTHS[date.getMonth()]} {date.getFullYear()}
            </Text>
          </View>

          {festival.tithi && (
            <View style={styles.tithiRow}>
              <Text style={styles.tithiLabel}>ତିଥି: </Text>
              <Text style={styles.tithiVal}>{festival.tithi}</Text>
            </View>
          )}

          {/* Odia Date */}
          <View style={styles.odiaDateRow}>
            <Text style={styles.odiaDateLabel}>ଓଡ଼ିଆ ତାରିଖ: </Text>
            <Text style={styles.odiaDateVal}>
              {toOdiaNumerals(festival.odia_day)} {festival.odia_month} {toOdiaNumerals(festival.odia_year)}
            </Text>
          </View>
        </View>

        {/* At a Glance */}
        <View style={styles.glanceRow}>
          <View style={[styles.glanceItem, festival.is_bank_holiday ? styles.glanceYes : styles.glanceNo]}>
            <Text style={styles.glanceEmoji}>🏦</Text>
            <Text style={styles.glanceLabel}>ବ୍ୟାଙ୍କ ଛୁଟି</Text>
            <Text style={styles.glanceVal}>{festival.is_bank_holiday ? 'ହଁ ✓' : 'ନାହିଁ'}</Text>
          </View>
          <View style={[styles.glanceItem, festival.is_govt_holiday ? styles.glanceYes : styles.glanceNo]}>
            <Text style={styles.glanceEmoji}>🏛️</Text>
            <Text style={styles.glanceLabel}>ସରକାରୀ ଛୁଟି</Text>
            <Text style={styles.glanceVal}>{festival.is_govt_holiday ? 'ହଁ ✓' : 'ନାହିଁ'}</Text>
          </View>
          {festival.location && (
            <View style={styles.glanceItem}>
              <Text style={styles.glanceEmoji}>📍</Text>
              <Text style={styles.glanceLabel}>ସ୍ଥାନ</Text>
              <Text style={styles.glanceVal}>{festival.location}</Text>
            </View>
          )}
          {festival.is_odisha_specific && !festival.location && (
            <View style={[styles.glanceItem, styles.glanceYes]}>
              <Text style={styles.glanceEmoji}>🔱</Text>
              <Text style={styles.glanceLabel}>ଓଡ଼ିଶା</Text>
              <Text style={styles.glanceVal}>ବିଶେଷ</Text>
            </View>
          )}
        </View>

        {/* Significance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📖 ମହତ୍ତ୍ୱ</Text>
          <Text style={styles.cardSubtitle}>Significance</Text>
          <Text style={styles.significanceOr}>{festival.significance_or}</Text>
          <View style={styles.divider} />
          <Text style={styles.significanceEn}>{festival.significance_en}</Text>
        </View>

        {/* Traditions */}
        {(festival.traditions_or.length > 0 || festival.traditions_en.length > 0) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🪔 ପରମ୍ପରା</Text>
            <Text style={styles.cardSubtitle}>Traditions</Text>
            {festival.traditions_or.map((t, i) => (
              <View key={i} style={styles.traditionRow}>
                <View style={styles.bulletDot} />
                <View style={styles.traditionTexts}>
                  <Text style={styles.traditionOr}>{t}</Text>
                  {festival.traditions_en[i] && (
                    <Text style={styles.traditionEn}>{festival.traditions_en[i]}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Reminder Button */}
        {!isPast && (
          <TouchableOpacity
            style={[styles.reminderBtn, reminderSet && styles.reminderBtnSet]}
            onPress={toggleReminder}
            activeOpacity={0.8}
          >
            <Text style={styles.reminderBtnEmoji}>{reminderSet ? '🔕' : '🔔'}</Text>
            <View>
              <Text style={styles.reminderBtnTextOr}>
                {reminderSet ? 'ରିମାଇଣ୍ଡର ହଟାନ୍ତୁ' : 'ରିମାଇଣ୍ଡର ଲଗାନ୍ତୁ'}
              </Text>
              <Text style={styles.reminderBtnTextEn}>
                {reminderSet ? 'Cancel reminder' : 'Set reminder (1 day before)'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 16 },

  backHeader: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingTop: 6,
    paddingBottom: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  backIcon: { color: '#fff', fontSize: FontSize.lg, lineHeight: FontSize.lg + 2 },
  backText: { color: '#fff', fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', fontWeight: '600' },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundEmoji: { fontSize: 48 },
  notFoundOr: { fontSize: FontSize.lg, fontFamily: 'NotoSansOdia', color: Colors.textSecondary, marginTop: 12 },
  notFoundEn: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },

  heroBanner: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: Spacing.base,
  },
  heroEmoji: { fontSize: 80 },
  countdownBadge: {
    marginTop: 12,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    paddingHorizontal: 16, paddingVertical: 6,
  },
  todayBadge: { backgroundColor: '#fff' },
  countdownText: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia-Bold', color: Colors.primaryDark, fontWeight: '700' },
  pastBadge: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  pastBadgeText: { color: '#fff', fontSize: FontSize.sm, fontFamily: 'NotoSansOdia' },

  titleSection: {
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  nameOr: { fontSize: FontSize.xl, fontFamily: 'NotoSansOdia-Bold', color: Colors.primary, fontWeight: '700' },
  nameEn: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 2 },
  dateRow: { marginTop: 10 },
  dateOr: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '600' },
  dateEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  tithiRow: { flexDirection: 'row', marginTop: 8, alignItems: 'center' },
  tithiLabel: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.textSecondary },
  tithiVal: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.secondary, fontWeight: '600' },
  odiaDateRow: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
  odiaDateLabel: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.textSecondary },
  odiaDateVal: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.secondary, fontWeight: '600' },

  glanceRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
  },
  glanceItem: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: Radius.md, backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.border,
  },
  glanceYes: { backgroundColor: Colors.successLight, borderColor: Colors.success + '40' },
  glanceNo: { backgroundColor: Colors.background },
  glanceEmoji: { fontSize: 20 },
  glanceLabel: { fontSize: FontSize.xs, fontFamily: 'NotoSansOdia', color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  glanceVal: { fontSize: FontSize.xs, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '600', marginTop: 2 },

  card: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    marginBottom: 0,
    borderRadius: Radius.md,
    padding: Spacing.base,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia-Bold', color: Colors.text, fontWeight: '700' },
  cardSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1, marginBottom: 10 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },

  significanceOr: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia', color: Colors.text, lineHeight: 24 },
  significanceEn: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  traditionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  bulletDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 5 },
  traditionTexts: { flex: 1 },
  traditionOr: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '600' },
  traditionEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  reminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: Spacing.md,
    marginTop: Spacing.base,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.base,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  reminderBtnSet: { backgroundColor: Colors.textSecondary },
  reminderBtnEmoji: { fontSize: 28 },
  reminderBtnTextOr: { color: '#fff', fontSize: FontSize.base, fontFamily: 'NotoSansOdia-Bold', fontWeight: '700' },
  reminderBtnTextEn: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, marginTop: 2 },
});
