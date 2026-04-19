import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppStore } from '@/store/useAppStore';
import { loadAllPrefs } from '@/lib/storage';
import { ODISHA_DISTRICTS, DEFAULT_DISTRICT } from '@/constants/districts';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setDistrict, setLanguage, setFontSize, setNotifPrefs, setOnboarded, setReady } = useAppStore();

  useEffect(() => {
    async function init() {
      try {
        await Font.loadAsync({
          'NotoSansOdia': require('../assets/fonts/Noto_Sans_Oriya/static/NotoSansOriya-Regular.ttf'),
          'NotoSansOdia-Bold': require('../assets/fonts/Noto_Sans_Oriya/static/NotoSansOriya-Bold.ttf'),
          'Poppins': Poppins_400Regular,
          'Poppins-SemiBold': Poppins_600SemiBold,
          'Poppins-Bold': Poppins_700Bold,
        });
        const prefs = await loadAllPrefs();
        if (prefs.districtId) {
          const d = ODISHA_DISTRICTS.find(x => x.id === prefs.districtId) ?? DEFAULT_DISTRICT;
          setDistrict(d);
        }
        setLanguage(prefs.language);
        setFontSize(prefs.fontSize);
        setNotifPrefs(prefs.notifs);
        if (prefs.onboarded) setOnboarded();
      } catch (e) {
        console.warn('Init error', e);
      } finally {
        setReady();
        await SplashScreen.hideAsync();
      }
    }
    init();
  }, []);

  // Handle notification taps: navigate to inbox or specific message
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      if (data?.messageId) {
        router.push({ pathname: '/messages/[id]', params: { id: data.messageId as string } });
      } else if (data?.screen === 'inbox') {
        router.push('/(tabs)/messages');
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="festival/[id]"
          options={{
            headerShown: true,
            headerTitle: 'ପର୍ବ ବିବରଣୀ',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
            headerTitleStyle: { fontFamily: 'NotoSansOdia', fontSize: 17 },
          }}
        />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen
          name="messages/compose"
          options={{
            headerShown: true,
            headerTitle: 'ବାର୍ତ୍ତା ପଠାଅ',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
            headerTitleStyle: { fontFamily: 'NotoSansOdia', fontSize: 17 },
          }}
        />
        <Stack.Screen
          name="messages/[id]"
          options={{
            headerShown: true,
            headerTitle: 'ବାର୍ତ୍ତା',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: '#fff',
            headerTitleStyle: { fontFamily: 'NotoSansOdia', fontSize: 17 },
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
