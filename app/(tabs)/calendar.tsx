import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  StyleSheet, ActivityIndicator, StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePanjikaStore } from '@/store/usePanjikaStore';
import { ODIA_MONTHS_OR, ODIA_MONTHS_EN, toOdiaNumerals } from '@/constants/odia';
import type { LunarEvent, OdiaFestival, AuspiciousDate } from '@/lib/panjikaService';
import { FESTIVALS_2026 } from '@/constants/festivals';

// Fallback Odia name map built from local constants + supplementary list
const FEST_OR_MAP: Record<string, string> = {
  ...Object.fromEntries(FESTIVALS_2026.map(f => [f.name_en.toLowerCase(), f.name_or])),
  // Common festivals
  'ram navami': 'ରାମ ନବମୀ',
  'hanuman jayanti': 'ହନୁମାନ ଜୟନ୍ତୀ',
  'navratri': 'ନବରାତ୍ରି',
  'janmashtami': 'ଜନ୍ମଷ୍ଟମୀ',
  'raksha bandhan': 'ରକ୍ଷା ବନ୍ଧନ',
  'onam': 'ଓଣମ',
  'muharram': 'ମହରମ',
  'milad-un-nabi': 'ମିଲାଦ-ଉନ-ନବୀ',
  'id-ul-fitr (eid)': 'ଈଦ ଉଲ ଫ଼ିତ୍ର',
  'id-ul-zuha (bakri eid)': 'ଇଦ ଉଲ ଜୁହା',
  'basant panchami': 'ବସନ୍ତ ପଞ୍ଚମୀ',
  'vasant panchami': 'ବସନ୍ତ ପଞ୍ଚମୀ',
  'mahashivratri': 'ମହା ଶିବ ରାତ୍ରି',
  'maha shivratri': 'ମହା ଶିବ ରାତ୍ରି',
  'maha shivaratri': 'ମହା ଶିବ ରାତ୍ରି',
  'holi': 'ହୋଲି',
  'republic day': 'ଗଣତନ୍ତ୍ର ଦିବସ',
  'independence day': 'ସ୍ୱାଧୀନତା ଦିବସ',
  'gandhi jayanti': 'ଗାନ୍ଧି ଜୟନ୍ତୀ',
  'christmas day': 'ଖ୍ରୀଷ୍ଟ ଜନ୍ମ ଦିବସ',
  'christmas': 'ଖ୍ରୀଷ୍ଟ ଜନ୍ମ ଦିବସ',
  'good friday': 'ଗୁଡ଼ ଫ୍ରାଇଡ଼େ',
  'buddha purnima': 'ବୁଦ୍ଧ ପୂର୍ଣ୍ଣିମା',
  'may day': 'ମେ ଦିବସ',
  'rath yatra': 'ରଥ ଯାତ୍ରା',
  'guru nanak jayanti': 'ଗୁରୁ ନାନକ ଜୟନ୍ତୀ',
  'jagannath jayanti': 'ଶ୍ରୀ ଜଗନ୍ନାଥ ଜୟନ୍ତୀ',
  'kumar purnima': 'କୁମାର ପୂର୍ଣ୍ଣିମା',
  'durga puja': 'ଦୁର୍ଗା ପୂଜା',
  'diwali': 'ଦୀପାବଳୀ',
  'ganesh chaturthi': 'ଗଣେଶ ଚତୁର୍ଥୀ',
  'dr. ambedkar jayanti': 'ଡ଼ଃ ଆମ୍ବେଦକର ଜୟନ୍ତୀ',
  'ambedkar jayanti': 'ଡ଼ଃ ଆମ୍ବେଦକର ଜୟନ୍ତୀ',
  'nuakhai': 'ନୁଆଖାଇ',
  'pana sankranti': 'ପଣା ସଂକ୍ରାନ୍ତି',
  'makar sankranti': 'ମକର ସଂକ୍ରାନ୍ତି',
  'savitri brata': 'ସାବିତ୍ରୀ ବ୍ରତ',
  'raja parbam': 'ରଜ ପର୍ବ',
  // Monthly recurring
  'pradosh vrat': 'ପ୍ରଦୋଷ ବ୍ରତ',
  'pradosh': 'ପ୍ରଦୋଷ ବ୍ରତ',
  'sankashti chaturthi': 'ସଂକଷ୍ଟୀ ଚତୁର୍ଥୀ',
  'kalashtami': 'କାଳ ଅଷ୍ଟମୀ',
  'kal ashtami': 'କାଳ ଅଷ୍ଟମୀ',
  'masik shivaratri': 'ମାସିକ ଶିବ ରାତ୍ରି',
  'masik shivratri': 'ମାସିକ ଶିବ ରାତ୍ରି',
  // Sankrantis
  'mesha sankranti': 'ମେଷ ସଂକ୍ରାନ୍ତି',
  'maha vishuba sankranti': 'ମହା ବିଷୁବ ସଂକ୍ରାନ୍ତି',
  'vrishabha sankranti': 'ବୃଷଭ ସଂକ୍ରାନ୍ତି',
  'mithuna sankranti': 'ମିଥୁନ ସଂକ୍ରାନ୍ତି',
  'karka sankranti': 'କର୍କ ସଂକ୍ରାନ୍ତି',
  'simha sankranti': 'ସିଂହ ସଂକ୍ରାନ୍ତି',
  'kanya sankranti': 'କନ୍ୟା ସଂକ୍ରାନ୍ତି',
  'tula sankranti': 'ତୁଳା ସଂକ୍ରାନ୍ତି',
  'vrischika sankranti': 'ବୃଶ୍ଚିକ ସଂକ୍ରାନ୍ତି',
  'dhanu sankranti': 'ଧନୁ ସଂକ୍ରାନ୍ତି',
  'makara sankranti': 'ମକର ସଂକ୍ରାନ୍ତି',
  'kumbha sankranti': 'କୁମ୍ଭ ସଂକ୍ରାନ୍ତି',
  'meena sankranti': 'ମୀନ ସଂକ୍ରାନ୍ତି',
  // Jayantis
  'mahavir jayanti': 'ମହାବୀର ଜୟନ୍ତୀ',
  'guru purnima': 'ଗୁରୁ ପୂର୍ଣ୍ଣିମା',
  // Monthly Purnimas
  'chaitra purnima': 'ଚୈତ୍ର ପୂର୍ଣ୍ଣିମା',
  'vaishakhi purnima': 'ବୈଶାଖ ପୂର୍ଣ୍ଣିମା',
  'jyeshtha purnima': 'ଜ୍ୟୋଷ୍ଠ ପୂର୍ଣ୍ଣିମା',
  'ashadha purnima': 'ଆଷାଢ଼ ପୂର୍ଣ୍ଣିମା',
  'shravana purnima': 'ଶ୍ରାବଣ ପୂର୍ଣ୍ଣିମା',
  'bhadra purnima': 'ଭାଦ୍ର ପୂର୍ଣ୍ଣିମା',
  'ashvina purnima': 'ଆଶ୍ୱିନ ପୂର୍ଣ୍ଣିମା',
  'kartika purnima': 'କାର୍ତ୍ତିକ ପୂର୍ଣ୍ଣିମା',
  'margashirsha purnima': 'ମାର୍ଗ ପୂର୍ଣ୍ଣିମା',
  'pausha purnima': 'ପୌଷ ପୂର୍ଣ୍ଣିମା',
  'magha purnima': 'ମାଘ ପୂର୍ଣ୍ଣିମା',
  'phalguna purnima': 'ଫାଲ୍ଗୁନ ପୂର୍ଣ୍ଣିମା',
  // Ekadashis
  'varuthini ekadashi': 'ବାରୁଥିନୀ ଏକାଦଶୀ',
  'mohini ekadashi': 'ମୋହିନୀ ଏକାଦଶୀ',
  'apara ekadashi': 'ଅପରା ଏକାଦଶୀ',
  'nirjala ekadashi': 'ନିର୍ଜଳ ଏକାଦଶୀ',
  'yogini ekadashi': 'ଯୋଗିନୀ ଏକାଦଶୀ',
  'devshayani ekadashi': 'ଦେବ ଶୟନ ଏକାଦଶୀ',
  'kamika ekadashi': 'କାମିକା ଏକାଦଶୀ',
  'putrada ekadashi': 'ପୁତ୍ରଦ ଏକାଦଶୀ',
  'aja ekadashi': 'ଅଜା ଏକାଦଶୀ',
  'parsva ekadashi': 'ପାର୍ଶ୍ୱ ଏକାଦଶୀ',
  'indira ekadashi': 'ଇନ୍ଦିରା ଏକାଦଶୀ',
  'papankusha ekadashi': 'ପାପଙ୍କୁଶ ଏକାଦଶୀ',
  'rama ekadashi': 'ରାମ ଏକାଦଶୀ',
  'devutthana ekadashi': 'ଦେବ ଉତ୍ଥାନ ଏକାଦଶୀ',
  'utpanna ekadashi': 'ଉତ୍ପନ୍ନ ଏକାଦଶୀ',
  'mokshada ekadashi': 'ମୋକ୍ଷଦ ଏକାଦଶୀ',
  'saphala ekadashi': 'ସଫ଼ଳ ଏକାଦଶୀ',
  'pausha putrada ekadashi': 'ପୌଷ ପୁତ୍ରଦ ଏକାଦଶୀ',
  'shattila ekadashi': 'ଷଟ୍‌ ତିଳ ଏକାଦଶୀ',
  'jaya ekadashi': 'ଜୟ ଏକାଦଶୀ',
  'vijaya ekadashi': 'ବିଜୟ ଏକାଦଶୀ',
  'amalaki ekadashi': 'ଆମଳକୀ ଏକାଦଶୀ',
  'papamochani ekadashi': 'ପାପ ମୋଚନୀ ଏକାଦଶୀ',
  'kamada ekadashi': 'କାମଦ ଏକାଦଶୀ',
  // Other Odia-specific
  'rath yatra (snana purnima)': 'ରଥ ଯାତ୍ରା',
  'bahuda yatra': 'ବହୁଦ ଯାତ୍ରା',
  'snana purnima': 'ସ୍ନାନ ପୂର୍ଣ୍ଣିମା',
  'raja': 'ରଜ ପର୍ବ',
  'odia new year': 'ଓଡ଼ିଆ ନୂଆ ବର୍ଷ',
  'chhath puja': 'ଛଠ ପୂଜା',
  'karva chauth': 'କର୍ବ ଚତୁର୍ଥ',
  'bhai dooj': 'ଭ୍ରାତୃ ଦ୍ୱିତୀୟ',
  'dhanteras': 'ଧନ ତ୍ରୟୋଦଶୀ',
  'laxmi puja': 'ଲକ୍ଷ୍ମୀ ପୂଜା',
  'saraswati puja': 'ସରସ୍ୱତୀ ପୂଜା',
  'vishwakarma puja': 'ବିଶ୍ୱକର୍ମା ପୂଜା',
  'akshaya tritiya': 'ଅକ୍ଷୟ ତୃତୀୟ',
  'ganga dussehra': 'ଗଙ୍ଗା ଦଶହରା',
  'nirjala ekadasi': 'ନିର୍ଜଳ ଏକାଦଶୀ',
};

