import { supabase } from '@/lib/supabase';
import { QuickMessage } from '@/types/messaging';

// ── Push notification (fire-and-forget via Expo Push API) ─────────────────────

async function pushToParent(
  receiverId: string,
  senderName: string,
  odiaText: string,
  messageId: string,
): Promise<void> {
  const { data: receiver } = await supabase
    .from('app_users')
    .select('push_token')
    .eq('id', receiverId)
    .single();

  const token = receiver?.push_token as string | undefined;
  if (!token) return;

  const body = odiaText.length > 100 ? odiaText.slice(0, 100) + '…' : odiaText;
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      to: token,
      title: `ନୂଆ ବାର୍ତ୍ତା — ${senderName}`,
      body,
      sound: 'default',
      channelId: 'messages',
      data: { screen: 'inbox', messageId },
    }),
  });
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function insertQuickMessage(payload: {
  sender_id:   string;
  receiver_id: string;
  sender_name: string;
  text_en:     string;
  text_or:     string;
}): Promise<QuickMessage> {
  const { data, error } = await supabase
    .from('quick_messages')
    .insert({ ...payload, is_read: false, is_done: false })
    .select()
    .single();

  if (error) throw new Error(`Send failed: ${error.message}`);
  const msg = data as QuickMessage;

  // Non-blocking push — failure must not prevent message delivery
  pushToParent(payload.receiver_id, payload.sender_name, payload.text_or, msg.id).catch(() => {});

  return msg;
}

export async function getSentHistory(senderId: string): Promise<QuickMessage[]> {
  const { data, error } = await supabase
    .from('quick_messages')
    .select('*')
    .eq('sender_id', senderId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return [];
  return (data ?? []) as QuickMessage[];
}

export async function deleteOldMessages(userId: string): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 45);
  await Promise.allSettled([
    supabase.from('quick_messages').delete().eq('sender_id', userId).lt('created_at', cutoff.toISOString()),
    supabase.from('quick_messages').delete().eq('receiver_id', userId).lt('created_at', cutoff.toISOString()),
  ]);
}

// Test/demo company accounts — exclude from real user inbox
const EXCLUDED_SENDER_NAMES = ['bhagyajyoti', 'bhagyadeep', 'radharaman', 'kohinoor', 'bhagyachakra', 'biraja'];

export async function getParentInbox(receiverId: string): Promise<QuickMessage[]> {
  const { data, error } = await supabase
    .from('quick_messages')
    .select('*')
    .eq('receiver_id', receiverId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return [];
  return ((data ?? []) as QuickMessage[]).filter(
    m => !EXCLUDED_SENDER_NAMES.includes(m.sender_name?.toLowerCase() ?? '')
  );
}

async function pushToSender(messageId: string, parentName: string, eventLabel: string): Promise<void> {
  const { data: msg } = await supabase
    .from('quick_messages')
    .select('sender_id')
    .eq('id', messageId)
    .single();
  if (!msg?.sender_id) return;

  const { data: sender } = await supabase
    .from('app_users')
    .select('push_token')
    .eq('id', msg.sender_id)
    .single();
  const token = sender?.push_token as string | undefined;
  if (!token) return;

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      to: token,
      title: `${parentName} — ${eventLabel}`,
      body: 'Tap to see the update.',
      sound: 'default',
      channelId: 'messages',
      data: { screen: 'sent', messageId },
    }),
  });
}

export async function markQuickRead(id: string, parentName?: string): Promise<void> {
  await supabase.from('quick_messages').update({ is_read: true }).eq('id', id);
  if (parentName) pushToSender(id, parentName, 'ବାର୍ତ୍ତା ପଢ଼ିଲେ / Message Read').catch(() => {});
}

export async function markQuickDone(id: string, parentName?: string): Promise<void> {
  await supabase.from('quick_messages').update({ is_done: true, is_read: true }).eq('id', id);
  if (parentName) pushToSender(id, parentName, 'କାମ ହୋଇଗଲା ✓ / Done').catch(() => {});
}

