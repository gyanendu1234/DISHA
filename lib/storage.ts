import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  DISTRICT_ID:       'disha:district_id',
  LANGUAGE:          'disha:language',
  FONT_SIZE:         'disha:font_size',
  NOTIF_FESTIV:      'disha:notif_festival',
  NOTIF_HOLIDAY:     'disha:notif_holiday',
  NOTIF_WEATHER:     'disha:notif_weather',
  ONBOARDED:         'disha:onboarded',
  WEATHER_CACHE:     'disha:weather_cache',
  WEATHER_TS:        'disha:weather_ts',
  // Messaging
  USER_PROFILE:      'disha:user_profile',
  LINKED_USER:       'disha:linked_user',
  LINKED_USERS:      'disha:linked_users',
  MSG_INBOX_CACHE:   'disha:msg_inbox_cache',
};

// --- Settings ---

export async function saveDistrictId(id: number) {
  await AsyncStorage.setItem(KEYS.DISTRICT_ID, String(id));
}
export async function getDistrictId(): Promise<number | null> {
  const v = await AsyncStorage.getItem(KEYS.DISTRICT_ID);
  return v ? parseInt(v) : null;
}

export type Language = 'both' | 'or' | 'en';
export async function saveLanguage(lang: Language) {
  await AsyncStorage.setItem(KEYS.LANGUAGE, lang);
}
export async function getLanguage(): Promise<Language> {
  return ((await AsyncStorage.getItem(KEYS.LANGUAGE)) ?? 'both') as Language;
}

export type FontSizeKey = 'small' | 'medium' | 'large';
export async function saveFontSize(size: FontSizeKey) {
  await AsyncStorage.setItem(KEYS.FONT_SIZE, size);
}
export async function getFontSize(): Promise<FontSizeKey> {
  return ((await AsyncStorage.getItem(KEYS.FONT_SIZE)) ?? 'medium') as FontSizeKey;
}

export async function saveNotifPrefs(prefs: {
  festival: boolean;
  holiday: boolean;
  weather: boolean;
}) {
  await AsyncStorage.multiSet([
    [KEYS.NOTIF_FESTIV,  String(prefs.festival)],
    [KEYS.NOTIF_HOLIDAY, String(prefs.holiday)],
    [KEYS.NOTIF_WEATHER, String(prefs.weather)],
  ]);
}
export async function getNotifPrefs() {
  const vals = await AsyncStorage.multiGet([
    KEYS.NOTIF_FESTIV, KEYS.NOTIF_HOLIDAY, KEYS.NOTIF_WEATHER,
  ]);
  return {
    festival: vals[0][1] !== 'false',
    holiday:  vals[1][1] !== 'false',
    weather:  vals[2][1] !== 'false',
  };
}

export async function setOnboarded() {
  await AsyncStorage.setItem(KEYS.ONBOARDED, 'true');
}
export async function isOnboarded(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.ONBOARDED)) === 'true';
}

// --- Weather cache (so offline shows last fetch) ---

export async function cacheWeather(districtId: number, data: object) {
  await AsyncStorage.setItem(`${KEYS.WEATHER_CACHE}:${districtId}`, JSON.stringify(data));
  await AsyncStorage.setItem(`${KEYS.WEATHER_TS}:${districtId}`, Date.now().toString());
}

export async function getCachedWeather(districtId: number): Promise<{
  data: object | null;
  ageMinutes: number;
}> {
  const raw = await AsyncStorage.getItem(`${KEYS.WEATHER_CACHE}:${districtId}`);
  const ts = await AsyncStorage.getItem(`${KEYS.WEATHER_TS}:${districtId}`);
  if (!raw || !ts) return { data: null, ageMinutes: Infinity };
  const ageMinutes = (Date.now() - parseInt(ts)) / 60000;
  return { data: JSON.parse(raw), ageMinutes };
}

// --- User profile (messaging) ---

export interface StoredUserProfile {
  id: string;
  name: string;
  role: string;
  link_code?: string;
}

export async function saveUserProfile(profile: StoredUserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function getUserProfile(): Promise<StoredUserProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return raw ? (JSON.parse(raw) as StoredUserProfile) : null;
}

export interface StoredLinkedUser {
  id: string;
  name: string;
}

export async function saveLinkedUser(user: StoredLinkedUser): Promise<void> {
  await AsyncStorage.setItem(KEYS.LINKED_USER, JSON.stringify(user));
}

export async function getLinkedUser(): Promise<StoredLinkedUser | null> {
  const raw = await AsyncStorage.getItem(KEYS.LINKED_USER);
  return raw ? (JSON.parse(raw) as StoredLinkedUser) : null;
}

export async function saveLinkedMembers(members: StoredLinkedUser[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.LINKED_USERS, JSON.stringify(members));
}

export async function getLinkedMembers(): Promise<StoredLinkedUser[]> {
  const raw = await AsyncStorage.getItem(KEYS.LINKED_USERS);
  if (raw) return JSON.parse(raw) as StoredLinkedUser[];
  // Migrate from single linked user
  const single = await getLinkedUser();
  if (single) return [single];
  return [];
}

export async function cacheInbox(messages: object[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.MSG_INBOX_CACHE, JSON.stringify(messages));
}

export async function getCachedInbox(): Promise<object[]> {
  const raw = await AsyncStorage.getItem(KEYS.MSG_INBOX_CACHE);
  return raw ? (JSON.parse(raw) as object[]) : [];
}

// --- Load all prefs at once ---
export async function loadAllPrefs() {
  const [districtId, language, fontSize, notifs, onboarded] = await Promise.all([
    getDistrictId(),
    getLanguage(),
    getFontSize(),
    getNotifPrefs(),
    isOnboarded(),
  ]);
  return { districtId, language, fontSize, notifs, onboarded };
}
