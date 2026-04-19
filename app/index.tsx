import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

export default function RootIndex() {
  const isReady    = useAppStore(s => s.isReady);
  const isOnboarded = useAppStore(s => s.isOnboarded);

  // Splash screen is still visible while isReady is false — return blank to
  // avoid a premature redirect that pollutes the Android back-stack.
  if (!isReady) return <View style={{ flex: 1 }} />;

  return <Redirect href={isOnboarded ? '/(tabs)' : '/onboarding'} />;
}
