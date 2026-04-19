import { useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { fetchWeather } from '@/lib/supabase';
import { getCachedWeather, cacheWeather } from '@/lib/storage';
import { fetchWeatherFromOpenMeteo } from '@/lib/openmeteo';
import { getWeatherPhrase, getConditionWord, getWeatherEmoji } from '@/lib/weather-phrases';
import { toOdiaNumerals, ODIA_DAYS_SHORT } from '@/constants/odia';
import { getOdiaDate } from '@/lib/odia-calendar';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';
import { useDynamicFont } from '@/hooks/useDynamicFont';

const ENGLISH_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeatherScreen() {
  const router = useRouter();
  const fs = useDynamicFont();
  const { district, weather, weatherAge, isWeatherLoading, setWeather, setWeatherLoading } = useAppStore();

  const loadWeather = useCallback(async () => {
    const cached = await getCachedWeather(district.id);
    if (cached.data && cached.ageMinutes < 30) {
      setWeather(cached.data as any, cached.ageMinutes);
      return;
    }
    setWeatherLoading(true);
    try {
      // Live Open-Meteo API (free, no key, real-time)
      const live = await fetchWeatherFromOpenMeteo(district.lat, district.lon, district.id);
      if (live) {
        await cacheWeather(district.id, live);
        setWeather(live, 0);
        return;
      }
      // Fallback: Supabase cached data
      const data = await fetchWeather(district.id);
      if (data) {
        await cacheWeather(district.id, data);
        setWeather(data, 0);
      } else if (cached.data) {
        setWeather(cached.data as any, cached.ageMinutes);
      }
    } catch (e) {
      console.warn('Weather fetch error', e);
      if (cached.data) setWeather(cached.data as any, cached.ageMinutes);
    } finally {
      setWeatherLoading(false);
    }
  }, [district.id, district.lat, district.lon]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const isStale = weatherAge > 60;
  const odiaDate = getOdiaDate(new Date());

  // Use pre-computed Odia text from Supabase; fallback to client-side phrase
  const phrase = weather
    ? (weather.description_or
        ? { desc_or: weather.description_or, advice_or: weather.advice_or, desc_en: weather.description_en, advice_en: weather.advice_en, icon: getWeatherEmoji(weather.icon_code) }
        : getWeatherPhrase(weather.condition, weather.temp_current))
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ପାଣିପାଗ</Text>
          <Text style={styles.headerSub}>Weather Forecast</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/settings' as any)} style={styles.locationBtn} activeOpacity={0.7}>
            <Text style={styles.locationText}>📍 {district.name_or}</Text>
            <Text style={styles.locationEn}>{district.name_en} ▾</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings' as any)} style={styles.settingsBtn} activeOpacity={0.8}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isWeatherLoading}
            onRefresh={loadWeather}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Main Weather Hero */}
        <View style={styles.heroCard}>
          {isWeatherLoading && !weather ? (
            <ActivityIndicator size="large" color="#fff" style={{ paddingVertical: 40 }} />
          ) : weather && phrase ? (
            <>
              {isStale && (
                <View style={styles.staleBanner}>
                  <Text style={styles.staleText}>⚠️ {toOdiaNumerals(Math.round(weatherAge))} ମିନିଟ ପୁରୁଣା ତଥ୍ୟ</Text>
                </View>
              )}
              <Text style={styles.heroEmoji}>{phrase.icon}</Text>
              <Text style={[styles.heroTempOr, { fontSize: Math.round(56 * fs.base / FontSize.base) }]}>{toOdiaNumerals(Math.round(weather.temp_current))}°C</Text>
              <Text style={styles.heroTempEn}>{Math.round(weather.temp_current)}°C</Text>
              <Text style={[styles.heroFeelsLike, { fontSize: fs.sm }]}>
                ଅନୁଭବ ହେଉଛି: {toOdiaNumerals(Math.round(weather.feels_like))}°C · {Math.round(weather.feels_like)}°C
              </Text>
              <Text style={[styles.heroDescOr, { fontSize: fs.lg }]}>{phrase.desc_or}</Text>
              <Text style={[styles.heroAdviceOr, { fontSize: fs.base }]}>{phrase.advice_or}</Text>
              <Text style={[styles.heroDescEn, { fontSize: fs.sm }]}>{phrase.desc_en}</Text>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>💨</Text>
                  <Text style={styles.statValue}>{toOdiaNumerals(Math.round(weather.wind_speed))}</Text>
                  <Text style={styles.statLabel}>ପବନ km/h</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>💧</Text>
                  <Text style={styles.statValue}>{toOdiaNumerals(weather.humidity)}%</Text>
                  <Text style={styles.statLabel}>ଆର୍ଦ୍ରତା</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>🌧️</Text>
                  <Text style={styles.statValue}>{toOdiaNumerals(weather.rain_chance)}%</Text>
                  <Text style={styles.statLabel}>ବର୍ଷା</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>🌡️</Text>
                  <Text style={styles.statValue}>{toOdiaNumerals(Math.round(weather.temp_high))}° / {toOdiaNumerals(Math.round(weather.temp_low))}°</Text>
                  <Text style={styles.statLabel}>ଅଧିକ/କମ</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noDataBox}>
              <Text style={styles.noDataEmoji}>🌐</Text>
              <Text style={styles.noDataOr}>ପାଣିପାଗ ତଥ୍ୟ ଉପଲବ୍ଧ ନାହିଁ</Text>
              <Text style={styles.noDataEn}>Weather data unavailable. Pull to refresh.</Text>
              <TouchableOpacity onPress={loadWeather} style={styles.retryBtn} activeOpacity={0.7}>
                <Text style={styles.retryText}>ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ / Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Hourly Forecast */}
        {weather?.hourly && weather.hourly.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: fs.base }]}>ଆଜି ଦିନସାରା</Text>
            <Text style={[styles.sectionSub, { fontSize: fs.xs }]}>Throughout today</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {weather.hourly.map((h, i) => {
                const hourNum = parseInt(h.time.split(':')[0] ?? '0', 10);
                const isAM = hourNum < 12;
                const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
                const ampm = isAM ? 'AM' : 'PM';
                return (
                  <View key={i} style={styles.hourCard}>
                    <Text style={styles.hourTime}>{displayHour}{ampm}</Text>
                    <Text style={styles.hourEmoji}>{getWeatherEmoji(h.icon)}</Text>
                    <Text style={styles.hourTemp}>{toOdiaNumerals(Math.round(h.temp))}°</Text>
                    <Text style={styles.hourCondOr}>{h.desc_or}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 7-Day Forecast */}
        {weather?.forecast_7day && weather.forecast_7day.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: fs.base }]}>୭ ଦିନର ପାଣିପାଗ</Text>
            <Text style={[styles.sectionSub, { fontSize: fs.xs }]}>7-day forecast</Text>
            <View style={styles.forecastCard}>
              {weather.forecast_7day.map((d, i) => {
                const date = new Date(d.date);
                const dow = date.getDay();
                const condWord = getConditionWord(d.condition, d.temp_high);
                return (
                  <View key={i} style={[styles.forecastRow, i > 0 && styles.forecastBorder]}>
                    <View style={styles.forecastDay}>
                      <Text style={styles.forecastDayOr}>{ODIA_DAYS_SHORT[dow]}</Text>
                      <Text style={styles.forecastDayEn}>{ENGLISH_DAYS[dow]}</Text>
                    </View>
                    <Text style={styles.forecastEmoji}>{getWeatherEmoji(d.icon)}</Text>
                    <Text style={styles.forecastCond}>{condWord.or}</Text>
                    <View style={styles.forecastTemps}>
                      <Text style={styles.forecastHigh}>{toOdiaNumerals(Math.round(d.temp_high))}°</Text>
                      <Text style={styles.forecastSep}>/</Text>
                      <Text style={styles.forecastLow}>{toOdiaNumerals(Math.round(d.temp_low))}°</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Agricultural Tips from Supabase agent */}
        {weather?.agri_tips && weather.agri_tips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌾 କୃଷି ପାଣିପାଗ</Text>
            <Text style={styles.sectionSub}>Agricultural advisory</Text>
            <View style={styles.agriCard}>
              {weather.agri_tips.map((tip, i) => (
                <View key={i} style={[styles.agriRow, i > 0 && styles.agriBorder]}>
                  <Text style={styles.agriEmoji}>{tip.icon}</Text>
                  <View style={styles.agriText}>
                    <Text style={styles.agriOr}>{tip.tip_or}</Text>
                    <Text style={styles.agriEn}>{tip.tip_en}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: FontSize.lg, fontFamily: 'NotoSansOdia-Bold', fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationBtn: { alignItems: 'flex-end' },
  locationText: { color: '#fff', fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', fontWeight: '600' },
  locationEn: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs },
  settingsBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingsIcon: { color: '#fff', fontSize: 18 },

  scroll: { paddingBottom: 16 },

  heroCard: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.md,
    marginTop: 12,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    elevation: 12,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    borderBottomWidth: 4,
    borderBottomColor: Colors.primaryDark,
  },
  staleBanner: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  staleText: { color: '#fff', fontSize: FontSize.xs, fontFamily: 'NotoSansOdia' },
  heroEmoji: { fontSize: 64, marginBottom: 8 },
  heroTempOr: { fontSize: 56, fontFamily: 'NotoSansOdia-Bold', fontWeight: '700', color: '#fff', lineHeight: 60 },
  heroTempEn: { fontSize: 18, color: 'rgba(255,255,255,0.75)', marginTop: -2, marginBottom: 2 },
  heroFeelsLike: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', marginTop: 4 },
  heroDescOr: { color: '#fff', fontSize: FontSize.lg, fontFamily: 'NotoSansOdia-Bold', marginTop: 12, fontWeight: '700', textAlign: 'center' },
  heroAdviceOr: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.base, fontFamily: 'NotoSansOdia', marginTop: 4, textAlign: 'center' },
  heroDescEn: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm, marginTop: 4, textAlign: 'center' },

  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    padding: 12,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 20 },
  statValue: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontFamily: 'NotoSansOdia', marginTop: 1 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 4 },

  noDataBox: { alignItems: 'center', paddingVertical: 24 },
  noDataEmoji: { fontSize: 48 },
  noDataOr: { color: '#fff', fontSize: FontSize.base, fontFamily: 'NotoSansOdia', marginTop: 12 },
  noDataEn: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, marginTop: 4 },
  retryBtn: {
    marginTop: 16, backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.full, paddingHorizontal: 20, paddingVertical: 10,
  },
  retryText: { color: '#fff', fontSize: FontSize.sm, fontFamily: 'NotoSansOdia' },

  section: { marginHorizontal: Spacing.md, marginTop: 16 },
  sectionTitle: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia-Bold', color: Colors.text, fontWeight: '700', marginBottom: 2 },
  sectionSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1, marginBottom: 8 },

  hourCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    marginRight: 10,
    minWidth: 76,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  hourTime: { fontSize: FontSize.xs, color: Colors.textSecondary },
  hourEmoji: { fontSize: 26, marginVertical: 4 },
  hourTemp: { fontSize: FontSize.base, fontWeight: '700', color: Colors.text },
  hourCondOr: { fontSize: 11, fontFamily: 'NotoSansOdia', color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },

  forecastCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    gap: 10,
  },
  forecastBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  forecastDay: { width: 48 },
  forecastDayOr: { fontSize: 13, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '700' },
  forecastDayEn: { fontSize: 10, color: Colors.textSecondary },
  forecastEmoji: { fontSize: 24, width: 34, textAlign: 'center' },
  forecastCond: { flex: 1, fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.textSecondary },
  forecastTemps: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  forecastHigh: { fontSize: FontSize.base, fontWeight: '700', color: Colors.primary },
  forecastSep: { fontSize: FontSize.sm, color: Colors.textSecondary },
  forecastLow: { fontSize: FontSize.base, color: Colors.primary },

  agriCard: {
    backgroundColor: Colors.secondary + '15',
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },
  agriRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: 10,
  },
  agriBorder: { borderTopWidth: 1, borderTopColor: Colors.secondary + '20' },
  agriEmoji: { fontSize: 22, marginTop: 2 },
  agriText: { flex: 1 },
  agriOr: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.secondary, fontWeight: '600' },
  agriEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
