import { supabase } from '@/lib/supabase';
import { AppUser, FamilyMessage, UserRole } from '@/types/messaging';
import { translate } from '@/lib/translate';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateLinkCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Create a new user in Supabase. Returns the created user.
export async function createAppUser(name: string, role: UserRole, pushToken?: string): Promise<AppUser> {
  const id = generateUUID();
  const link_code = role === 'parent' ? generateLinkCode() : undefined;

  const { data, error } = await supabase
    .from('app_users')
    .insert({ id, name, role, link_code, push_token: pushToken ?? null })
    .select()
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return data as AppUser;
}

// Find parent by their 6-char link code
export async function findUserByLinkCode(code: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('link_code', code.toUpperCase().trim())
    .eq('role', 'parent')
    .single();

  if (error) return null;
  return data as AppUser;
}

// Link supporter to parent
export async function linkSupporterToParent(supporterId: string, parentId: string): Promise<void> {
  const { error } = await supabase
    .from('app_users')
    .update({ linked_user_id: parentId })
    .eq('id', supporterId);

  if (error) throw new Error(`Failed to link: ${error.message}`);
}

// Update push token
export async function updatePushToken(userId: string, token: string): Promise<void> {
  await supabase.from('app_users').update({ push_token: token }).eq('id', userId);
}

// Send a message — translates internally; caller only needs to provide English text.
export async function sendMessage(payload: {
  sender_id:   string;
  receiver_id: string;
  sender_name: string;
  text_en:     string;
  text_or?:    string;   // optional override (e.g. quick-message presets)
}): Promise<FamilyMessage> {
  const translation = await translate(payload.text_en);

  const row = {
    sender_id:   payload.sender_id,
    receiver_id: payload.receiver_id,
    sender_name: payload.sender_name,
    text_en:     translation.original_text_en,
    text_or:     payload.text_or ?? translation.translated_text_or,
    is_read:     false,
    is_done:     false,
  };

  const { data, error } = await supabase
    .from('family_messages')
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`Failed to send: ${error.message}`);
  return data as FamilyMessage;
}

// Get parent's inbox (latest first)
export async function getInbox(receiverId: string): Promise<FamilyMessage[]> {
  const { data, error } = await supabase
    .from('family_messages')
    .select('*')
    .eq('receiver_id', receiverId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return [];
  return (data ?? []) as FamilyMessage[];
}

// Get supporter's sent messages (latest first)
export async function getSentMessages(senderId: string): Promise<FamilyMessage[]> {
  const { data, error } = await supabase
    .from('family_messages')
    .select('*')
    .eq('sender_id', senderId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return [];
  return (data ?? []) as FamilyMessage[];
}

// Mark message as read
export async function markRead(id: string): Promise<void> {
  await supabase.from('family_messages').update({ is_read: true }).eq('id', id);
}

// Mark message as done
export async function markDone(id: string): Promise<void> {
  await supabase.from('family_messages').update({ is_done: true, is_read: true }).eq('id', id);
}
