import { useEffect, useCallback } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, selectUpcomingFestivals } from '@/store/useAppStore';
import { useMessagingStore } from '@/store/useMessagingStore';
import { Colors, Spacing, Radius, Shadow, FontSize, Fonts } from '@/constants/theme';
import { UI, getGreeting, toOdiaNumerals, ODIA_DAYS, ODIA_MONTHS_OR } from '@/constants/odia';
import { useDynamicFont } from '@/hooks/useDynamicFont';
import { getOdiaDate, daysUntil, isToday, formatTime } from '@/lib/odia-calendar';
import { fetchWeather } from '@/lib/supabase';
import { cacheWeather, getCachedWeather, getCachedInbox } from '@/lib/storage';
import { getWeatherPhrase } from '@/lib/weather-phrases';
import { fetchWeatherFromOpenMeteo } from '@/lib/openmeteo';
import { getParentInbox, getSentHistory } from '@/lib/quickMessageService';
import { HOLIDAYS_2026 } from '@/constants/festivals';
import SunCalc from 'suncalc';

const MSG_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MSG_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function msgTimeLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (diffMin < 60) return `${Math.max(diffMin, 1)}m ago`;
  const sameDay = d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  if (sameDay) return `Today · ${timeStr}`;
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (d.getDate() === yest.getDate() && d.getMonth() === yest.getMonth()) return `Yesterday · ${timeStr}`;
  return `${MSG_DAYS[d.getDay()]} ${d.getDate()} ${MSG_MONTHS[d.getMonth()]} · ${timeStr}`;
}

