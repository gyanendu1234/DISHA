import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Android requires a notification channel to be created before scheduling.
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('messages', {
    name: 'ବାର୍ତ୍ତା',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Registers device for Expo push notifications.
 * Returns the Expo push token string, or null if unavailable/denied.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;
  // Expo Go (SDK 53+) dropped remote push support — skip to avoid the console error overlay
  if ((Constants as any).executionEnvironment === 'storeClient') return null;
  const granted = await requestNotificationPermission();
  if (!granted) return null;
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return token.data;
  } catch {
    return null;
  }
}

export async function scheduleFestivalReminder(
  festivalId: string,
  nameOr: string,
  nameEn: string,
  festivalDate: string, // YYYY-MM-DD
): Promise<void> {
  // Cancel any existing reminder for this festival
  await Notifications.cancelScheduledNotificationAsync(festivalId).catch(() => {});

  const date = new Date(festivalDate);
  date.setDate(date.getDate() - 1); // 1 day before
  date.setHours(8, 0, 0, 0);        // 8 AM

  if (date <= new Date()) return; // already past

  await Notifications.scheduleNotificationAsync({
    identifier: festivalId,
    content: {
      title: `🙏 ${nameOr}`,
      body: `ଆସନ୍ତାକାଲି ${nameOr} (${nameEn}). ଶୁଭ ଉତ୍ସବ! 🎉`,
      data: { festivalId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

export async function cancelReminder(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

export async function scheduleHolidayReminder(
  holidayId: string,
  nameOr: string,
  date: string,
): Promise<void> {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  d.setHours(20, 0, 0, 0); // 8 PM evening before

  if (d <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `holiday_${holidayId}`,
    content: {
      title: `🏦 ଆସନ୍ତାକାଲି ଛୁଟି!`,
      body: `${nameOr} — ଆସନ୍ତାକାଲି ଛୁଟି। ଯୋଜନା ଅନୁଯାୟୀ ବ୍ୟବସ୍ଥା କରନ୍ତୁ।`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: d },
  });
}
