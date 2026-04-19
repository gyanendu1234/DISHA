import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { NAV_LABELS } from '@/constants/odia';
import { useMessagingStore } from '@/store/useMessagingStore';

function TabIcon({ labelOr, labelEn, focused, badge }: {
  labelOr: string; labelEn: string; focused: boolean; badge?: number;
}) {
  const color = focused ? Colors.primary : '#374151';
  return (
    <View style={styles.tabItem}>
      {badge != null && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
      <Text style={[styles.tabLabelOr, focused && styles.tabLabelOrActive, { color }]}>{labelOr}</Text>
      <Text style={[styles.tabLabelEn, { color }]}>{labelEn}</Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const unreadCount = useMessagingStore(s => s.unreadCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          height: 76 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon labelOr={NAV_LABELS.home.or} labelEn={NAV_LABELS.home.en} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon labelOr={NAV_LABELS.calendar.or} labelEn={NAV_LABELS.calendar.en} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon labelOr={NAV_LABELS.weather.or} labelEn={NAV_LABELS.weather.en} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="holidays"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon labelOr={NAV_LABELS.holidays.or} labelEn={NAV_LABELS.holidays.en} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              labelOr={NAV_LABELS.messages.or}
              labelEn={NAV_LABELS.messages.en}
              focused={focused}
              badge={unreadCount}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0EBE4',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    paddingTop: 6,
    position: 'relative',
  },
  badge: {
    position: 'absolute', top: 0, right: 2,
    backgroundColor: Colors.primary,
    borderRadius: 9, minWidth: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  badgeText: { fontSize: 9, color: '#fff', fontFamily: 'Poppins-Bold', lineHeight: 13 },
  tabLabelOr: {
    fontSize: 12,
    fontFamily: 'NotoSansOdia',
    marginTop: 4,
    fontWeight: '700',
  },
  tabLabelOrActive: {
    fontFamily: 'NotoSansOdia-Bold',
  },
  tabLabelEn: {
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 1,
    fontWeight: '600',
  },
});