function getFestOrName(f: OdiaFestival): string {
  if (f.festival_name_or) return f.festival_name_or;
  const lower = f.festival_name.toLowerCase();
  if (FEST_OR_MAP[lower]) return FEST_OR_MAP[lower];
  // Handle compound names like "A / B / C"
  if (lower.includes(' / ')) {
    const enParts = f.festival_name.split(' / ');
    const orParts = enParts.map(p => FEST_OR_MAP[p.trim().toLowerCase()] ?? null);
    if (orParts.some(Boolean)) {
      return orParts.map((p, i) => p ?? enParts[i]).join(' / ');
    }
  }
  return f.festival_name;
}

function hasFestOrName(f: OdiaFestival): boolean {
  if (f.festival_name_or || FEST_OR_MAP[f.festival_name.toLowerCase()]) return true;
  if (f.festival_name.toLowerCase().includes(' / ')) {
    return f.festival_name.toLowerCase().split(' / ').some(p => !!FEST_OR_MAP[p.trim()]);
  }
  return false;
}

// ── Tithi → Odia map ─────────────────────────────────────────────────────────
const TITHI_OR_MAP: Record<string, string> = {
  'pratipada': 'ପ୍ରଥମ', 'prathama': 'ପ୍ରଥମ', 'first': 'ପ୍ରଥମ',
  'dwitiya': 'ଦ୍ୱିତୀୟ', 'dvitiya': 'ଦ୍ୱିତୀୟ',
  'tritiya': 'ତୃତୀୟ',
  'chaturthi': 'ଚତୁର୍ଥୀ',
  'panchami': 'ପଞ୍ଚମୀ',
  'shashthi': 'ଷଷ୍ଠୀ', 'shashti': 'ଷଷ୍ଠୀ', 'sashti': 'ଷଷ୍ଠୀ',
  'saptami': 'ସପ୍ତମୀ',
  'ashtami': 'ଅଷ୍ଟମୀ',
  'navami': 'ନବମୀ',
  'dashami': 'ଦଶମୀ',
  'ekadashi': 'ଏକାଦଶୀ', 'ekadasi': 'ଏକାଦଶୀ',
  'dwadashi': 'ଦ୍ୱାଦଶୀ', 'dvadashi': 'ଦ୍ୱାଦଶୀ',
  'trayodashi': 'ତ୍ରୟୋଦଶୀ', 'trayodasi': 'ତ୍ରୟୋଦଶୀ', 'pradosh': 'ପ୍ରଦୋଷ',
  'chaturdashi': 'ଚତୁର୍ଦ୍ଦଶୀ',
  'purnima': 'ପୂର୍ଣ୍ଣିମା', 'poornima': 'ପୂର୍ଣ୍ଣିମା',
  'amavasya': 'ଅମାବାସ୍ୟା', 'amavasaya': 'ଅମାବାସ୍ୟା',
  'shukla': 'ଶୁକ୍ଳ', 'krishna': 'କୃଷ୍ଣ',
};

