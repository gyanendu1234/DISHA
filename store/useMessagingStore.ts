import { create } from 'zustand';
import { AppUser, QuickMessage } from '@/types/messaging';

interface MessagingState {
  currentUser: AppUser | null;
  linkedParent: AppUser | null;      // kept for backward-compat (first member)
  linkedMembers: AppUser[];           // all linked family members
  messages: QuickMessage[];
  unreadCount: number;
  isLoading: boolean;

  setCurrentUser: (u: AppUser | null) => void;
  setLinkedParent: (p: AppUser | null) => void;
  setLinkedMembers: (members: AppUser[]) => void;
  addLinkedMember: (m: AppUser) => void;
  removeLinkedMember: (id: string) => void;
  setMessages: (msgs: QuickMessage[]) => void;
  prependMessage: (msg: QuickMessage) => void;
  updateMessage: (id: string, patch: Partial<QuickMessage>) => void;
  setLoading: (v: boolean) => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  currentUser: null,
  linkedParent: null,
  linkedMembers: [],
  messages: [],
  unreadCount: 0,
  isLoading: false,

  setCurrentUser: (u) => set({ currentUser: u }),

  setLinkedParent: (p) => set({ linkedParent: p }),

  setLinkedMembers: (members) => set({
    linkedMembers: members,
    linkedParent: members[0] ?? null,
  }),

  addLinkedMember: (m) => {
    const existing = get().linkedMembers;
    if (existing.some(x => x.id === m.id)) return;
    const updated = [...existing, m];
    set({ linkedMembers: updated, linkedParent: updated[0] });
  },

  removeLinkedMember: (id) => {
    const updated = get().linkedMembers.filter(m => m.id !== id);
    set({ linkedMembers: updated, linkedParent: updated[0] ?? null });
  },

  setMessages: (msgs) => set({
    messages: msgs,
    unreadCount: msgs.filter(m => !m.is_read).length,
  }),

  prependMessage: (msg) => {
    const existing = get().messages;
    if (existing.some(m => m.id === msg.id)) return;
    const msgs = [msg, ...existing];
    set({ messages: msgs, unreadCount: msgs.filter(m => !m.is_read).length });
  },

  updateMessage: (id, patch) => {
    const msgs = get().messages.map(m => m.id === id ? { ...m, ...patch } : m);
    set({ messages: msgs, unreadCount: msgs.filter(m => !m.is_read).length });
  },

  setLoading: (v) => set({ isLoading: v }),
}));
