import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { markQuickRead, markQuickDone } from '@/lib/quickMessageService';
import { useMessagingStore } from '@/store/useMessagingStore';
import { useAppStore } from '@/store/useAppStore';
import { Colors, Spacing, Radius, FontSize, Fonts } from '@/constants/theme';
import { MSG } from '@/constants/odia';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { messages, updateMessage } = useMessagingStore();
  const currentUser = useMessagingStore(s => s.currentUser);
  const [loading, setLoading] = useState(false);

  const msg = messages.find(m => m.id === id);
  const parentName = currentUser?.name ?? 'ପରିବାର';

  // Auto-mark as read when opened (sends push to sender)
  useEffect(() => {
    if (msg && !msg.is_read) {
      markQuickRead(msg.id, parentName);
      updateMessage(msg.id, { is_read: true });
    }
  }, [msg?.id]);

  if (!msg) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centerBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  async function handleDone() {
    if (!msg || msg.is_done) return;
    setLoading(true);
    try {
      await markQuickDone(msg.id, parentName);
      updateMessage(msg.id, { is_done: true, is_read: true });
      Alert.alert(MSG.doneAt.or, MSG.doneAt.en, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Could not update. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Sender + time */}
        <View style={styles.metaCard}>
          <Text style={styles.fromLabel}>{MSG.from.or}</Text>
          <Text style={styles.senderName}>{msg.sender_name}</Text>
          <Text style={styles.timeText}>{formatDateTime(msg.created_at)}</Text>
        </View>

        {/* Odia message — very large for elderly parent */}
        <View style={styles.orCard}>
          <Text style={styles.orText}>{msg.text_or}</Text>
        </View>

        {/* English message — secondary, smaller */}
        {msg.text_en && (
          <View style={styles.enCard}>
            <Text style={styles.enLabel}>English</Text>
            <Text style={styles.enText}>{msg.text_en}</Text>
          </View>
        )}

        {/* Status */}
        {msg.is_done && (
          <View style={styles.doneStatusBox}>
            <Text style={styles.doneStatusText}>{MSG.doneAt.or} ✓</Text>
            <Text style={styles.doneStatusEn}>{MSG.doneAt.en}</Text>
          </View>
        )}

        {/* Action buttons — big touch targets for elderly */}
        {!msg.is_done && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={handleDone}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="large" />
                : (
                  <>
                    <Text style={styles.doneBtnText}>{MSG.markDone.or}</Text>
                    <Text style={styles.doneBtnSub}>{MSG.markDone.en}</Text>
                  </>
                )
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.backBtnText}>← ଫେରିଯାଅ · Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {msg.is_done && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backBtnText}>← ଫେରିଯାଅ · Back</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: Spacing.base },

  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Sender meta card — orange 3D
  metaCard: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    padding: Spacing.base, marginBottom: Spacing.base,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
    borderBottomWidth: 3, borderBottomColor: Colors.primaryDark,
  },
  fromLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', fontFamily: Fonts.or },
  senderName: { fontSize: FontSize.xl, fontFamily: Fonts.enBold, color: '#fff', marginTop: 2 },
  timeText: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  // Odia message — main focus, very large text
  orCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.xl, marginBottom: Spacing.base,
    borderWidth: 2, borderColor: Colors.primary,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18, shadowRadius: 14, elevation: 10,
    borderBottomWidth: 5, borderBottomColor: Colors.primaryDark,
    minHeight: 160, justifyContent: 'center',
  },
  orText: {
    // 30px — elderly-friendly, well above 16px minimum
    fontSize: 30, fontFamily: Fonts.orBold,
    color: Colors.text, lineHeight: 46, textAlign: 'center',
  },

  // English secondary card
  enCard: {
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.lg,
    padding: Spacing.base, marginBottom: Spacing.base,
    borderWidth: 1, borderColor: Colors.border,
  },
  enLabel: { fontSize: FontSize.xs, color: Colors.textLight, fontFamily: Fonts.enSemiBold, marginBottom: 4 },
  enText: { fontSize: FontSize.base, color: Colors.textSecondary, fontFamily: Fonts.en },

  // Done status
  doneStatusBox: {
    alignItems: 'center', padding: Spacing.base,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.primary, marginBottom: Spacing.base,
  },
  doneStatusText: { fontSize: FontSize.lg, fontFamily: Fonts.orBold, color: Colors.primary },
  doneStatusEn: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },

  // Actions
  actions: { gap: Spacing.sm },

  // Done button — large, high contrast orange, 3D
  doneBtn: {
    height: 72, borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.42, shadowRadius: 14, elevation: 12,
    borderBottomWidth: 5, borderBottomColor: Colors.primaryDark,
  },
  doneBtnText: { fontSize: FontSize.xl, fontFamily: Fonts.orBold, color: '#fff' },
  doneBtnSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // Back button — large, outlined
  backBtn: {
    height: 56, borderRadius: Radius.lg,
    borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginTop: Spacing.sm,
  },
  backBtnText: { fontSize: FontSize.base, fontFamily: Fonts.or, color: Colors.primary },
});