const NAKSHATRA_OR_MAP: Record<string, string> = {
  'ashwini': 'ଅଶ୍ୱିନୀ', 'aswini': 'ଅଶ୍ୱିନୀ',
  'bharani': 'ଭରଣୀ',
  'krittika': 'କୃତ୍ତିକା', 'kritika': 'କୃତ୍ତିକା',
  'rohini': 'ରୋହିଣୀ',
  'mrigashira': 'ମୃଗଶିରା', 'mrigasira': 'ମୃଗଶିରା', 'mrigsira': 'ମୃଗଶିରା',
  'ardra': 'ଆର୍ଦ୍ରା',
  'punarvasu': 'ପୁନର୍ବସୁ',
  'pushya': 'ପୁଷ୍ୟ', 'pushyami': 'ପୁଷ୍ୟ',
  'ashlesha': 'ଆଶ୍ଳେଷା', 'aslesha': 'ଆଶ୍ଳେଷା',
  'magha': 'ମଘା',
  'purva phalguni': 'ପୂର୍ବ ଫଲ୍ଗୁନୀ', 'purva falguni': 'ପୂର୍ବ ଫଲ୍ଗୁନୀ',
  'uttara phalguni': 'ଉତ୍ତର ଫଲ୍ଗୁନୀ', 'uttara falguni': 'ଉତ୍ତର ଫଲ୍ଗୁନୀ',
  'hasta': 'ହସ୍ତ',
  'chitra': 'ଚିତ୍ରା', 'chitta': 'ଚିତ୍ରା',
  'swati': 'ସ୍ୱାତୀ',
  'vishakha': 'ବିଶାଖା', 'visakha': 'ବିଶାଖା',
  'anuradha': 'ଅନୁରାଧ',
  'jyeshtha': 'ଜ୍ୟୋଷ୍ଠ', 'jyestha': 'ଜ୍ୟୋଷ୍ଠ',
  'mula': 'ମୂଳ', 'moola': 'ମୂଳ',
  'purva ashadha': 'ପୂର୍ବ ଆଷାଢ଼', 'purva ashada': 'ପୂର୍ବ ଆଷାଢ଼',
  'uttara ashadha': 'ଉତ୍ତର ଆଷାଢ଼', 'uttara ashada': 'ଉତ୍ତର ଆଷାଢ଼',
  'shravana': 'ଶ୍ରବଣ', 'shravan': 'ଶ୍ରବଣ', 'sravana': 'ଶ୍ରବଣ',
  'dhanishtha': 'ଧନିଷ୍ଠ', 'dhanistha': 'ଧନିଷ୍ଠ',
  'shatabhisha': 'ଶତଭିଷ', 'satabhisha': 'ଶତଭିଷ',
  'purva bhadrapada': 'ପୂର୍ବ ଭାଦ୍ର', 'purva bhadra': 'ପୂର୍ବ ଭାଦ୍ର',
  'uttara bhadrapada': 'ଉତ୍ତର ଭାଦ୍ର', 'uttara bhadra': 'ଉତ୍ତର ଭାଦ୍ର',
  'revati': 'ରେବତୀ',
  // Rashis
  'mesha': 'ମେଷ', 'aries': 'ମେଷ',
  'vrishabha': 'ବୃଷ', 'taurus': 'ବୃଷ',
  'mithuna': 'ମିଥୁନ', 'gemini': 'ମିଥୁନ',
  'karka': 'କର୍କ', 'cancer': 'କର୍କ',
  'simha': 'ସିଂହ', 'leo': 'ସିଂହ',
  'kanya': 'କନ୍ୟା', 'virgo': 'କନ୍ୟା',
  'tula': 'ତୁଳ', 'libra': 'ତୁଳ',
  'vrischika': 'ବୃଶ୍ଚିକ', 'scorpio': 'ବୃଶ୍ଚିକ',
  'dhanu': 'ଧନୁ', 'sagittarius': 'ଧନୁ',
  'makara': 'ମକର', 'capricorn': 'ମକର',
  'kumbha': 'କୁମ୍ଭ', 'aquarius': 'କୁମ୍ଭ',
  'meena': 'ମୀନ', 'pisces': 'ମୀନ',
};

function translateWord(word: string, map: Record<string, string>): string {
  return map[word.toLowerCase()] ?? word;
}

function translateTithi(tithi: string): string {
  // e.g. "Shukla Pratipada", "Krishna Ashtami", "Purnima"
  const parts = tithi.trim().split(/\s+/);
  return parts.map(p => translateWord(p, TITHI_OR_MAP)).join(' ');
}

function translateNakshatra(nakshatra: string): string {
  // e.g. "Rohini", "Rohini (Vrishabha)", "Purva Phalguni (Simha)"
  // Try full string first, then handle "(Rashi)" part
  const bracketMatch = nakshatra.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (bracketMatch) {
    const nakshatraOr = NAKSHATRA_OR_MAP[bracketMatch[1].trim().toLowerCase()] ?? bracketMatch[1].trim();
    const rashiOr = NAKSHATRA_OR_MAP[bracketMatch[2].trim().toLowerCase()] ?? bracketMatch[2].trim();
    return `${nakshatraOr} (${rashiOr})`;
  }
  // Check full multi-word keys first (e.g. "purva phalguni")
  const lower = nakshatra.trim().toLowerCase();
  if (NAKSHATRA_OR_MAP[lower]) return NAKSHATRA_OR_MAP[lower];
  // Word by word
  const parts = nakshatra.trim().split(/\s+/);
  return parts.map(p => translateWord(p, NAKSHATRA_OR_MAP)).join(' ');
}

function getLunarOrName(event: { event_name: string; event_name_or: string | null; event_type: string }): string {
  if (event.event_name_or) return event.event_name_or;
  // Try FEST_OR_MAP lookup
  const mapped = FEST_OR_MAP[event.event_name.toLowerCase()];
  if (mapped) return mapped;
  // Translate word by word using tithi map (covers sankranti, pradosh names)
  const parts = event.event_name.split(' / ');
  if (parts.length > 1) {
    const orParts = parts.map(p => FEST_OR_MAP[p.trim().toLowerCase()] ?? translateTithi(p.trim()));
    return orParts.join(' / ');
  }
  return translateTithi(event.event_name);
}

// ── Traditional Odia calendar colour palette (deep vermilion red) ─────────────
const P = {
  primary:       '#C41C1C',   // Traditional Odia calendar red (deep vermilion)
  dark:          '#8B1212',
  mid:           '#A81515',
  light:         '#F0A0A0',
  tint:          '#FAD5D5',
  pale:          '#FFF0F0',
  cream:         '#FFFAFA',
  pageBg:        '#EDE0E0',
  text:          '#660A0A',
  textRed:       '#A81515',
  border:        '#F08888',
  dotFestival:   '#9E1111',
  dotEkadashi:   '#6A1B9A',
  dotPurnima:    '#F57C00',
  dotAmavasya:   '#212121',
  dotAuspicious: '#1B7A34',
};

// ── Year info for 2026 (traditional Odia calendar eras) ──────────────────────
const YEAR_INFO_2026 = [
  { label: 'ସ୍ୱାଧୀନତାବ୍ଦ', value: '୭୯' },
  { label: 'ଶକାବ୍ଦ',       value: '୧୯୪୭/୪୮' },
  { label: 'ସମ୍ବତ',        value: '୨୦୮୨/୮୩' },
  { label: 'ଦିଲ୍ଲୀଶ୍ୱରାବ୍ଦ', value: '୧୪୩୩' },
  { label: 'କଳ୍ୟାବ୍ଦ',     value: '୫୧୨୭/୨୮' },
];

const DAY_LABELS = [
  { or: 'ରବି',  en: 'SUN' },
  { or: 'ସୋମ',  en: 'MON' },
  { or: 'ମଙ୍ଗ', en: 'TUE' },
  { or: 'ବୁଧ',  en: 'WED' },
  { or: 'ଗୁରୁ', en: 'THU' },
  { or: 'ଶୁକ୍ର', en: 'FRI' },
  { or: 'ଶନି',  en: 'SAT' },
];

const EN_MONTHS_FULL = [
  'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
  'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER',
];

const SCREEN_W = Dimensions.get('window').width;
const GRID_PADDING = 12;
const CELL_W = Math.floor((SCREEN_W - GRID_PADDING * 2) / 7);
const CELL_H = 58;

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NoDataBanner() {
  return (
    <View style={s.noDataBanner}>
      <Text style={s.noDataText}>
        ଏହି ମାସର ପଞ୍ଜିକା ତଥ୍ୟ ଶୀଘ୍ର ଯୋଡ଼ାଯିବ
      </Text>
      <Text style={s.noDataSub}>
        Panjika data for this month will be added soon
      </Text>
    </View>
  );
}