export default function HomeScreen() {
  const fs = useDynamicFont();
  const { district, weather, weatherAge, isWeatherLoading, setWeather, setWeatherLoading } = useAppStore();
  const upcomingFestivals = useAppStore(useShallow(selectUpcomingFestivals));
  const { currentUser: msgUser, messages, unreadCount, linkedMembers, setMessages } = useMessagingStore();
  const isParent = msgUser?.role === 'parent';
  const msgPreview = messages.slice(0, 3);

  // Load messages on home page mount so preview shows without navigating to Messages tab
  useEffect(() => {
    if (!msgUser) return;
    if (messages.length > 0) return; // already loaded, skip
    if (msgUser.role === 'parent') {
      // Try cache first, then live
      getCachedInbox().then(async cached => {
        if (cached.length > 0) setMessages(cached as any);
        try {
          const live = await getParentInbox(msgUser.id);
          if (live.length > 0) setMessages(live);
        } catch {}
      });
    } else {
      // Supporter: load sent history live
      getSentHistory(msgUser.id).then(sent => {
        if (sent.length > 0) setMessages(sent);
      }).catch(() => {});
    }
  }, [msgUser?.id]);

  const now = new Date();
  const odiaDate = getOdiaDate(now);
  const greeting = getGreeting();
  const dayName = ODIA_DAYS[now.getDay()];
  const dateStr = `${toOdiaNumerals(now.getDate())} ${ODIA_MONTHS_OR[now.getMonth()]} ${toOdiaNumerals(now.getFullYear())}`;
  const dateEnStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Sunrise / Sunset (offline calculation)
  const sunTimes = SunCalc.getTimes(now, district.lat, district.lon);
  const sunriseStr = formatTime(sunTimes.sunrise);
  const sunsetStr = formatTime(sunTimes.sunset);

  // Upcoming holidays
  const todayStr = now.toISOString().split('T')[0];
  const upcomingHolidays = HOLIDAYS_2026
    .filter(h => h.date >= todayStr)
    .slice(0, 3);

  // Load weather — Open-Meteo (live) → Supabase → cache
  const loadWeather = useCallback(async () => {
    setWeatherLoading(true);
    const { data: cached, ageMinutes } = await getCachedWeather(district.id);
    try {
      if (cached && ageMinutes < 120) {
        setWeather(cached as any, ageMinutes);
        setWeatherLoading(false);
        return;
      }
      const live = await fetchWeatherFromOpenMeteo(district.lat, district.lon, district.id);
      if (live) {
        await cacheWeather(district.id, live);
        setWeather(live, 0);
        return;
      }
      const data = await fetchWeather(district.id);
      if (data) {
        await cacheWeather(district.id, data);
        setWeather(data, 0);
      } else if (cached) {
        setWeather(cached as any, ageMinutes);
      }
    } catch (e) {
      console.warn('Weather load error', e);
      if (cached) setWeather(cached as any, ageMinutes);
    } finally {
      setWeatherLoading(false);
    }
  }, [district.id, district.lat, district.lon]);

  useEffect(() => { loadWeather(); }, [loadWeather]);

  const weatherPhrase = weather
    ? getWeatherPhrase(weather.condition, weather.temp_current)
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <Text style={styles.appName}>ଦିଶା</Text>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isWeatherLoading} onRefresh={loadWeather}
            colors={[Colors.primary]} tintColor={Colors.primary} />
        }
      >
        {/* Hero Date Card — tappable → Calendar */}
        <TouchableOpacity style={styles.hero} onPress={() => router.push('/(tabs)/calendar')} activeOpacity={0.88}>
          <Text style={[styles.greeting, { fontSize: fs.lg }]}>{greeting.or}</Text>
          <Text style={[styles.heroDay, { fontSize: fs.md }]}>{dayName}, {dateStr}</Text>
          <Text style={[styles.heroDateEn, { fontSize: fs.sm }]}>{dateEnStr}</Text>

          <View style={styles.heroDivider} />

          <Text style={[styles.heroCalLabel, { fontSize: fs.xs }]}>{UI.odiaCal.or} ({UI.sakaEra.or}):</Text>
          <Text style={[styles.heroCalDate, { fontSize: fs.md }]}>{odiaDate.full_or}</Text>
          <Text style={[styles.heroCalSub, { fontSize: fs.xs }]}>{odiaDate.month_en} · {odiaDate.season_en} ({odiaDate.season_or})</Text>

          <View style={styles.sunRow}>
            <Text style={styles.sunText}>🌅 {UI.sunrise.or} {sunriseStr}</Text>
            <Text style={styles.sunText}>🌇 {UI.sunset.or} {sunsetStr}</Text>
          </View>
          <Text style={styles.heroTapHint}>ପଞ୍ଜିକା ଦେଖନ୍ତୁ › Calendar</Text>
        </TouchableOpacity>

        {/* Messages preview — parents see inbox, supporters see sent status */}
        {msgUser && (
          <Section title="ବାର୍ତ୍ତା" subtitle="Messages" emoji="💬">
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push('/(tabs)/messages')}
              activeOpacity={0.85}
            >
              {isParent && unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{toOdiaNumerals(unreadCount)} ନୂଆ ବାର୍ତ୍ତା</Text>
                </View>
              )}
              {msgPreview.length === 0 ? (
                <View style={styles.msgEmpty}>
                  <Text style={styles.msgEmptyOr}>
                    {isParent ? 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ବାର୍ତ୍ତା ନାହିଁ' : 'କୌଣସି ବାର୍ତ୍ତା ପଠାଯାଇ ନାହିଁ'}
                  </Text>
                  <Text style={styles.msgEmptyEn}>
                    {isParent ? 'No messages yet. Tap to open inbox.' : 'No sent messages. Tap to compose.'}
                  </Text>
                </View>
              ) : (
                msgPreview.map((msg) => (
                  <View key={msg.id} style={styles.msgRow}>
                    <View style={[styles.msgDot, !msg.is_read && styles.msgDotUnread]} />
                    <View style={styles.msgBody}>
                      {isParent
                        ? <Text style={styles.msgSender}>{msg.sender_name}</Text>
                        : <Text style={styles.msgSender}>
                            → {linkedMembers.find(m => m.id === msg.receiver_id)?.name ?? 'Family'}
                            {'  '}{msg.is_done ? '✓ Done' : msg.is_read ? '✓ Read' : 'Sent'}
                          </Text>
                      }
                      <Text style={[styles.msgText, { fontSize: fs.sm }]} numberOfLines={2}>{msg.text_or}</Text>
                      {!!msg.text_en && (
                        <Text style={[styles.msgTextEn, { fontSize: fs.xs }]} numberOfLines={1}>{msg.text_en}</Text>
                      )}
                      <Text style={styles.msgTime}>{msgTimeLabel(msg.created_at)}</Text>
                    </View>
                  </View>
                ))
              )}
              <Text style={styles.viewAll}>
                {isParent ? 'ସମସ୍ତ ବାର୍ତ୍ତା ›' : 'View sent messages ›'}
              </Text>
            </TouchableOpacity>
          </Section>
        )}

        {/* Upcoming Festivals */}
        <Section title={UI.todaySpecial.or} subtitle={UI.todaySpecial.en} emoji="🪔">
          <View style={styles.card}>
            <Text style={styles.calMonthLabel}>
              {odiaDate.month_or} ({odiaDate.month_en}) {UI.today.or}
            </Text>
            {upcomingFestivals.map(f => {
              const days = daysUntil(f.date);
              return (
                <TouchableOpacity
                  key={f.id}
                  style={styles.festivalRow}
                  onPress={() => router.push(`/festival/${f.id}`)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.festIcon}>{f.emoji}</Text>
                  <View style={styles.festBody}>
                    <View style={styles.festTitleRow}>
                      <Text style={[styles.festNameOr, { fontSize: fs.base }]}>{f.name_or}</Text>
                      {days <= 7 && (
                        <View style={styles.countdownBadge}>
                          <Text style={styles.countdownText}>
                            {isToday(f.date) ? 'ଆଜି!' : `ଆଉ ${toOdiaNumerals(days)} ଦିନ`}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.festNameEn}>{f.name_en}</Text>
                    <Text style={styles.festDate}>
                      {toOdiaNumerals(parseInt(f.date.split('-')[2]))} {ODIA_MONTHS_OR[parseInt(f.date.split('-')[1]) - 1]} {toOdiaNumerals(parseInt(f.date.split('-')[0]))}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
              <Text style={styles.viewAll}>{UI.viewAll.or}</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Weather Summary */}
        <Section title={UI.todayWeather.or} subtitle={UI.todayWeather.en} emoji="🌤️">
          <TouchableOpacity
            style={styles.weatherCard}
            onPress={() => router.push('/(tabs)/weather')}
            activeOpacity={0.85}
          >
            {weather ? (
              <>
                <View style={styles.weatherMain}>
                  <Text style={styles.weatherIcon}>{weatherPhrase?.icon ?? '🌤️'}</Text>
                  <View>
                    <Text style={[styles.weatherTemp, { fontSize: fs.xxl }]}>{toOdiaNumerals(Math.round(weather.temp_current))}°C</Text>
                    <Text style={[styles.weatherDescOr, { fontSize: fs.base }]}>{weatherPhrase?.desc_or}</Text>
                    <Text style={[styles.weatherDescEn, { fontSize: fs.xs }]}>{weatherPhrase?.desc_en}</Text>
                  </View>
                </View>
                <Text style={styles.weatherAdvice}>{weatherPhrase?.advice_or}</Text>
                <View style={styles.weatherStats}>
                  <WeatherStat label={`💨 ${toOdiaNumerals(Math.round(weather.wind_speed))}`} sub="km/h" />
                  <WeatherStat label={`💧 ${toOdiaNumerals(weather.humidity)}%`} sub={UI.humidity.or} />
                  <WeatherStat label={`🌧️ ${toOdiaNumerals(weather.rain_chance)}%`} sub={UI.rain.or} />
                </View>
                {weatherAge > 60 && (
                  <Text style={styles.staleLabel}>
                    {UI.lastUpdated.or}: {toOdiaNumerals(Math.round(weatherAge))} ମିନ ଆଗ
                  </Text>
                )}
              </>
            ) : (
              <View style={styles.weatherPlaceholder}>
                <Text style={styles.weatherIcon}>🌤️</Text>
                <Text style={styles.weatherDescOr}>
                  {isWeatherLoading ? UI.loading.or : `${district.name_or} ପାଇଁ ପାଣିପାଗ`}
                </Text>
                <Text style={styles.weatherDescEn}>
                  {isWeatherLoading ? 'Loading...' : `Weather for ${district.name_en}`}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Section>

        {/* Holiday Summary */}
        <Section title={UI.holidayInfo.or} subtitle={UI.holidayInfo.en} emoji="🏛️">
          <View style={styles.card}>
            {upcomingHolidays.map(h => (
              <View key={h.id} style={styles.holidayRow}>
                <View style={[styles.holidayDot,
                  h.type === 'bank' ? styles.dotBank :
                  h.type === 'govt' ? styles.dotGovt : styles.dotBoth
                ]} />
                <View style={styles.holidayBody}>
                  <Text style={[styles.holidayNameOr, { fontSize: fs.sm }]}>{h.name_or}</Text>
                  <Text style={[styles.holidayNameEn, { fontSize: fs.xs }]}>{h.name_en}</Text>
                </View>
                <Text style={styles.holidayDate}>
                  {toOdiaNumerals(parseInt(h.date.split('-')[2]))} {ODIA_MONTHS_OR[parseInt(h.date.split('-')[1]) - 1]}
                </Text>
              </View>
            ))}
            <TouchableOpacity onPress={() => router.push('/(tabs)/holidays')}>
              <Text style={styles.viewAll}>{UI.viewAll.or}</Text>
            </TouchableOpacity>
          </View>
        </Section>

        <View style={{ height: 12 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, subtitle, emoji, children }: {
  title: string; subtitle: string; emoji: string; children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEmoji}>{emoji}</Text>
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSub}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function WeatherStat({ label, sub }: { label: string; sub: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statVal}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  appName: { fontSize: FontSize.xl, fontFamily: 'NotoSansOdia-Bold', color: Colors.primary },
  settingsBtn: { padding: Spacing.sm, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { fontSize: 24 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxl },

  // Hero — 3D lifted card with red shadow
  hero: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl, padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    borderBottomWidth: 4,
    borderBottomColor: Colors.primaryDark,
  },
  heroTapHint: {
    color: 'rgba(255,255,255,0.65)', fontSize: FontSize.xs,
    textAlign: 'right', marginTop: Spacing.sm, fontFamily: 'NotoSansOdia',
  },
  greeting: { color: '#fff', fontSize: FontSize.lg, fontFamily: 'NotoSansOdia-Bold', marginBottom: 2 },
  heroDay: { color: '#fff', fontSize: FontSize.md, fontFamily: 'NotoSansOdia', opacity: 0.95 },
  heroDateEn: { color: '#fff', fontSize: FontSize.sm, opacity: 0.8, marginTop: 1 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: Spacing.sm },
  heroCalLabel: { color: '#fff', fontSize: FontSize.xs, opacity: 0.8, fontFamily: 'NotoSansOdia' },
  heroCalDate: { color: '#fff', fontSize: FontSize.md, fontFamily: 'NotoSansOdia-Bold', marginTop: 2 },
  heroCalSub: { color: '#fff', fontSize: FontSize.xs, opacity: 0.8, marginTop: 1 },
  sunRow: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm },
  sunText: { color: '#fff', fontSize: FontSize.xs, opacity: 0.85, fontFamily: 'NotoSansOdia' },

  // Section
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, paddingBottom: Spacing.xs, borderBottomWidth: 2, borderBottomColor: Colors.border },
  sectionEmoji: { fontSize: 18, marginRight: Spacing.sm },
  sectionTitle: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia-Bold', color: Colors.text },
  sectionSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },

  // Card — 3D lifted white card
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.base, ...Shadow.card3d, borderWidth: 1, borderColor: Colors.border,
  },
  calMonthLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontFamily: 'NotoSansOdia', marginBottom: Spacing.sm },

  // Festival row
  festivalRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  festIcon: { fontSize: 26, marginRight: Spacing.sm, width: 36, textAlign: 'center' },
  festBody: { flex: 1 },
  festTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  festNameOr: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia-Bold', color: Colors.text },
  festNameEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  festDate: { fontSize: FontSize.xs, color: Colors.primary, fontFamily: 'NotoSansOdia', fontWeight: '600', marginTop: 2 },
  chevron: { fontSize: 22, color: Colors.textSecondary, marginLeft: 4 },
  countdownBadge: { backgroundColor: Colors.accent, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.sm },
  countdownText: { fontSize: FontSize.xs, color: '#7C2D12', fontFamily: 'NotoSansOdia', fontWeight: '700' },
  viewAll: { textAlign: 'right', color: Colors.primary, fontSize: FontSize.base, fontFamily: 'NotoSansOdia-Bold', marginTop: Spacing.md, paddingVertical: 4 },

  // Weather card — 3D red lifted
  weatherCard: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    padding: Spacing.base,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primaryDark,
  },
  weatherMain: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  weatherIcon: { fontSize: 44 },
  weatherTemp: { fontSize: FontSize.xxl, fontFamily: 'NotoSansOdia-Bold', color: '#fff' },
  weatherDescOr: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia-Bold', color: '#fff', marginTop: 2 },
  weatherDescEn: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  weatherAdvice: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.9)', fontFamily: 'NotoSansOdia', marginBottom: Spacing.sm },
  weatherPlaceholder: { alignItems: 'center', paddingVertical: Spacing.sm },
  weatherStats: {
    flexDirection: 'row', borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)', paddingTop: Spacing.sm,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia-Bold', color: '#fff' },
  statSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', fontFamily: 'NotoSansOdia', marginTop: 1 },
  staleLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginTop: 6 },

  // Messages preview
  unreadBadge: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: Spacing.sm,
  },
  unreadBadgeText: { color: '#fff', fontSize: FontSize.xs, fontFamily: 'NotoSansOdia-Bold' },
  msgEmpty: { alignItems: 'center', paddingVertical: Spacing.sm },
  msgEmptyOr: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.textSecondary },
  msgEmptyEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  msgRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  msgDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border, marginTop: 5 },
  msgDotUnread: { backgroundColor: Colors.primary },
  msgBody: { flex: 1 },
  msgSender: { fontSize: FontSize.xs, fontFamily: 'Poppins-SemiBold', color: Colors.primary, fontWeight: '700', marginBottom: 1 },
  msgText: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.text },
  msgTextEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  msgTime: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  // Holiday row
  holidayRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  holidayDot: { width: 12, height: 12, borderRadius: 6 },
  dotBank: { backgroundColor: Colors.accentDark },
  dotGovt: { backgroundColor: Colors.primaryDark },
  dotBoth: { backgroundColor: Colors.primary },
  holidayBody: { flex: 1 },
  holidayNameOr: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia-Bold', color: Colors.text },
  holidayNameEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  holidayDate: { fontSize: FontSize.xs, color: Colors.primary, fontFamily: 'NotoSansOdia', fontWeight: '600' },
});
