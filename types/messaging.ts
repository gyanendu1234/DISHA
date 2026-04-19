export type UserRole = 'supporter' | 'parent';

// ── Translation ─────────────────────────────────────────────
export type TranslationStatus =
  | 'translated'        // provider returned an Odia string
  | 'passthrough'       // no rule matched; English stored as-is
  | 'translation_pending'; // provider failed; retry later

export interface TranslationOutput {
  original_text_en:  string;
  translated_text_or: string;
  status: TranslationStatus;
}

export interface TranslationProvider {
  translate(englishText: string): Promise<TranslationOutput>;
}

// ── QuickMessage — matches quick_messages table ──────────────────────────────
export interface QuickMessage {
  id:          string;
  sender_id:   string;
  receiver_id: string;
  sender_name: string;
  text_en:     string;
  text_or:     string;
  is_read:     boolean;
  is_done:     boolean;
  created_at:  string;
  updated_at:  string;
}


export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  link_code?: string;
  push_token?: string;
  linked_user_id?: string;
  created_at?: string;
}

export interface FamilyMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  text_en: string;
  text_or: string;
  is_read: boolean;
  is_done: boolean;
  created_at: string;
}