function InfoStrip({ year, month }: { year: number; month: number }) {
  const isCurrentYear = year === 2026;
  return (
    <View style={s.infoStrip}>
      <View style={s.infoCenter}>
        <Text style={s.infoMonthOr}>
          {ODIA_MONTHS_OR[month]} {toOdiaNumerals(year)}
        </Text>
        <Text style={s.infoMonthEn}>
          {EN_MONTHS_FULL[month]} {year}
        </Text>
      </View>

      {isCurrentYear && (
        <View style={s.infoYearRow}>
          {YEAR_INFO_2026.map(row => (
            <View key={row.label} style={s.infoYearItem}>
              <Text style={s.infoYearLabel}>{row.label}</Text>
              <Text style={s.infoYearValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

interface CellProps {
  day: number;
  isToday: boolean;
  isSelected: boolean;
  isSunday: boolean;
  hasFestival: boolean;
  hasEkadashi: boolean;
  hasPurnima: boolean;
  hasAmavasya: boolean;
  hasAuspicious: boolean;
  onPress: () => void;
}

function DayCell({
  day, isToday, isSelected, isSunday,
  hasFestival, hasEkadashi, hasPurnima, hasAmavasya, hasAuspicious,
  onPress,
}: CellProps) {
  const hasDots = hasFestival || hasEkadashi || hasPurnima || hasAmavasya || hasAuspicious;
  return (
    <TouchableOpacity
      style={[
        s.cell,
        isSunday && !isSelected && !isToday && s.cellSunday,
        isToday && !isSelected && s.cellToday,
        isSelected && s.cellSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[
        s.cellNumOr,
        isSelected && s.cellTextSelected,
        isToday && !isSelected && s.cellTextToday,
        isSunday && !isSelected && !isToday && s.cellTextSunday,
      ]}>
        {toOdiaNumerals(day)}
      </Text>
      <Text style={[
        s.cellNumEn,
        isSelected && s.cellTextSelected,
      ]}>
        {day}
      </Text>
      {hasDots && (
        <View style={s.dotsRow}>
          {hasFestival  && <View style={[s.dot, { backgroundColor: isSelected ? '#fff' : P.dotFestival }]} />}
          {hasEkadashi  && <View style={[s.dot, { backgroundColor: isSelected ? '#fff' : P.dotEkadashi }]} />}
          {hasPurnima   && <View style={[s.dot, { backgroundColor: isSelected ? '#fff' : P.dotPurnima  }]} />}
          {hasAmavasya  && <View style={[s.dot, { backgroundColor: isSelected ? '#fff' : P.dotAmavasya }]} />}
          {hasAuspicious && <View style={[s.dot, { backgroundColor: isSelected ? '#fff' : P.dotAuspicious }]} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

interface DayDetailProps {
  selectedDate: Date;
  tithi: string | null;
  nakshatra: string | null;
  lunarEvents: LunarEvent[];
  festivals: OdiaFestival[];
  auspicious: { date_type: string; subha_start: string | null; nakshatra: string | null }[];
}

function DayDetailCard({ selectedDate, tithi, nakshatra, lunarEvents, festivals, auspicious }: DayDetailProps) {
  const dow = DAY_LABELS[selectedDate.getDay()];
  const purnima   = lunarEvents.find(l => l.event_type === 'purnima');
  const amavasya  = lunarEvents.find(l => l.event_type === 'amavasya');
  const ekadashi  = lunarEvents.find(l => l.event_type === 'ekadashi');
  const sankranti = lunarEvents.find(l => l.event_type === 'sankranti');
  const pradosh   = lunarEvents.find(l => l.event_type === 'pradosh');
  const hasInfo = tithi || nakshatra || lunarEvents.length > 0 || festivals.length > 0 || auspicious.length > 0;

  return (
    <View style={s.detailCard}>
      {/* Header */}
      <View style={s.detailHeader}>
        <View>
          <Text style={s.detailDateOr}>
            {ODIA_MONTHS_OR[selectedDate.getMonth()]} {toOdiaNumerals(selectedDate.getDate())} · {dow.or}
          </Text>
          <Text style={s.detailDateEn}>
            {EN_MONTHS_FULL[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()} · {dow.en}
          </Text>
        </View>
      </View>
      <View style={s.detailDivider} />

      {!hasInfo ? (
        <Text style={s.detailEmpty}>ଏହି ଦିନ ପାଇଁ ତଥ୍ୟ ଶୀଘ୍ର ଯୋଡ଼ାଯିବ</Text>
      ) : (
        <>
          {/* Tithi */}
          {!!tithi && (
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>ତିଥି</Text>
              <Text style={s.detailValue}>{translateTithi(tithi)}</Text>
            </View>
          )}

          {/* Nakshatra */}
          {!!nakshatra && (
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>ନକ୍ଷତ୍ର / ରାଶି</Text>
              <Text style={s.detailValue}>{translateNakshatra(nakshatra)}</Text>
            </View>
          )}

          {/* Special lunar banners — significance hidden (English-only DB field) */}
          {purnima && (
            <View style={[s.specialBanner, { borderLeftColor: P.dotPurnima }]}>
              <Text style={[s.specialBannerText, { color: P.dotPurnima }]}>
                ◯ {getLunarOrName(purnima)}
              </Text>
              <Text style={s.specialBannerEn}>{purnima.event_name}</Text>
            </View>
          )}
          {amavasya && (
            <View style={[s.specialBanner, { borderLeftColor: P.dotAmavasya }]}>
              <Text style={[s.specialBannerText, { color: P.dotAmavasya }]}>
                ● {getLunarOrName(amavasya)}
              </Text>
              <Text style={s.specialBannerEn}>{amavasya.event_name}</Text>
            </View>
          )}
          {ekadashi && (
            <View style={[s.specialBanner, { borderLeftColor: P.dotEkadashi }]}>
              <Text style={[s.specialBannerText, { color: P.dotEkadashi }]}>
                ☽ {getLunarOrName(ekadashi)}
              </Text>
              <Text style={s.specialBannerEn}>{ekadashi.event_name}</Text>
            </View>
          )}
          {sankranti && (
            <View style={[s.specialBanner, { borderLeftColor: P.primary }]}>
              <Text style={[s.specialBannerText, { color: P.primary }]}>
                ✦ {getLunarOrName(sankranti)}
              </Text>
              <Text style={s.specialBannerEn}>{sankranti.event_name}</Text>
            </View>
          )}
          {pradosh && (
            <View style={[s.specialBanner, { borderLeftColor: P.dotEkadashi }]}>
              <Text style={[s.specialBannerText, { color: P.dotEkadashi }]}>
                ☾ {getLunarOrName(pradosh)}
              </Text>
              <Text style={s.specialBannerEn}>{pradosh.event_name}</Text>
            </View>
          )}

          {/* Auspicious dates */}
          {auspicious.length > 0 && (
            <View style={[s.specialBanner, { borderLeftColor: P.dotAuspicious }]}>
              {auspicious.map((a, i) => (
                <View key={i}>
                  <Text style={[s.specialBannerText, { color: P.dotAuspicious }]}>
                    ✦ {a.date_type === 'marriage' ? 'ଶୁଭ ବିବାହ ମୁହୂର୍ତ' : 'ଗୃହ ପ୍ରବେଶ'}
                    {a.subha_start ? ` · ${a.subha_start}` : ''}
                  </Text>
                  <Text style={s.specialBannerEn}>
                    {a.date_type === 'marriage' ? 'Auspicious Marriage Muhurta' : 'Griha Pravesh'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Festivals — Odia first, English below */}
          {festivals.length > 0 && (
            <View style={s.festivalBlock}>
              <Text style={s.festivalBlockHeader}>ପର୍ବଦିନ</Text>
              <Text style={s.festivalBlockHeaderEn}>Festival</Text>
              {festivals.map(f => (
                <View key={f.id} style={s.festivalBlockRow}>
                  <Text style={s.festivalBullet}>•</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.festivalBlockText}>
                      {getFestOrName(f)}
                    </Text>
                    {hasFestOrName(f) && (
                      <Text style={s.festivalBlockTextEn}>{f.festival_name}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

// ── Filter definitions ────────────────────────────────────────────────────────

type FilterKey = 'all' | 'festival' | 'marriage' | 'griha';

const PARBADINA_FILTERS: { key: FilterKey; or: string; en: string }[] = [
  { key: 'all',      or: 'ସବୁ',           en: 'All' },
  { key: 'festival', or: 'ପର୍ବ',          en: 'Festival' },
  { key: 'marriage', or: 'ଶୁଭ ବିବାହ',    en: 'Marriage' },
  { key: 'griha',    or: 'ଗୃହ ପ୍ରବେଶ',   en: 'House Entry' },
];

interface ParbadinaProps {
  festivals: OdiaFestival[];
  auspicious: AuspiciousDate[];
  onFestivalPress: (f: OdiaFestival) => void;
}

function ParbadinaList({ festivals, auspicious, onFestivalPress }: ParbadinaProps) {
  const [filter, setFilter] = useState<FilterKey>('all');

  // Filtered festivals
  const visibleFestivals = filter === 'festival' || filter === 'all' ? festivals : [];

  // Filtered auspicious
  const visibleAusp = auspicious.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'marriage') return a.date_type === 'marriage';
    if (filter === 'griha') return a.date_type === 'griha_pravesh';
    return false; // 'festival' filter hides auspicious
  });

  // Group by day
  const byDay: Record<number, OdiaFestival[]> = {};
  for (const f of visibleFestivals) {
    const d = new Date(f.iso_date).getUTCDate();
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(f);
  }

  const auspByDay: Record<number, { label_or: string; label_en: string }[]> = {};
  for (const a of visibleAusp) {
    const d = new Date(a.iso_date).getUTCDate();
    if (!auspByDay[d]) auspByDay[d] = [];
    auspByDay[d].push({
      label_or: a.date_type === 'marriage' ? 'ଶୁଭ ବିବାହ ମୁହୂର୍ତ' : 'ଗୃହ ପ୍ରବେଶ',
      label_en: a.date_type === 'marriage' ? 'Auspicious Marriage' : 'Griha Pravesh',
    });
  }

  const allDays = Array.from(new Set([
    ...Object.keys(byDay).map(Number),
    ...Object.keys(auspByDay).map(Number),
  ])).sort((a, b) => a - b);

  const isEmpty = allDays.length === 0;

  return (
    <View style={s.parbadina}>
      {/* Header */}
      <View style={s.parbadinaHeaderRow}>
        <Text style={s.parbadinaTitle}>ପର୍ବଦିନ</Text>
        <Text style={s.parbadinaTitleEn}>Festivals & Events</Text>
      </View>

      {/* ── Filter chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterScrollRow}
        contentContainerStyle={s.filterScrollContent}
      >
        {PARBADINA_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[s.filterChip, filter === f.key && s.filterChipActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.75}
          >
            <Text style={[s.filterChipOr, filter === f.key && s.filterChipTextActive]}>
              {f.or}
            </Text>
            <Text style={[s.filterChipEn, filter === f.key && s.filterChipTextActive]}>
              {f.en}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {isEmpty ? (
        <View style={s.parbadinaEmpty}>
          <Text style={s.parbadinaEmptyFlower}>✿</Text>
          <Text style={s.parbadinaEmptyText}>
            {filter === 'all' ? 'ପର୍ବଦିନ ତଥ୍ୟ ଶୀଘ୍ର ଯୋଡ଼ାଯିବ' :
             filter === 'marriage' ? 'ଏହି ମାସରେ ଶୁଭ ବିବାହ ଦିନ ନାହିଁ' :
             filter === 'griha' ? 'ଏହି ମାସରେ ଗୃହ ପ୍ରବେଶ ଦିନ ନାହିଁ' :
             'ଏହି ମାସରେ ପର୍ବ ନାହିଁ'}
          </Text>
          <Text style={s.parbadinaEmptySub}>
            {filter === 'all' ? 'Festival data pending' :
             filter === 'marriage' ? 'No marriage dates this month' :
             filter === 'griha' ? 'No griha pravesh dates this month' :
             'No festivals this month'}
          </Text>
        </View>
      ) : (
        allDays.map(day => (
          <View key={day} style={s.parbadinaGroup}>
            {/* Festival rows — Odia first, English below */}
            {(byDay[day] ?? []).map(f => (
              <TouchableOpacity
                key={f.id}
                style={s.parbadinaRow}
                onPress={() => onFestivalPress(f)}
                activeOpacity={0.7}
              >
                <View style={s.parbadinaDateCol}>
                  <Text style={s.parbadinaDayPrefix}>ତା</Text>
                  <Text style={s.parbadinaDayNum}>{toOdiaNumerals(day)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.parbadinaText}>
                    {getFestOrName(f)}
                  </Text>
                  {hasFestOrName(f) && (
                    <Text style={s.parbadinaTextEn}>{f.festival_name}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            {/* Auspicious rows */}
            {(auspByDay[day] ?? []).map((item, i) => (
              <View key={`ausp-${i}`} style={s.parbadinaRow}>
                <View style={s.parbadinaDateCol}>
                  <Text style={s.parbadinaDayPrefix}>ତା</Text>
                  <Text style={[s.parbadinaDayNum, { color: P.dotAuspicious }]}>
                    {toOdiaNumerals(day)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.parbadinaText, { color: P.dotAuspicious }]}>
                    ✦ {item.label_or}
                  </Text>
                  <Text style={[s.parbadinaTextEn, { color: P.dotAuspicious }]}>
                    {item.label_en}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function PanjikaScreen() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);

  const [viewYear,     setViewYear]     = useState(today.getFullYear());
  const [viewMonth,    setViewMonth]    = useState(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState(today);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayDetail,   setShowDayDetail]   = useState(false);
  const [festivalModal,   setFestivalModal]   = useState<OdiaFestival | null>(null);

  const { getMonthData, loadMonth, loading } = usePanjikaStore();

  const dbMonth = viewMonth + 1;

  useEffect(() => {
    loadMonth(viewYear, dbMonth);
  }, [viewYear, dbMonth]);

  const monthData = getMonthData(viewYear, dbMonth);

  const daysInMonth = useMemo(
    () => new Date(viewYear, viewMonth + 1, 0).getDate(),
    [viewYear, viewMonth],
  );
  const firstDow = useMemo(
    () => new Date(viewYear, viewMonth, 1).getDay(),
    [viewYear, viewMonth],
  );

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }, [viewMonth]);

  const goToToday = useCallback(() => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(today);
  }, [today]);

  // Derived data for selected date
  const selDay   = selectedDate.getDate();
  const selData  = monthData?.days[selDay] ?? null;
  const selLunar = (monthData?.lunarByDay[selDay] ?? []) as LunarEvent[];
  const selFests = (monthData?.festivalsByDay[selDay] ?? []) as OdiaFestival[];
  const selAusp  = monthData?.auspiciousByDay[selDay] ?? [];

  // Reset selected date when month view changes
  useEffect(() => {
    const inView = selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth;
    if (!inView) setSelectedDate(new Date(viewYear, viewMonth, 1));
  }, [viewYear, viewMonth]);

  function handleDayPress(date: Date) {
    setSelectedDate(date);
    setShowDayDetail(true);
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={P.primary} />

      {/* ── App Header ── */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View style={s.headerTopLeft}>
            <Text style={s.headerTitleOr}>ଓଡ଼ିଆ ପଞ୍ଜିକା</Text>
            <Text style={s.headerTitleEn}>ODIA PANJIKA · {viewYear}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings' as any)} style={s.settingsBtn} activeOpacity={0.8}>
            <Text style={s.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>
        <View style={s.headerNav}>
          <TouchableOpacity style={s.navCircleBtn} onPress={prevMonth} activeOpacity={0.75}>
            <Text style={s.navCircleTxt}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.monthDropdown}
            onPress={() => setShowMonthPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={s.monthDropdownOr} numberOfLines={1}>
              {ODIA_MONTHS_OR[viewMonth]} {toOdiaNumerals(viewYear)}
            </Text>
            <Text style={s.monthDropdownEn}>
              {ODIA_MONTHS_EN[viewMonth].toUpperCase()} ▾
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.todayBtn} onPress={goToToday} activeOpacity={0.8}>
            <Text style={s.todayBtnTxt}>ଆଜି</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.navCircleBtn} onPress={nextMonth} activeOpacity={0.75}>
            <Text style={s.navCircleTxt}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {monthData && !monthData.hasData && <NoDataBanner />}

        {!monthData && loading && (
          <ActivityIndicator color={P.primary} style={{ marginVertical: 24 }} />
        )}

        {/* ── Panjika Card ── */}
        <View style={s.panjikaCard}>
          <InfoStrip year={viewYear} month={viewMonth} />
          <View style={s.cardDivider} />

          {/* Tap hint */}
          <Text style={s.tapHint}>ଦିନ ଉପରେ ଚାପନ୍ତୁ ବିବରଣ ଦେଖିବା ପାଇଁ · Tap a date for details</Text>

          {/* Day column headers */}
          <View style={s.dayHeaderRow}>
            {DAY_LABELS.map((d, i) => (
              <View key={i} style={[s.dayHeaderCell, i === 0 && s.dayHeaderSunday]}>
                <Text style={[s.dayHeaderOr, i === 0 && s.daySundayText]}>{d.or}</Text>
                <Text style={[s.dayHeaderEn, i === 0 && s.daySundayText]}>{d.en}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={s.grid}>
            {Array.from({ length: firstDow }).map((_, i) => (
              <View key={`e${i}`} style={s.emptyCell} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day  = i + 1;
              const date = new Date(viewYear, viewMonth, day);
              const dow  = date.getDay();
              const lunarEvents = monthData?.lunarByDay[day] ?? [];
              const lunarTypes  = new Set(lunarEvents.map(l => l.event_type));

              return (
                <DayCell
                  key={day}
                  day={day}
                  isToday={isSameDay(date, today)}
                  isSelected={isSameDay(date, selectedDate)}
                  isSunday={dow === 0}
                  hasFestival={!!monthData?.festivalsByDay[day]}
                  hasEkadashi={lunarTypes.has('ekadashi')}
                  hasPurnima={lunarTypes.has('purnima')}
                  hasAmavasya={lunarTypes.has('amavasya')}
                  hasAuspicious={!!monthData?.auspiciousByDay[day]}
                  onPress={() => handleDayPress(date)}
                />
              );
            })}

            {(() => {
              const lastDow = new Date(viewYear, viewMonth, daysInMonth).getDay();
              const trail = lastDow === 6 ? 0 : 6 - lastDow;
              return Array.from({ length: trail }).map((_, i) => (
                <View key={`t${i}`} style={s.emptyCell} />
              ));
            })()}
          </View>

          {/* Dot legend */}
          <View style={s.legend}>
            <View style={s.legendItem}>
              <View style={[s.dot, { backgroundColor: P.dotFestival }]} />
              <Text style={s.legendText}>ପର୍ବ</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.dot, { backgroundColor: P.dotEkadashi }]} />
              <Text style={s.legendText}>ଏକାଦଶୀ</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.dot, { backgroundColor: P.dotPurnima }]} />
              <Text style={s.legendText}>ପୂର୍ଣ୍ଣିମା</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.dot, { backgroundColor: P.dotAmavasya }]} />
              <Text style={s.legendText}>ଅମାବାସ୍ୟା</Text>
            </View>
            <View style={s.legendItem}>
              <View style={[s.dot, { backgroundColor: P.dotAuspicious }]} />
              <Text style={s.legendText}>ଶୁଭ</Text>
            </View>
          </View>
        </View>

        {/* Parbadina (festival list with filter) */}
        <ParbadinaList
          festivals={monthData?.festivals ?? []}
          auspicious={monthData?.auspiciousDates ?? []}
          onFestivalPress={f => setFestivalModal(f)}
        />

        {/* Monthly notes hidden — DB content is English-only */}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            ଶୁଭ ଦିନ ନିର୍ଣ୍ଣୟ ଓଡ଼ିଆ ପଞ୍ଜିକାରୁ ମିଳାଅ ନିରନ୍ତର
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Day Detail Modal (tap a date) ── */}
      <Modal
        visible={showDayDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDayDetail(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDayDetail(false)}
        >
          <TouchableOpacity activeOpacity={1} style={s.dayDetailModalCard} onPress={() => {}}>
            {/* Drag handle */}
            <View style={s.dragHandle} />
            {/* Modal header */}
            <View style={s.dayDetailModalHeader}>
              <View>
                <Text style={s.dayDetailModalTitle}>ଦିନ ବିବରଣ</Text>
                <Text style={s.dayDetailModalSub}>Day Details</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDayDetail(false)}
                style={s.modalCloseBtn}
                activeOpacity={0.8}
              >
                <Text style={s.modalCloseBtnTxt}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
            >
              <DayDetailCard
                selectedDate={selectedDate}
                tithi={selData?.tithi ?? null}
                nakshatra={selData?.nakshatra ?? null}
                lunarEvents={selLunar}
                festivals={selFests}
                auspicious={selAusp}
              />
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── Month Picker Modal ── */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity
          style={s.modalOverlayCentered}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={s.pickerCard}>
            <Text style={s.pickerTitle}>ମାସ ବାଛନ୍ତୁ</Text>
            <Text style={s.pickerSub}>Select a month</Text>
            <View style={s.pickerMonthGrid}>
              {ODIA_MONTHS_OR.map((m, i) => {
                const isCurrent = i === viewMonth;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[s.pickerMonthCell, isCurrent && s.pickerMonthCellActive]}
                    onPress={() => {
                      setViewMonth(i);
                      setShowMonthPicker(false);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={[s.pickerMonthOr, isCurrent && s.pickerMonthTextActive]}>{m}</Text>
                    <Text style={[s.pickerMonthEn, isCurrent && s.pickerMonthTextActive]}>
                      {ODIA_MONTHS_EN[i].substring(0, 3).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={s.pickerYearRow}>
              <TouchableOpacity onPress={() => setViewYear(y => y - 1)} style={s.pickerYearBtn}>
                <Text style={s.pickerYearArrow}>◀ {viewYear - 1}</Text>
              </TouchableOpacity>
              <Text style={s.pickerYearCurrent}>{viewYear}</Text>
              <TouchableOpacity onPress={() => setViewYear(y => y + 1)} style={s.pickerYearBtn}>
                <Text style={s.pickerYearArrow}>{viewYear + 1} ▶</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Festival Detail Modal ── */}
      <Modal
        visible={!!festivalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setFestivalModal(null)}
      >
        <TouchableOpacity
          style={s.modalOverlayCentered}
          activeOpacity={1}
          onPress={() => setFestivalModal(null)}
        >
          <View style={s.festModalCard}>
            <View style={s.festModalHeader}>
              <Text style={s.festModalHeaderText}>ପର୍ବଦିନ</Text>
              <TouchableOpacity onPress={() => setFestivalModal(null)} style={s.modalCloseBtn}>
                <Text style={s.modalCloseBtnTxt}>✕</Text>
              </TouchableOpacity>
            </View>

            {festivalModal && (
              <View style={s.festModalBody}>
                <Text style={s.festModalDate}>
                  {ODIA_MONTHS_OR[new Date(festivalModal.iso_date).getUTCMonth()]}{' '}
                  {toOdiaNumerals(new Date(festivalModal.iso_date).getUTCDate())}
                </Text>
                {/* Odia name first, English below */}
                <Text style={s.festModalNameOr}>
                  {getFestOrName(festivalModal)}
                </Text>
                {hasFestOrName(festivalModal) && (
                  <Text style={s.festModalNameEn}>{festivalModal.festival_name}</Text>
                )}
                {/* significance hidden — English-only DB field */}
                <View style={s.festModalFlags}>
                  {festivalModal.is_national_holiday && (
                    <View style={s.festModalFlag}>
                      <Text style={s.festModalFlagText}>ଜାତୀୟ ଛୁଟି</Text>
                    </View>
                  )}
                  {festivalModal.is_odia_specific && (
                    <View style={[s.festModalFlag, { backgroundColor: P.pale }]}>
                      <Text style={[s.festModalFlagText, { color: P.dark }]}>ଓଡ଼ିଆ ପର୍ବ</Text>
                    </View>
                  )}
                  {festivalModal.is_bank_holiday && (
                    <View style={[s.festModalFlag, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={[s.festModalFlagText, { color: '#92400E' }]}>ବ୍ୟାଙ୍କ ଛୁଟି</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.pageBg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  // ── Header ──
  header: {
    backgroundColor: P.primary,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: P.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  headerTopLeft: { flex: 1, alignItems: 'center' },
  headerTitleOr: {
    color: '#fff', fontSize: 22,
    fontFamily: 'NotoSansOdia-Bold', fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitleEn: {
    color: 'rgba(255,255,255,0.75)', fontSize: 11,
    fontFamily: 'Poppins', letterSpacing: 2,
    marginTop: 1,
  },
  settingsBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingsIcon: { color: '#fff', fontSize: 18 },
  headerNav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 8,
  },
  navCircleBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  navCircleTxt: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 26 },
  monthDropdown: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10,
  },
  monthDropdownOr: {
    color: '#fff', fontSize: 15,
    fontFamily: 'NotoSansOdia-Bold', fontWeight: '700',
  },
  monthDropdownEn: {
    color: 'rgba(255,255,255,0.8)', fontSize: 10,
    fontFamily: 'Poppins', letterSpacing: 1.5,
  },
  todayBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12,
  },
  todayBtnTxt: {
    color: '#fff', fontSize: 13,
    fontFamily: 'NotoSansOdia-Bold', fontWeight: '700',
  },

  // ── No Data Banner ──
  noDataBanner: {
    margin: 12, backgroundColor: '#FFF8E1',
    borderRadius: 10, padding: 14,
    borderWidth: 2, borderColor: '#FFB300',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14, fontFamily: 'NotoSansOdia-Bold',
    color: '#6D4C00', textAlign: 'center', fontWeight: '700',
  },
  noDataSub: {
    fontSize: 12, fontFamily: 'Poppins',
    color: '#92400E', textAlign: 'center', marginTop: 4,
  },

  // ── Panjika Card ──
  panjikaCard: {
    margin: 12,
    backgroundColor: P.cream,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: P.primary,
    borderBottomWidth: 4,
    borderBottomColor: P.dark,
    shadowColor: P.mid,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  cardDivider: { height: 1.5, backgroundColor: P.border, marginHorizontal: 12 },

  // Tap hint
  tapHint: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Poppins',
    color: P.textRed,
    opacity: 0.7,
    paddingVertical: 6,
    letterSpacing: 0.3,
  },

  // ── Info Strip ──
  infoStrip: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
  infoCenter: { alignItems: 'center', marginBottom: 10 },
  infoMonthOr: {
    fontSize: 28, fontFamily: 'NotoSansOdia-Bold',
    color: P.textRed, fontWeight: '800',
  },
  infoMonthEn: {
    fontSize: 22, fontFamily: 'Poppins-SemiBold',
    color: P.dark, letterSpacing: 2.5, fontWeight: '700',
    marginTop: 2,
  },
  infoYearRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 4, justifyContent: 'center',
  },
  infoYearItem: {
    flexDirection: 'row', gap: 4,
    backgroundColor: P.pale,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: P.border,
  },
  infoYearLabel: { fontSize: 10, fontFamily: 'NotoSansOdia', color: P.text },
  infoYearValue: {
    fontSize: 10, fontFamily: 'NotoSansOdia-Bold',
    color: P.dark, fontWeight: '700',
  },

  // ── Day headers ──
  dayHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: GRID_PADDING,
    paddingTop: 6,
    paddingBottom: 4,
  },
  dayHeaderCell: { width: CELL_W, alignItems: 'center' },
  dayHeaderSunday: { backgroundColor: P.pale, borderRadius: 4 },
  dayHeaderOr: {
    fontSize: 12, fontFamily: 'NotoSansOdia-Bold',
    color: P.text, fontWeight: '700',
  },
  dayHeaderEn: { fontSize: 9, fontFamily: 'Poppins', color: P.text, letterSpacing: 0.8 },
  daySundayText: { color: P.dark },

  // ── Grid ──
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 10,
  },
  emptyCell: { width: CELL_W, height: CELL_H },
  cell: {
    width: CELL_W,
    height: CELL_H,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  cellSunday: { backgroundColor: P.pale },
  cellToday: {
    backgroundColor: '#FFE0E0',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: P.primary,
  },
  cellSelected: {
    backgroundColor: P.primary,
    borderRadius: 6,
  },
  cellNumOr: {
    fontSize: 20, fontFamily: 'NotoSansOdia-Bold',
    color: P.text, fontWeight: '700', lineHeight: 24,
  },
  cellNumEn: {
    fontSize: 9, fontFamily: 'Poppins',
    color: P.textRed, lineHeight: 12,
  },
  cellTextSelected: { color: '#fff' },
  cellTextToday: { color: P.dark, fontWeight: '800' },
  cellTextSunday: { color: P.dark },
  dotsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },

  // ── Legend ──
  legend: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 10,
    paddingHorizontal: 12, paddingTop: 6, paddingBottom: 12,
    borderTopWidth: 1, borderTopColor: P.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendText: { fontSize: 10, fontFamily: 'NotoSansOdia', color: P.text },

  // ── Day Detail Card (used inside modal) ──
  detailCard: {
    margin: 12,
    backgroundColor: P.cream,
    borderRadius: 10, borderWidth: 1.5, borderColor: P.border,
    borderBottomWidth: 3, borderBottomColor: P.primary,
    padding: 14,
  },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  detailDateOr: {
    fontSize: 17, fontFamily: 'NotoSansOdia-Bold',
    color: P.textRed, fontWeight: '700',
  },
  detailDateEn: {
    fontSize: 12, fontFamily: 'Poppins',
    color: P.text, marginTop: 2,
  },
  detailDivider: { height: 1, backgroundColor: P.border, marginVertical: 10 },
  detailEmpty: {
    fontSize: 13, fontFamily: 'NotoSansOdia',
    color: P.text, textAlign: 'center',
    paddingVertical: 16, opacity: 0.6,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingVertical: 5,
    borderBottomWidth: 1, borderBottomColor: P.pale,
  },
  detailLabel: {
    fontSize: 11, fontFamily: 'NotoSansOdia-Bold',
    color: P.primary, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.3,
    flex: 0.35,
  },
  detailValue: {
    fontSize: 14, fontFamily: 'NotoSansOdia',
    color: P.text, flex: 0.65, textAlign: 'right',
  },
  specialBanner: {
    marginTop: 8, padding: 10,
    backgroundColor: P.pale,
    borderRadius: 8, borderLeftWidth: 3,
  },
  specialBannerText: {
    fontSize: 14, fontFamily: 'NotoSansOdia-Bold', fontWeight: '700',
  },
  specialBannerEn: {
    fontSize: 11, fontFamily: 'Poppins',
    color: P.text, marginTop: 2, opacity: 0.75,
  },
  specialBannerSub: {
    fontSize: 12, fontFamily: 'NotoSansOdia',
    color: P.text, marginTop: 3, opacity: 0.8,
  },
  festivalBlock: {
    marginTop: 8, padding: 10,
    backgroundColor: P.pale,
    borderRadius: 8, borderLeftWidth: 3, borderLeftColor: P.primary,
  },
  festivalBlockHeader: {
    fontSize: 12, fontFamily: 'NotoSansOdia-Bold',
    color: P.primary, fontWeight: '700',
    marginBottom: 1,
  },
  festivalBlockHeaderEn: {
    fontSize: 10, fontFamily: 'Poppins-SemiBold',
    color: P.textRed, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 6,
  },
  festivalBlockRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 6 },
  festivalBullet: { fontSize: 14, color: P.primary, lineHeight: 22 },
  festivalBlockText: {
    fontSize: 14, fontFamily: 'NotoSansOdia-Bold',
    color: P.text, lineHeight: 22, fontWeight: '700',
  },
  festivalBlockTextEn: {
    fontSize: 11, fontFamily: 'Poppins',
    color: P.textRed, marginTop: 1, opacity: 0.8,
  },

  // ── Parbadina ──
  parbadina: {
    marginHorizontal: 12, marginBottom: 8,
    backgroundColor: P.cream,
    borderRadius: 10, borderWidth: 1.5, borderColor: P.border,
    borderBottomWidth: 3, borderBottomColor: P.primary,
    overflow: 'hidden',
    shadowColor: P.mid,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 8,
    elevation: 4,
  },
  parbadinaHeaderRow: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
    padding: 14, paddingBottom: 10,
    backgroundColor: P.pale,
    borderBottomWidth: 1.5, borderBottomColor: P.border,
  },
  parbadinaTitle: {
    fontSize: 19, fontFamily: 'NotoSansOdia-Bold',
    color: P.dark, fontWeight: '800',
  },
  parbadinaTitleEn: {
    fontSize: 12, fontFamily: 'Poppins-SemiBold',
    color: P.primary, fontWeight: '600',
  },

  // Filter chips
  filterScrollRow: {
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  filterScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: P.border,
    backgroundColor: P.pale,
  },
  filterChipActive: {
    backgroundColor: P.primary,
    borderColor: P.dark,
  },
  filterChipOr: {
    fontSize: 12, fontFamily: 'NotoSansOdia-Bold',
    color: P.text, fontWeight: '700',
  },
  filterChipEn: {
    fontSize: 9, fontFamily: 'Poppins',
    color: P.textRed, marginTop: 1,
  },
  filterChipTextActive: {
    color: '#fff',
  },

  parbadinaEmpty: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16 },
  parbadinaEmptyFlower: { fontSize: 36, color: P.light, marginBottom: 8 },
  parbadinaEmptyText: {
    fontSize: 14, fontFamily: 'NotoSansOdia',
    color: P.text, textAlign: 'center',
  },
  parbadinaEmptySub: {
    fontSize: 12, fontFamily: 'Poppins',
    color: P.text, opacity: 0.6, marginTop: 4,
  },
  parbadinaGroup: { borderBottomWidth: 0 },
  parbadinaRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 10, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: P.pale,
  },
  parbadinaDateCol: {
    width: 44, flexDirection: 'row', alignItems: 'baseline',
    gap: 2, paddingRight: 10,
    borderRightWidth: 1, borderRightColor: P.border,
    marginRight: 12,
  },
  parbadinaDayPrefix: {
    fontSize: 11, fontFamily: 'NotoSansOdia',
    color: P.primary, fontWeight: '600',
  },
  parbadinaDayNum: {
    fontSize: 14, fontFamily: 'NotoSansOdia-Bold',
    color: P.dark, fontWeight: '700',
  },
  parbadinaText: {
    fontSize: 14, fontFamily: 'NotoSansOdia-Bold',
    color: P.text, lineHeight: 22, fontWeight: '700',
  },
  parbadinaTextEn: {
    fontSize: 11, fontFamily: 'Poppins',
    color: P.textRed, marginTop: 1, opacity: 0.8,
  },

  // ── Monthly notes ──
  monthNotes: {
    marginHorizontal: 12, marginBottom: 8,
    backgroundColor: P.pale,
    borderRadius: 10, borderWidth: 1, borderColor: P.border,
    padding: 14,
  },
  monthNotesHeader: {
    fontSize: 13, fontFamily: 'NotoSansOdia-Bold',
    color: P.dark, fontWeight: '700', marginBottom: 6,
  },
  monthNotesText: {
    fontSize: 13, fontFamily: 'NotoSansOdia',
    color: P.text, lineHeight: 22,
  },

  // ── Footer ──
  footer: {
    marginHorizontal: 12, marginBottom: 4,
    padding: 12,
    borderTopWidth: 1, borderTopColor: P.border,
    alignItems: 'center',
    backgroundColor: P.cream,
    borderRadius: 8,
  },
  footerText: {
    fontSize: 11, fontFamily: 'NotoSansOdia',
    color: P.text, textAlign: 'center',
    fontStyle: 'italic', opacity: 0.7, lineHeight: 18,
  },

  // ── Modal overlays ──
  // Bottom-sheet overlay (day detail)
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(50,8,8,0.6)',
    alignItems: 'center', justifyContent: 'flex-end',
  },
  // Centered overlay (month picker, festival modal)
  modalOverlayCentered: {
    flex: 1, backgroundColor: 'rgba(50,8,8,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Day Detail Modal ──
  dragHandle: {
    width: 40, height: 4,
    backgroundColor: P.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10, marginBottom: 4,
  },
  dayDetailModalCard: {
    width: '100%',
    maxHeight: '82%',
    backgroundColor: P.cream,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    borderWidth: 1.5, borderBottomWidth: 0, borderColor: P.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
    overflow: 'hidden',
  },
  dayDetailModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: P.primary,
    paddingHorizontal: 20, paddingVertical: 14,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
  },
  dayDetailModalTitle: {
    fontSize: 18, fontFamily: 'NotoSansOdia-Bold',
    color: '#fff', fontWeight: '800',
  },
  dayDetailModalSub: {
    fontSize: 11, fontFamily: 'Poppins',
    color: 'rgba(255,255,255,0.75)', marginTop: 1,
  },
  dayDetailModalScroll: { flexShrink: 1 },

  // Close button (shared)
  modalCloseBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCloseBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // ── Month Picker Modal ──
  pickerCard: {
    width: '88%',
    backgroundColor: P.cream,
    borderRadius: 14, padding: 20,
    borderWidth: 2, borderColor: P.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3, shadowRadius: 40,
    elevation: 20,
  },
  pickerTitle: {
    fontSize: 20, fontFamily: 'NotoSansOdia-Bold',
    color: P.dark, fontWeight: '700', textAlign: 'center',
  },
  pickerSub: {
    fontSize: 12, fontFamily: 'Poppins',
    color: P.text, textAlign: 'center', marginBottom: 14,
  },
  pickerMonthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pickerMonthCell: {
    width: '22%', alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: P.pale, borderRadius: 8,
    borderWidth: 1, borderColor: P.border,
  },
  pickerMonthCellActive: { backgroundColor: P.primary, borderColor: P.dark },
  pickerMonthOr: { fontSize: 11, fontFamily: 'NotoSansOdia', color: P.text },
  pickerMonthEn: { fontSize: 9, fontFamily: 'Poppins', color: P.text, opacity: 0.7 },
  pickerMonthTextActive: { color: '#fff' },
  pickerYearRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 14,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: P.border,
  },
  pickerYearBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  pickerYearArrow: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: P.primary, fontWeight: '700' },
  pickerYearCurrent: { fontSize: 18, fontFamily: 'Poppins-SemiBold', color: P.dark, fontWeight: '700' },

  // ── Festival Detail Modal ──
  festModalCard: {
    width: '88%',
    backgroundColor: P.cream,
    borderRadius: 14,
    borderWidth: 2, borderColor: P.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3, shadowRadius: 40,
    elevation: 20,
  },
  festModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
    backgroundColor: P.primary,
  },
  festModalHeaderText: {
    fontSize: 18, fontFamily: 'NotoSansOdia-Bold',
    color: '#fff', fontWeight: '800',
  },
  festModalBody: { padding: 20 },
  festModalDate: {
    fontSize: 13, fontFamily: 'NotoSansOdia',
    color: P.primary, fontWeight: '600', marginBottom: 8,
  },
  festModalNameOr: {
    fontSize: 22, fontFamily: 'NotoSansOdia-Bold',
    color: P.text, fontWeight: '700', lineHeight: 32,
  },
  festModalNameEn: {
    fontSize: 14, fontFamily: 'Poppins',
    color: P.textRed, marginTop: 4,
  },
  festModalSig: {
    fontSize: 14, fontFamily: 'NotoSansOdia',
    color: P.text, lineHeight: 22, marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: P.border,
  },
  festModalFlags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  festModalFlag: {
    backgroundColor: '#FEE2E2',
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
  festModalFlagText: {
    fontSize: 11, fontFamily: 'NotoSansOdia-Bold',
    color: '#991B1B', fontWeight: '700',
  },
});
