import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessagingStore } from '@/store/useMessagingStore';
import { insertQuickMessage, getSentHistory } from '@/lib/quickMessageService';
import { MessageComposer } from '@/components/MessageComposer';
import { Colors, Spacing, Radius, FontSize, Fonts } from '@/constants/theme';
import type { AppUser, QuickMessage } from '@/types/messaging';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diffH = (Date.now() - d.getTime()) / 3_600_000;
  if (diffH < 24)  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (diffH < 48)  return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function StatusChip({ msg }: { msg: QuickMessage }) {
  if (msg.is_done) return <Text style={[s.chip, s.chipDone]}>Done ✓</Text>;
  if (msg.is_read) return <Text style={[s.chip, s.chipRead]}>Read ✓</Text>;
  return <Text style={[s.chip, s.chipSent]}>Sent</Text>;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function SupporterComposeScreen() {
  const { currentUser, linkedMembers } = useMessagingStore();

  const [sent, setSent]           = useState<QuickMessage[]>([]);
  const [loading, setLoading]     = useState(false);
  const [sending, setSending]     = useState(false);
  // Multi-recipient: all selected by default
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() =>
    new Set(linkedMembers.map(m => m.id))
  );

  const loadHistory = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const history = await getSentHistory(currentUser.id);
      setSent(history);
    } catch {
      // non-blocking — sent history is nice-to-have
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  function toggleMember(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  }

  // Guard: must be a logged-in supporter with at least one linked member
  if (!currentUser || linkedMembers.length === 0) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.centerBox}>
          <Text style={s.guardTitle}>ପ୍ରଥମେ ପରିବାରର ଲୋକ ସହ ଯୋଡ଼ ।</Text>
          <Text style={s.guardSub}>Link to a family member first from the Messages tab.</Text>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const selectedMembers = linkedMembers.filter(m => selectedIds.has(m.id));
  const recipientLabel = selectedMembers.length === linkedMembers.length
    ? 'All family members'
    : selectedMembers.map(m => m.name).join(', ');

  async function handleSend(text_en: string, text_or: string) {
    if (!currentUser || selectedMembers.length === 0) return;
    setSending(true);
    try {
      const results = await Promise.allSettled(
        selectedMembers.map(member =>
          insertQuickMessage({
            sender_id:   currentUser.id,
            receiver_id: member.id,
            sender_name: currentUser.name,
            text_en,
            text_or,
          })
        )
      );
      const fulfilled = results.filter((r): r is PromiseFulfilledResult<QuickMessage> => r.status === 'fulfilled').map(r => r.value);
      const sent = fulfilled.length;
      setSent(prev => [...fulfilled, ...prev]);
      // Sync to store so SupporterHub sees new messages without a reload
      const { prependMessage } = useMessagingStore.getState();
      fulfilled.forEach(msg => prependMessage(msg));
      Alert.alert('ପଠାଯାଇଛି! ✓', `Sent to ${sent} of ${selectedMembers.length} member${sent > 1 ? 's' : ''}`);
    } catch {
      Alert.alert('Error', 'Could not send. Check your internet and try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Recipient selector */}
          <View style={s.recipientSection}>
            <Text style={s.recipientLabel}>Send to · ଯାଙ୍କୁ ପଠାଇବ:</Text>
            <View style={s.recipientRow}>
              {linkedMembers.map(m => (
                <TouchableOpacity
                  key={m.id}
                  style={[s.recipientChip, selectedIds.has(m.id) && s.recipientChipActive]}
                  onPress={() => toggleMember(m.id)}
                  activeOpacity={0.75}
                >
                  <Text style={[s.recipientChipText, selectedIds.has(m.id) && s.recipientChipTextActive]}>{m.name}</Text>
                  {selectedIds.has(m.id) && <Text style={s.recipientCheck}> ✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Composer */}
          <MessageComposer
            receiverName={recipientLabel}
            sending={sending}
            onSend={handleSend}
          />

          {/* ── Sent History ── */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerLabel}>Sent Messages</Text>
            <View style={s.dividerLine} />
          </View>

          {loading && sent.length === 0 && (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
          )}

          {!loading && sent.length === 0 && (
            <View style={s.emptyBox}>
              <Text style={s.emptyEmoji}>📤</Text>
              <Text style={s.emptyText}>No messages sent yet</Text>
              <Text style={s.emptySub}>Your sent messages will appear here</Text>
            </View>
          )}

          {sent.map(msg => (
            <View key={msg.id} style={s.sentCard}>
              <View style={s.sentMeta}>
                <Text style={s.sentTime}>{formatTime(msg.created_at)}</Text>
                <StatusChip msg={msg} />
              </View>

              {/* Odia first — what parent received */}
              <View style={s.sentOrWrap}>
                <Text style={s.sentOrLabel}>ଓଡ଼ିଆ</Text>
                <Text style={s.sentOr}>{msg.text_or}</Text>
              </View>

              {/* English below */}
              <Text style={s.sentEn}>{msg.text_en}</Text>
            </View>
          ))}

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.background },
  scroll:  { flex: 1 },
  content: { padding: Spacing.base },

  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.base },
  guardTitle: { fontSize: FontSize.base, fontFamily: Fonts.orBold, color: Colors.primary, textAlign: 'center' },
  guardSub:   { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 6, textAlign: 'center' },

  // Recipient selector
  recipientSection: { marginBottom: Spacing.md },
  recipientLabel: { fontSize: FontSize.xs, fontFamily: Fonts.enSemiBold, color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  recipientRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recipientChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  recipientChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  recipientChipText: { fontSize: FontSize.sm, fontFamily: Fonts.enSemiBold, color: Colors.textSecondary },
  recipientChipTextActive: { color: Colors.primary },
  recipientCheck: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '700' },
  backBtn: {
    marginTop: Spacing.lg, height: 48, paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg, borderWidth: 2, borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { fontSize: FontSize.sm, fontFamily: Fonts.enSemiBold, color: Colors.primary },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.base },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerLabel: {
    fontSize: FontSize.xs, fontFamily: Fonts.enSemiBold,
    color: Colors.textSecondary, marginHorizontal: Spacing.sm,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Empty state
  emptyBox:  { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  emptyText:  { fontSize: FontSize.base, fontFamily: Fonts.enSemiBold, color: Colors.textSecondary },
  emptySub:   { fontSize: FontSize.sm, color: Colors.textLight, marginTop: 4 },

  // Sent card
  sentCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.base, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderBottomWidth: 3, borderBottomColor: 'rgba(139,18,18,0.12)',
  },
  sentMeta: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  sentTime: { fontSize: FontSize.xs, color: Colors.textLight },

  // Status chips
  chip: {
    fontSize: 10, fontFamily: Fonts.enSemiBold,
    borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3,
    overflow: 'hidden',
  },
  chipSent: { backgroundColor: Colors.border,        color: Colors.textSecondary },
  chipRead: { backgroundColor: Colors.primaryLight,  color: Colors.primary },
  chipDone: { backgroundColor: Colors.successLight ?? '#DCFCE7', color: Colors.success },

  // Sent message body
  sentEn: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    fontFamily: Fonts.en, marginBottom: Spacing.sm,
  },
  sentOrWrap: {
    backgroundColor: Colors.surfaceAlt, borderRadius: Radius.sm,
    padding: Spacing.sm, borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  sentOrLabel: {
    fontSize: 10, fontFamily: Fonts.enSemiBold,
    color: Colors.primary, marginBottom: 2,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  sentOr: {
    fontSize: FontSize.base, fontFamily: Fonts.orBold,
    color: Colors.text, lineHeight: 26,
  },
});
