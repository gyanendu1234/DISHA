import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, ScrollView, StyleSheet, ActivityIndicator, Alert, Share, AppState,
} from 'react-native';
import { router, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';
import { createAppUser, updatePushToken } from '@/lib/messaging';
import { getParentInbox, getSentHistory, deleteOldMessages } from '@/lib/quickMessageService';
import { useMessagingStore } from '@/store/useMessagingStore';
import { getUserProfile, saveUserProfile, getLinkedUser, getLinkedMembers, getCachedInbox, cacheInbox } from '@/lib/storage';
import { Colors, Spacing, Radius, FontSize, Fonts } from '@/constants/theme';
import { MSG } from '@/constants/odia';
import { QuickMessage } from '@/types/messaging';
import { registerForPushNotifications } from '@/lib/notifications';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffHours = (now.getTime() - d.getTime()) / 3600000;
  if (diffHours < 24) {
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffHours < 48) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Root screen ─────────────────────────────────────────────────────────────

export default function MessagesScreen() {
  const { currentUser, setCurrentUser, setLinkedParent, setLinkedMembers, setMessages, setLoading, isLoading } = useMessagingStore();
  const [isSetup, setIsSetup] = useState(false);

  // Load saved profile on mount
  useEffect(() => {
    async function load() {
      const profile = await getUserProfile();
      if (profile) {
        setCurrentUser({ id: profile.id, name: profile.name, role: profile.role as any, link_code: profile.link_code });
        const members = await getLinkedMembers();
        if (members.length > 0) {
          setLinkedMembers(members.map(m => ({ id: m.id, name: m.name, role: 'parent' as const })));
        } else {
          const linked = await getLinkedUser();
          if (linked) setLinkedParent({ id: linked.id, name: linked.name, role: 'parent' });
        }
        setIsSetup(false);
      } else {
        setIsSetup(true);
      }
    }
    load();
  }, []);

  if (isSetup) {
    return <SetupScreen onDone={() => setIsSetup(false)} />;
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centerBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (currentUser.role === 'parent') {
    return <ParentInbox />;
  }
  return <SupporterHub />;
}

// ─── Setup Screen ────────────────────────────────────────────────────────────

function SetupScreen({ onDone }: { onDone: () => void }) {
  const { setCurrentUser } = useMessagingStore();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'supporter' | 'parent' | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !role) return;
    setSaving(true);
    try {
      const user = await createAppUser(name.trim(), role);
      await saveUserProfile({ id: user.id, name: user.name, role: user.role, link_code: user.link_code });
      setCurrentUser(user);
      onDone();
    } catch {
      Alert.alert('Error', 'Could not create profile. Check internet and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.setupContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.setupHero}>
          <Text style={styles.setupHeroEmoji}>💬</Text>
          <Text style={styles.setupHeroTitle}>{MSG.setupTitle.or}</Text>
          <Text style={styles.setupHeroSub}>{MSG.setupTitle.en}</Text>
        </View>

        {/* Name input */}
        <View style={styles.setupCard}>
          <Text style={styles.fieldLabel}>{MSG.yourName.or} ({MSG.yourName.en})</Text>
          <TextInput
            style={styles.input}
            placeholder="ଆପଣଙ୍କ ନାମ / Your name"
            placeholderTextColor={Colors.textLight}
            value={name}
            onChangeText={setName}
            maxLength={40}
          />

          {/* Role selection */}
          <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>ଆପଣ କିଏ? / Who are you?</Text>

          <TouchableOpacity
            style={[styles.roleBtn, role === 'supporter' && styles.roleBtnActive]}
            onPress={() => setRole('supporter')}
            activeOpacity={0.8}
          >
            <Text style={styles.roleEmoji}>👨‍💼</Text>
            <View style={styles.roleText}>
              <Text style={[styles.roleOr, role === 'supporter' && styles.roleOrActive]}>
                {MSG.iAmSupporter.or}
              </Text>
              <Text style={styles.roleEn}>{MSG.iAmSupporter.en}</Text>
            </View>
            {role === 'supporter' && <Text style={styles.roleCheck}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleBtn, role === 'parent' && styles.roleBtnActive]}
            onPress={() => setRole('parent')}
            activeOpacity={0.8}
          >
            <Text style={styles.roleEmoji}>👵</Text>
            <View style={styles.roleText}>
              <Text style={[styles.roleOr, role === 'parent' && styles.roleOrActive]}>
                {MSG.iAmParent.or}
              </Text>
              <Text style={styles.roleEn}>{MSG.iAmParent.en}</Text>
            </View>
            {role === 'parent' && <Text style={styles.roleCheck}>✓</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, (!name.trim() || !role) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!name.trim() || !role || saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>{MSG.save.or} · {MSG.save.en}</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Parent Inbox ─────────────────────────────────────────────────────────────

function ParentInbox() {
  const navRouter = useRouter();
  const { currentUser, messages, setMessages, setLoading, isLoading, prependMessage } = useMessagingStore();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadMessages = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    // Auto-clean messages older than 45 days (fire-and-forget)
    deleteOldMessages(currentUser.id).catch(() => {});
    try {
      const msgs = await getParentInbox(currentUser.id);
      setMessages(msgs);
      await cacheInbox(msgs);
    } catch {
      const cached = await getCachedInbox();
      if (cached.length > 0) setMessages(cached as QuickMessage[]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  // Register push token once so supporter can reach this parent
  useEffect(() => {
    if (!currentUser) return;
    registerForPushNotifications().then(token => {
      if (token) updatePushToken(currentUser.id, token).catch(() => {});
    });
  }, [currentUser?.id]);

  const subscribeInbox = useCallback(() => {
    if (!currentUser) return;
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    channelRef.current = supabase
      .channel(`inbox_${currentUser.id}_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'quick_messages', filter: `receiver_id=eq.${currentUser.id}` },
        (payload) => {
          const msg = payload.new as QuickMessage;
          prependMessage(msg);
          Notifications.scheduleNotificationAsync({
            content: {
              title: `ନୂଆ ବାର୍ତ୍ତା — ${msg.sender_name}`,
              body: msg.text_or.length > 80 ? msg.text_or.slice(0, 80) + '…' : msg.text_or,
              data: { screen: 'inbox', messageId: msg.id },
            },
            trigger: null,
          });
        },
      )
      .subscribe();
  }, [currentUser?.id]);

  // Initial load + Supabase Realtime subscription on quick_messages
  useEffect(() => {
    loadMessages();
    subscribeInbox();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [currentUser?.id]);

  // Reconnect realtime when app comes back to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        loadMessages();
        subscribeInbox();
      }
    });
    return () => sub.remove();
  }, [subscribeInbox]);

  const renderItem = useCallback(({ item: msg }: { item: QuickMessage }) => (
    <TouchableOpacity
      style={[styles.msgCard, !msg.is_read && styles.msgCardUnread]}
      onPress={() => router.push({ pathname: '/messages/[id]', params: { id: msg.id } })}
      activeOpacity={0.8}
    >
      {!msg.is_read && <View style={styles.unreadDot} />}
      <View style={styles.msgMeta}>
        <Text style={styles.msgSender}>{msg.sender_name}</Text>
        <Text style={styles.msgTime}>{formatTime(msg.created_at)}</Text>
      </View>
      <Text style={styles.msgOrText} numberOfLines={3}>{msg.text_or}</Text>
      {msg.is_done && (
        <View style={styles.doneBadge}>
          <Text style={styles.doneBadgeText}>{MSG.doneAt.or}</Text>
        </View>
      )}
      {msg.is_read && !msg.is_done && (
        <Text style={styles.readLabel}>{MSG.readAt.or}</Text>
      )}
    </TouchableOpacity>
  ), []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>{MSG.inbox.or}</Text>
          <Text style={styles.headerSub}>{MSG.inbox.en}</Text>
        </View>
        <TouchableOpacity onPress={() => navRouter.push('/settings' as any)} style={styles.settingsBtn} activeOpacity={0.8}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Link code card for parent to share */}
      {currentUser?.link_code && (
        <TouchableOpacity
          style={styles.codeCard}
          activeOpacity={0.85}
          onPress={() => Share.share({
            message: `${MSG.shareCode.en}: ${currentUser.link_code}`,
          })}
        >
          <View>
            <Text style={styles.codeLabel}>{MSG.yourCode.or}</Text>
            <Text style={styles.codeValue}>{currentUser.link_code}</Text>
            <Text style={styles.codeSub}>{MSG.shareCode.en}</Text>
          </View>
          <Text style={styles.codeCopyIcon}>⎘</Text>
        </TouchableOpacity>
      )}

      <FlatList<QuickMessage>
        style={styles.list}
        contentContainerStyle={messages.length === 0 ? styles.emptyContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
        data={messages}
        keyExtractor={msg => msg.id}
        renderItem={renderItem}
        ListHeaderComponent={isLoading && messages.length === 0 ? (
          <ActivityIndicator color={Colors.primary} size="large" />
        ) : null}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyOr}>{MSG.noMessages.or}</Text>
            <Text style={styles.emptyEn}>{MSG.noMessagesSub.en}</Text>
          </View>
        ) : null}
        ListFooterComponent={<View style={{ height: 16 }} />}
      />
    </SafeAreaView>
  );
}

// ─── Supporter Hub ────────────────────────────────────────────────────────────

function SupporterHub() {
  const hubRouter = useRouter();
  const { currentUser, linkedMembers, addLinkedMember, removeLinkedMember, messages, setMessages, setLoading, isLoading } = useMessagingStore();
  const [linkCode, setLinkCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadSent = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const msgs = await getSentHistory(currentUser.id);
      setMessages(msgs);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => { loadSent(); }, [loadSent]);

  // Realtime: update sent message status when parent reads/marks done
  useEffect(() => {
    if (!currentUser) return;
    channelRef.current = supabase
      .channel(`sent_${currentUser.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'quick_messages', filter: `sender_id=eq.${currentUser.id}` },
        (payload) => {
          const updated = payload.new as QuickMessage;
          const { updateMessage } = useMessagingStore.getState();
          updateMessage(updated.id, { is_read: updated.is_read, is_done: updated.is_done });
        },
      )
      .subscribe();
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [currentUser?.id]);

  async function handleLink() {
    if (!currentUser || !linkCode.trim()) return;
    setLinking(true);
    try {
      const { findUserByLinkCode } = await import('@/lib/messaging');
      const { saveLinkedMembers } = await import('@/lib/storage');
      const parent = await findUserByLinkCode(linkCode.trim());
      if (!parent) {
        Alert.alert('ନ ମିଳିଲା', 'Invalid link code. Ask the person to share their code.');
        return;
      }
      if (linkedMembers.some(m => m.id === parent.id)) {
        Alert.alert('ପୂର୍ବରୁ ଯୋଡ଼ା ଅଛି', `${parent.name} is already linked.`);
        return;
      }
      addLinkedMember(parent);
      const updated = [...linkedMembers, parent];
      await saveLinkedMembers(updated.map(m => ({ id: m.id, name: m.name })));
      setShowAddMember(false);
      setLinkCode('');
      Alert.alert(MSG.connected.or, `${MSG.connectedTo.en} ${parent.name}!`);
    } catch {
      Alert.alert('Error', 'Could not connect. Try again.');
    } finally {
      setLinking(false);
    }
  }

  async function handleRemove(memberId: string, memberName: string) {
    Alert.alert(
      'ହଟାଇ ଦେବେ?',
      `Remove ${memberName} from your family list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            removeLinkedMember(memberId);
            const { saveLinkedMembers } = await import('@/lib/storage');
            await saveLinkedMembers(
              useMessagingStore.getState().linkedMembers.map(m => ({ id: m.id, name: m.name }))
            );
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>{MSG.sent.or}</Text>
          <Text style={styles.headerSub}>{MSG.sent.en}</Text>
        </View>
        <View style={styles.headerActions}>
          {linkedMembers.length > 0 && (
            <TouchableOpacity
              style={styles.composeBtn}
              onPress={() => router.push('/messages/compose')}
              activeOpacity={0.85}
            >
              <Text style={styles.composeBtnText}>+ {MSG.compose.or}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => hubRouter.push('/settings' as any)} style={styles.settingsBtn} activeOpacity={0.8}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Family Members Section */}
        <View style={styles.membersSection}>
          <View style={styles.membersSectionHeader}>
            <Text style={styles.membersSectionTitle}>ପରିବାରର ଲୋକ · Family Members</Text>
            <TouchableOpacity style={styles.addMemberBtn} onPress={() => setShowAddMember(v => !v)} activeOpacity={0.8}>
              <Text style={styles.addMemberBtnText}>{showAddMember ? '✕ Cancel' : '+ Add'}</Text>
            </TouchableOpacity>
          </View>

          {/* Add member form */}
          {showAddMember && (
            <View style={styles.addMemberForm}>
              <Text style={styles.addMemberFormLabel}>Enter their 6-character link code:</Text>
              <TextInput
                style={styles.codeInput}
                placeholder="ABC123"
                placeholderTextColor={Colors.textLight}
                value={linkCode}
                onChangeText={t => setLinkCode(t.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={[styles.saveBtn, !linkCode.trim() && styles.saveBtnDisabled]}
                onPress={handleLink}
                disabled={!linkCode.trim() || linking}
                activeOpacity={0.85}
              >
                {linking
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>{MSG.connect.or} · {MSG.connect.en}</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {linkedMembers.length === 0 && !showAddMember && (
            <View style={styles.linkCard}>
              <Text style={styles.linkCardTitle}>{MSG.linkParent.or}</Text>
              <Text style={styles.linkCardSub}>{MSG.linkParent.en}</Text>
              <TouchableOpacity style={styles.saveBtn} onPress={() => setShowAddMember(true)} activeOpacity={0.85}>
                <Text style={styles.saveBtnText}>+ ପରିବାର ଯୋଡ଼ନ୍ତୁ · Add Family</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Member list */}
          {linkedMembers.map(member => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{member.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>ପରିବାର / Family</Text>
              </View>
              <TouchableOpacity
                style={styles.memberRemoveBtn}
                onPress={() => handleRemove(member.id, member.name)}
                activeOpacity={0.7}
              >
                <Text style={styles.memberRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Sent messages */}
        <View style={styles.sentSectionHeader}>
          <Text style={styles.sentSectionTitle}>ପଠାଯାଇଥିବା · Sent Messages</Text>
        </View>

        {linkedMembers.length > 0 && isLoading && messages.length === 0 && (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 32 }} />
        )}

        {linkedMembers.length > 0 && !isLoading && messages.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📤</Text>
            <Text style={styles.emptyOr}>{MSG.noMessages.or}</Text>
            <Text style={styles.emptyEn}>Tap + to send a message</Text>
          </View>
        )}

        {messages.map(msg => {
          const recipient = linkedMembers.find(m => m.id === msg.receiver_id);
          return (
            <View key={msg.id} style={styles.sentCard}>
              <View style={styles.msgMeta}>
                <Text style={styles.msgSender}>→ {recipient?.name ?? msg.receiver_id}</Text>
                <Text style={styles.msgTime}>{formatTime(msg.created_at)}</Text>
              </View>
              <Text style={styles.sentOrText}>{msg.text_or}</Text>
              <Text style={styles.sentEnText}>{msg.text_en}</Text>
              <View style={styles.sentStatus}>
                {msg.is_done
                  ? <Text style={styles.statusDone}>{MSG.doneAt.or} ✓</Text>
                  : msg.is_read
                    ? <Text style={styles.statusRead}>{MSG.readAt.or} ✓</Text>
                    : <Text style={styles.statusSent}>ପଠାଯାଇଛି</Text>
                }
              </View>
            </View>
          );
        })}

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 8, elevation: 8,
    borderBottomWidth: 3, borderBottomColor: Colors.primaryDark,
  },
  headerTextCol: { flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: FontSize.lg, fontFamily: Fonts.orBold, color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 1 },
  settingsBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingsIcon: { color: '#fff', fontSize: 18 },
  composeBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)',
  },
  composeBtnText: { color: '#fff', fontSize: FontSize.sm, fontFamily: Fonts.enSemiBold },

  // ── Lists
  list: { flex: 1 },
  listContent: { padding: Spacing.base },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.base },

  // ── Empty state
  emptyBox: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 52, marginBottom: Spacing.md },
  emptyOr: { fontSize: FontSize.md, fontFamily: Fonts.orBold, color: Colors.textSecondary, textAlign: 'center' },
  emptyEn: { fontSize: FontSize.sm, color: Colors.textLight, marginTop: 4, textAlign: 'center' },

  // ── Parent: link code card
  codeCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primary, marginHorizontal: Spacing.base, marginTop: Spacing.base,
    borderRadius: Radius.lg, padding: Spacing.base,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
    borderBottomWidth: 3, borderBottomColor: Colors.primaryDark,
  },
  codeLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.85)', fontFamily: Fonts.or },
  codeValue: { fontSize: 28, fontFamily: Fonts.enBold, color: '#fff', letterSpacing: 6, marginVertical: 2 },
  codeSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.75)' },
  codeCopyIcon: { fontSize: 26, color: 'rgba(255,255,255,0.9)' },

  // ── Parent: message card
  msgCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.base, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    borderBottomWidth: 3, borderBottomColor: 'rgba(139,18,18,0.15)',
  },
  msgCardUnread: {
    borderColor: Colors.primary, borderWidth: 1.5,
    shadowOpacity: 0.18,
  },
  unreadDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.primary,
    position: 'absolute', top: 12, right: 12,
  },
  msgMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  msgSender: { fontSize: FontSize.xs, fontFamily: Fonts.enSemiBold, color: Colors.primary },
  msgTime: { fontSize: FontSize.xs, color: Colors.textLight },
  // Large Odia text for parent — accessibility: 22px minimum
  msgOrText: { fontSize: 22, fontFamily: Fonts.orBold, color: Colors.text, lineHeight: 34 },
  doneBadge: {
    alignSelf: 'flex-start', marginTop: 8,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
  },
  doneBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontFamily: Fonts.or },
  readLabel: { fontSize: FontSize.xs, color: Colors.textLight, marginTop: 6 },

  // ── Supporter: members section
  membersSection: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.base, marginBottom: Spacing.base,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
    borderBottomWidth: 3, borderBottomColor: 'rgba(139,18,18,0.15)',
  },
  membersSectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  membersSectionTitle: { fontSize: FontSize.sm, fontFamily: Fonts.orBold, color: Colors.text },
  addMemberBtn: {
    backgroundColor: Colors.primaryLight, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 5,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  addMemberBtnText: { fontSize: FontSize.xs, fontFamily: Fonts.enSemiBold, color: Colors.primary },
  addMemberForm: { marginBottom: Spacing.sm },
  addMemberFormLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  memberAvatarText: { color: '#fff', fontSize: FontSize.base, fontFamily: Fonts.enBold },
  memberName: { fontSize: FontSize.base, fontFamily: Fonts.enSemiBold, color: Colors.text },
  memberRole: { fontSize: FontSize.xs, color: Colors.textSecondary, fontFamily: Fonts.or },
  memberRemoveBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  memberRemoveText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },
  sentSectionHeader: { marginBottom: Spacing.sm },
  sentSectionTitle: { fontSize: FontSize.sm, fontFamily: Fonts.orBold, color: Colors.text },

  // ── Supporter: link card
  linkCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.base, marginBottom: Spacing.base,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 6,
    borderBottomWidth: 3, borderBottomColor: 'rgba(139,18,18,0.15)',
    borderWidth: 1, borderColor: Colors.border,
  },
  linkCardTitle: { fontSize: FontSize.base, fontFamily: Fonts.orBold, color: Colors.primary, marginBottom: 2 },
  linkCardSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  codeInput: {
    height: 52, borderRadius: Radius.md, borderWidth: 2, borderColor: Colors.primary,
    paddingHorizontal: Spacing.base, fontSize: 22, fontFamily: Fonts.enBold,
    color: Colors.text, backgroundColor: Colors.primaryLight,
    letterSpacing: 8, textAlign: 'center', marginBottom: Spacing.md,
  },

  // ── Supporter: connected badge
  connectedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primaryLight, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.base,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  connectedEmoji: { fontSize: 22 },
  connectedLabel: { fontSize: FontSize.xs, color: Colors.primary, fontFamily: Fonts.or },
  connectedName: { fontSize: FontSize.base, fontFamily: Fonts.enSemiBold, color: Colors.text },

  // ── Supporter: sent card
  sentCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.base, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    borderBottomWidth: 3, borderBottomColor: 'rgba(139,18,18,0.12)',
  },
  sentEnText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  sentOrText: { fontSize: FontSize.base, fontFamily: Fonts.orBold, color: Colors.text },
  sentStatus: { marginTop: 8, alignItems: 'flex-end' },
  statusDone: { fontSize: FontSize.xs, color: Colors.success, fontFamily: Fonts.or },
  statusRead: { fontSize: FontSize.xs, color: Colors.primary, fontFamily: Fonts.or },
  statusSent: { fontSize: FontSize.xs, color: Colors.textLight, fontFamily: Fonts.or },

  // ── Setup screen
  setupContent: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xxl },
  setupHero: {
    alignItems: 'center', paddingVertical: Spacing.xxl,
    backgroundColor: Colors.primary, marginHorizontal: -Spacing.base,
    marginTop: -1, paddingHorizontal: Spacing.base,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28, shadowRadius: 12, elevation: 8,
    borderBottomWidth: 4, borderBottomColor: Colors.primaryDark,
  },
  setupHeroEmoji: { fontSize: 52, marginBottom: Spacing.sm },
  setupHeroTitle: { fontSize: FontSize.xl, fontFamily: Fonts.orBold, color: '#fff', textAlign: 'center' },
  setupHeroSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.85)', marginTop: 4, textAlign: 'center' },

  setupCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.base, marginTop: Spacing.base,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 6,
    borderBottomWidth: 3, borderBottomColor: 'rgba(139,18,18,0.12)',
  },
  fieldLabel: { fontSize: FontSize.sm, fontFamily: Fonts.orBold, color: Colors.text, marginBottom: Spacing.xs },
  input: {
    height: 52, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: Spacing.base, fontSize: FontSize.base,
    fontFamily: Fonts.en, color: Colors.text, backgroundColor: Colors.surfaceAlt,
  },

  roleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    borderRadius: Radius.lg, borderWidth: 2, borderColor: Colors.border,
    padding: Spacing.md, marginTop: Spacing.sm,
    backgroundColor: Colors.surfaceAlt,
    minHeight: 64,
  },
  roleBtnActive: {
    borderColor: Colors.primary, backgroundColor: Colors.primaryLight,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 4,
    borderBottomWidth: 3, borderBottomColor: Colors.primaryDark,
  },
  roleEmoji: { fontSize: 28 },
  roleText: { flex: 1 },
  roleOr: { fontSize: FontSize.sm, fontFamily: Fonts.orBold, color: Colors.text },
  roleOrActive: { color: Colors.primary },
  roleEn: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  roleCheck: { fontSize: 20, color: Colors.primary, fontWeight: '700' },

  saveBtn: {
    marginTop: Spacing.lg, height: 56, borderRadius: Radius.lg,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
    borderBottomWidth: 3, borderBottomColor: Colors.primaryDark,
  },
  saveBtnDisabled: { backgroundColor: Colors.textLight, shadowOpacity: 0, elevation: 0, borderBottomColor: Colors.textLight },
  saveBtnText: { fontSize: FontSize.base, fontFamily: Fonts.enSemiBold, color: '#fff' },
});
