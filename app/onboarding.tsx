import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { ODISHA_DISTRICTS } from '@/constants/districts';
import {
  saveDistrictId, saveLanguage, saveFontSize, saveNotifPrefs, setOnboarded as persistOnboarded,
  Language, FontSizeKey,
} from '@/lib/storage';
import { requestNotificationPermission } from '@/lib/notifications';
import { Colors, FontSize, Spacing, Radius } from '@/constants/theme';

const { width } = Dimensions.get('window');

type Step = 'welcome' | 'district' | 'language' | 'fontsize' | 'notifications' | 'done';

const STEPS: Step[] = ['welcome', 'district', 'language', 'fontsize', 'notifications', 'done'];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setDistrict, setLanguage, setFontSize, setNotifPrefs, setOnboarded } = useAppStore();

  const [step, setStep] = useState<Step>('welcome');
  const [selectedDistrict, setSelectedDistrict] = useState(ODISHA_DISTRICTS[18]); // Khordha default
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('both');
  const [selectedFontSize, setSelectedFontSize] = useState<FontSizeKey>('medium');
  const [notifAllowed, setNotifAllowed] = useState(true);
  const [districtSearch, setDistrictSearch] = useState('');

  const stepIndex = STEPS.indexOf(step);

  function nextStep() {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next);
  }

  function prevStep() {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev);
  }

  async function handleDistrictNext() {
    setDistrict(selectedDistrict);
    await saveDistrictId(selectedDistrict.id);
    nextStep();
  }

  async function handleLanguageNext() {
    setLanguage(selectedLanguage);
    await saveLanguage(selectedLanguage);
    nextStep();
  }

  async function handleFontSizeNext() {
    setFontSize(selectedFontSize);
    await saveFontSize(selectedFontSize);
    nextStep();
  }

  async function handleNotifNext(allow: boolean) {
    setNotifAllowed(allow);
    if (allow) {
      const granted = await requestNotificationPermission();
      const prefs = { festival: granted, holiday: granted, weather: granted };
      setNotifPrefs(prefs);
      await saveNotifPrefs(prefs);
    } else {
      const prefs = { festival: false, holiday: false, weather: false };
      setNotifPrefs(prefs);
      await saveNotifPrefs(prefs);
    }
    nextStep();
  }

  async function finishOnboarding() {
    setOnboarded();
    await persistOnboarded();
    router.replace('/(tabs)' as any);
  }

  const filteredDistricts = ODISHA_DISTRICTS.filter(d =>
    districtSearch === '' ||
    d.name_en.toLowerCase().includes(districtSearch.toLowerCase()) ||
    d.name_or.includes(districtSearch)
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Top nav row: back button + progress dots */}
      <View style={styles.topNav}>
        {stepIndex > 0 && step !== 'done' ? (
          <TouchableOpacity onPress={prevStep} style={styles.topBackBtn} activeOpacity={0.7}>
            <Text style={styles.topBackIcon}>←</Text>
            <Text style={styles.topBackText}>ପଛକୁ</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 64 }} />
        )}
        <View style={styles.progressRow}>
          {STEPS.slice(0, -1).map((s, i) => (
            <View key={s} style={[styles.progressDot, stepIndex > i && styles.progressDotDone, stepIndex === i && styles.progressDotActive]} />
          ))}
        </View>
        <View style={{ width: 64 }} />
      </View>

      {/* STEP: Welcome */}
      {step === 'welcome' && (
        <View style={styles.centeredStep}>
          <Text style={styles.bigEmoji}>🔱</Text>
          <Text style={styles.welcomeTitle}>ଦିଶା</Text>
          <Text style={styles.welcomeTagline}>ଆପଣଙ୍କ ଦୈନିକ ସାଥୀ</Text>
          <Text style={styles.welcomeTaglineEn}>Your Daily Companion</Text>

          <View style={styles.featureList}>
            {[
              ['📅', 'ଓଡ଼ିଆ ପଞ୍ଜିକା', 'Odia Calendar & Festivals'],
              ['🌤️', 'ପ୍ରାଦେଶିକ ପାଣିପାଗ', 'Local Weather in Odia'],
              ['🏦', 'ଛୁଟି ତାଲିକା', 'Bank & Govt Holidays'],
              ['🔔', 'ପର୍ବ ରିମାଇଣ୍ଡର', 'Festival Reminders'],
            ].map(([emoji, or, en]) => (
              <View key={or} style={styles.featureRow}>
                <Text style={styles.featureEmoji}>{emoji}</Text>
                <View>
                  <Text style={styles.featureOr}>{or}</Text>
                  <Text style={styles.featureEn}>{en}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={nextStep} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>ଆରମ୍ଭ କରନ୍ତୁ</Text>
            <Text style={styles.primaryBtnTextEn}>Get Started →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP: District */}
      {step === 'district' && (
        <View style={styles.step}>
          <Text style={styles.stepTitle}>ଆପଣଙ୍କ ଜିଲ୍ଲା ବାଛନ୍ତୁ</Text>
          <Text style={styles.stepSubtitle}>Choose your district for accurate weather</Text>

          <ScrollView style={styles.districtScroll} showsVerticalScrollIndicator={false}>
            {filteredDistricts.map(d => (
              <TouchableOpacity
                key={d.id}
                style={[styles.districtItem, selectedDistrict.id === d.id && styles.districtItemActive]}
                onPress={() => setSelectedDistrict(d)}
                activeOpacity={0.7}
              >
                <View style={styles.districtItemInfo}>
                  <Text style={[styles.districtItemOr, selectedDistrict.id === d.id && styles.districtItemActiveText]}>
                    {d.name_or}
                  </Text>
                  <Text style={styles.districtItemEn}>{d.name_en} · {d.division}</Text>
                </View>
                {selectedDistrict.id === d.id && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleDistrictNext} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>{selectedDistrict.name_or} ଚୟନ ହୋଇଛି</Text>
            <Text style={styles.primaryBtnTextEn}>Continue →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP: Language */}
      {step === 'language' && (
        <View style={styles.centeredStep}>
          <Text style={styles.bigEmoji}>🗣️</Text>
          <Text style={styles.stepTitle}>ଭାଷା ଚୟନ କରନ୍ତୁ</Text>
          <Text style={styles.stepSubtitle}>Choose your preferred language</Text>

          {([
            ['both', '🌐', 'ଦ୍ୱିଭାଷୀ', 'Odia + English (Recommended)'],
            ['or', '🔤', 'ଓଡ଼ିଆ ମାତ୍ର', 'Odia only'],
            ['en', '🔤', 'English only', 'English only'],
          ] as [Language, string, string, string][]).map(([key, emoji, or, en]) => (
            <TouchableOpacity
              key={key}
              style={[styles.langOption, selectedLanguage === key && styles.langOptionActive]}
              onPress={() => setSelectedLanguage(key)}
              activeOpacity={0.7}
            >
              <Text style={styles.langEmoji}>{emoji}</Text>
              <View style={styles.langInfo}>
                <Text style={[styles.langOr, selectedLanguage === key && styles.langActiveText]}>{or}</Text>
                <Text style={styles.langEn}>{en}</Text>
              </View>
              {selectedLanguage === key && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 24 }]} onPress={handleLanguageNext} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>ଜାରି ରଖନ୍ତୁ</Text>
            <Text style={styles.primaryBtnTextEn}>Continue →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP: Font Size */}
      {step === 'fontsize' && (
        <View style={styles.centeredStep}>
          <Text style={styles.bigEmoji}>🔤</Text>
          <Text style={styles.stepTitle}>ଅକ୍ଷର ଆକାର ବାଛନ୍ତୁ</Text>
          <Text style={styles.stepSubtitle}>Choose text size for easy reading</Text>

          <View style={styles.fontChoiceRow}>
            {([
              ['small',  'ଛୋଟ',   'A', 13],
              ['medium', 'ସାଧାରଣ', 'A', 18],
            ] as [FontSizeKey, string, string, number][]).map(([key, or, letter, size]) => (
              <TouchableOpacity
                key={key}
                style={[styles.fontChoiceBtn, selectedFontSize === key && styles.fontChoiceBtnActive]}
                onPress={() => setSelectedFontSize(key)}
                activeOpacity={0.7}
              >
                <Text style={[{ fontSize: size, color: selectedFontSize === key ? '#fff' : Colors.text, fontWeight: '700' }]}>{letter}</Text>
                <Text style={[styles.fontChoiceOr, selectedFontSize === key && styles.fontChoiceActiveText]}>{or}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.fontPreviewCard}>
            <Text style={styles.fontPreviewLabel}>Preview · ଉଦାହରଣ</Text>
            <Text style={[styles.fontPreviewText, { fontSize: selectedFontSize === 'medium' ? 17 : 13 }]}>
              ଆଜି ଭୁବନେଶ୍ୱରରେ ଆଂଶିକ ମେଘଲା
            </Text>
          </View>

          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 24 }]} onPress={handleFontSizeNext} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>ଜାରି ରଖନ୍ତୁ</Text>
            <Text style={styles.primaryBtnTextEn}>Continue →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP: Notifications */}
      {step === 'notifications' && (
        <View style={styles.centeredStep}>
          <Text style={styles.bigEmoji}>🔔</Text>
          <Text style={styles.stepTitle}>ବିଜ୍ଞପ୍ତି ଚାଲୁ କରନ୍ତୁ?</Text>
          <Text style={styles.stepSubtitle}>Get reminders for festivals and holidays</Text>

          <View style={styles.notifPreviewCard}>
            <Text style={styles.notifPreviewTitle}>ଆପଣ ପାଇବେ:</Text>
            {[
              ['🪔', 'ପର୍ବ ର ୧ ଦିନ ଆଗ ରିମାଇଣ୍ଡର'],
              ['🏦', 'ଛୁଟির ଆଗ ଦିନ ସଞ୍ଜ ସୂଚନା'],
              ['⚠️', 'ବାତ୍ୟା ଓ ଭାରୀ ବର୍ଷା ସତର୍କତା'],
            ].map(([emoji, text]) => (
              <View key={text} style={styles.notifPreviewRow}>
                <Text style={styles.notifPreviewEmoji}>{emoji}</Text>
                <Text style={styles.notifPreviewText}>{text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => handleNotifNext(true)} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>🔔 ହଁ, ବିଜ୍ଞପ୍ତି ଚାଲୁ କରନ୍ତୁ</Text>
            <Text style={styles.primaryBtnTextEn}>Yes, turn on notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={() => handleNotifNext(false)} activeOpacity={0.7}>
            <Text style={styles.skipText}>ଏଖନ ନୁହଁ / Not now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP: Done */}
      {step === 'done' && (
        <View style={styles.centeredStep}>
          <Text style={[styles.bigEmoji, { fontSize: 80 }]}>🎊</Text>
          <Text style={styles.doneTitle}>ସ୍ୱାଗତ!</Text>
          <Text style={styles.doneTitleEn}>Welcome to Disha!</Text>
          <Text style={styles.doneSubtitle}>
            {selectedDistrict.name_or} ରୁ ସ୍ୱାଗତ।
          </Text>
          <Text style={styles.doneSubtitleEn}>
            All set for {selectedDistrict.name_en}.
          </Text>

          <View style={styles.doneFeatures}>
            <Text style={styles.doneFeaturesLabel}>ଆଜି ଦେଖନ୍ତୁ:</Text>
            {[
              '🗓️ ଆଜିର ଓଡ଼ିଆ ତାରିଖ',
              '🪔 ଆସନ୍ତା ପର୍ବ ଓ ଉତ୍ସବ',
              '🌤️ ଆଜିର ପାଣିପାଗ',
              '🏦 ଆସନ୍ତା ଛୁଟି',
            ].map(f => (
              <Text key={f} style={styles.doneFeatureItem}>{f}</Text>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={finishOnboarding} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>ଦିଶା ଖୋଲନ୍ତୁ</Text>
            <Text style={styles.primaryBtnTextEn}>Open Disha 🔱</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 12,
    paddingBottom: 4,
  },
  topBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 64,
  },
  topBackIcon: { color: Colors.primary, fontSize: 20, lineHeight: 22 },
  topBackText: { color: Colors.primary, fontSize: FontSize.xs, fontFamily: 'NotoSansOdia', fontWeight: '700' },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: { backgroundColor: Colors.primary, width: 20 },
  progressDotDone: { backgroundColor: Colors.primary },

  fontChoiceRow: { flexDirection: 'row', gap: 12, marginBottom: 20, width: '100%' },
  fontChoiceBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    elevation: 1,
  },
  fontChoiceBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  fontChoiceOr: { fontSize: FontSize.xs, fontFamily: 'NotoSansOdia', color: Colors.textSecondary, marginTop: 6, fontWeight: '700' },
  fontChoiceEn: { fontSize: FontSize.xs, color: Colors.textLight, marginTop: 2 },
  fontChoiceActiveText: { color: '#fff' },
  fontPreviewCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  fontPreviewLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 8 },
  fontPreviewText: { fontFamily: 'NotoSansOdia', color: Colors.text, lineHeight: 32 },

  centeredStep: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: 24,
  },
  step: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: 16,
  },

  bigEmoji: { fontSize: 64, marginBottom: 16 },

  welcomeTitle: {
    fontSize: 48,
    fontFamily: 'NotoSansOdia-Bold',
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeTagline: { fontSize: FontSize.lg, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '600' },
  welcomeTaglineEn: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 32 },

  featureList: { width: '100%', marginBottom: 32 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  featureEmoji: { fontSize: 28, width: 40, textAlign: 'center' },
  featureOr: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '600' },
  featureEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },

  stepTitle: { fontSize: FontSize.xl, fontFamily: 'NotoSansOdia-Bold', color: Colors.text, fontWeight: '700', textAlign: 'center' },
  stepSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4, marginBottom: 20, textAlign: 'center' },

  districtScroll: { flex: 1, marginBottom: 12 },
  districtItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  districtItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  districtItemInfo: { flex: 1 },
  districtItemOr: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '600' },
  districtItemActiveText: { color: Colors.primary },
  districtItemEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  checkmark: { color: Colors.primary, fontSize: 20, fontWeight: '700' },

  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: 10,
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  langOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  langEmoji: { fontSize: 28 },
  langInfo: { flex: 1 },
  langOr: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '600' },
  langActiveText: { color: Colors.primary },
  langEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },

  notifPreviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.base,
    width: '100%',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  notifPreviewTitle: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.textSecondary, marginBottom: 10 },
  notifPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  notifPreviewEmoji: { fontSize: 20 },
  notifPreviewText: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.text, flex: 1 },

  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  primaryBtnText: { color: '#fff', fontSize: FontSize.md, fontFamily: 'NotoSansOdia-Bold', fontWeight: '700' },
  primaryBtnTextEn: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.xs, marginTop: 2 },

  skipBtn: { marginTop: 16, paddingVertical: 12 },
  skipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: 'NotoSansOdia' },

  doneTitle: { fontSize: FontSize.xxl, fontFamily: 'NotoSansOdia-Bold', color: Colors.primary, fontWeight: '700' },
  doneTitleEn: { fontSize: FontSize.lg, color: Colors.textSecondary, marginBottom: 8 },
  doneSubtitle: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia', color: Colors.text, fontWeight: '600' },
  doneSubtitleEn: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 24 },
  doneFeatures: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.base,
    width: '100%',
    marginBottom: 24,
  },
  doneFeaturesLabel: { fontSize: FontSize.sm, fontFamily: 'NotoSansOdia', color: Colors.textSecondary, marginBottom: 10 },
  doneFeatureItem: { fontSize: FontSize.base, fontFamily: 'NotoSansOdia', color: Colors.text, paddingVertical: 6 },
});
