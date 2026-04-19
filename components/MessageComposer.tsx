import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { translate } from '@/lib/translate';
import { TranslationStatus } from '@/types/messaging';
import { Colors, Spacing, Radius, FontSize, Fonts } from '@/constants/theme';
import { QUICK_MESSAGES } from '@/constants/odia';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  receiverName: string;
  sending:      boolean;
  onSend:       (text_en: string, text_or: string) => Promise<void>;
}

// ── Status badge ──────────────────────────────────────────────────────────────

function TranslationBadge({ status }: { status: TranslationStatus }) {
  const cfg: Record<TranslationStatus, { label: string; color: string }> = {
    translated:          { label: 'Translated ✓',   color: Colors.success },
    passthrough:         { label: 'English only',   color: Colors.warning },
    translation_pending: { label: 'Pending retry',  color: Colors.textLight },
  };
  const { label, color } = cfg[status];
  return (
    <View style={[s.badge, { borderColor: color }]}>
      <Text style={[s.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ── Composer ──────────────────────────────────────────────────────────────────

export function MessageComposer({ receiverName, sending, onSend }: Props) {
  const [text, setText]           = useState('');
  const [odiaText, setOdiaText]   = useState('');
  const [status, setStatus]       = useState<TranslationStatus | null>(null);
  const [translating, setTranslating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-preview: debounced 600ms so it doesn't block typing
  useEffect(() => {
    if (!text.trim()) { setOdiaText(''); setStatus(null); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runTranslate(text), 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [text]);

  async function runTranslate(t: string) {
    setTranslating(true);
    const out = await translate(t.trim());
    setOdiaText(out.translated_text_or);
    setStatus(out.status);
    setTranslating(false);
  }

  function selectQuick(q: (typeof QUICK_MESSAGES)[number]) {
    setText(q.en);
    setOdiaText(q.or);
    setStatus('translated');
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Translate now if debounce hasn't fired yet
    let finalOr = odiaText;
    if (!finalOr) {
      const out = await translate(trimmed);
      finalOr = out.translated_text_or;
      setOdiaText(finalOr);
      setStatus(out.status);
    }

    await onSend(trimmed, finalOr);

    // Reset after successful send
    setText('');
    setOdiaText('');
    setStatus(null);
  }

  const canSend = text.trim().length > 0 && !sending;

  return (
    <View>
      {/* To: receiver */}
      <View style={s.toRow}>
        <Text style={s.toLabel}>To:</Text>
        <View style={s.toBadge}>
          <Text style={s.toName}>{receiverName}</Text>
        </View>
      </View>

      {/* Quick message pills */}
      <Text style={s.sectionLabel}>Quick Messages</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.quickScroll}
        contentContainerStyle={s.quickContent}
      >
        {QUICK_MESSAGES.map((q, i) => (
          <TouchableOpacity
            key={i}
            style={[s.quickBtn, text === q.en && s.quickBtnActive]}
            onPress={() => selectQuick(q)}
            activeOpacity={0.8}
          >
            <Text style={s.quickIcon}>{q.icon}</Text>
            <Text style={s.quickText} numberOfLines={2}>{q.en}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* English input */}
      <Text style={s.sectionLabel}>Write in English</Text>
      <TextInput
        style={s.textBox}
        multiline
        numberOfLines={4}
        placeholder="Type your message here..."
        placeholderTextColor={Colors.textLight}
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
        maxLength={200}
      />
      <View style={s.inputFooter}>
        <Text style={[s.charCount, text.length > 180 && { color: Colors.warning }]}>{text.length} / 200</Text>
        <TouchableOpacity
          style={[s.translateBtn, (!text.trim() || translating) && s.translateBtnOff]}
          onPress={() => text.trim() && runTranslate(text)}
          disabled={!text.trim() || translating}
          activeOpacity={0.8}
        >
          {translating
            ? <ActivityIndicator size="small" color={Colors.primary} />
            : <Text style={s.translateBtnText}>Translate →</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Odia preview card */}
      <View style={s.previewCard}>
        <View style={s.previewHeader}>
          <Text style={s.previewLabel}>ଓଡ଼ିଆ Preview</Text>
          {status && <TranslationBadge status={status} />}
        </View>
        {odiaText
          ? <Text style={s.previewText}>{odiaText}</Text>
          : <Text style={s.previewPlaceholder}>ଓଡ଼ିଆ ଅନୁବାଦ ଏଠାରେ ଦେଖିବ…</Text>
        }
      </View>

      {/* Send button */}
      <TouchableOpacity
        style={[s.sendBtn, !canSend && s.sendBtnOff]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.85}
      >
        {sending
          ? <ActivityIndicator color="#fff" />
          : (
            <>
              <Text style={s.sendBtnText}>ପଠାଅ</Text>
              <Text style={s.sendBtnSub}>Send Message</Text>
            </>
          )
        }
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // To row
  toRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  toLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: Fonts.enSemiBold },
  toBadge: {
    backgroundColor: Colors.primaryLight, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  toName: { fontSize: FontSize.sm, fontFamily: Fonts.enSemiBold, color: Colors.primary },

  // Section label
  sectionLabel: {
    fontSize: FontSize.xs, fontFamily: Fonts.enSemiBold,
    color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Quick pills
  quickScroll: { marginHorizontal: -Spacing.base },
  quickContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm, paddingBottom: Spacing.xs },
  quickBtn: {
    width: 112, backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
    borderBottomWidth: 2, borderBottomColor: 'rgba(139,18,18,0.1)',
  },
  quickBtnActive: {
    borderColor: Colors.primary, backgroundColor: Colors.primaryLight,
    shadowOpacity: 0.18, elevation: 5,
    borderBottomColor: Colors.primaryDark,
  },
  quickIcon: { fontSize: 22, marginBottom: 4 },
  quickText: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 16 },

  // Text input
  textBox: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.border,
    padding: Spacing.base, fontSize: FontSize.base,
    fontFamily: Fonts.en, color: Colors.text,
    minHeight: 96,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  inputFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 6,
  },
  charCount: { fontSize: FontSize.xs, color: Colors.textLight },
  translateBtn: {
    height: 34, paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
    minWidth: 110,
  },
  translateBtnOff: { borderColor: Colors.border, backgroundColor: Colors.surfaceAlt },
  translateBtnText: { fontSize: FontSize.xs, fontFamily: Fonts.enSemiBold, color: Colors.primary },

  // Preview card — orange-tinted
  previewCard: {
    backgroundColor: Colors.primaryLight, borderRadius: Radius.lg,
    padding: Spacing.base, marginTop: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.primary,
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
    borderBottomWidth: 3, borderBottomColor: Colors.primaryDark,
    minHeight: 72,
  },
  previewHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  previewLabel: { fontSize: FontSize.xs, fontFamily: Fonts.enSemiBold, color: Colors.primary },
  previewText: {
    fontSize: 20, fontFamily: Fonts.orBold,
    color: Colors.text, lineHeight: 32,
  },
  previewPlaceholder: {
    fontSize: FontSize.sm, fontFamily: Fonts.or,
    color: Colors.textLight, fontStyle: 'italic',
  },

  // Translation status badge
  badge: {
    borderWidth: 1, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  badgeText: { fontSize: 10, fontFamily: Fonts.enSemiBold },

  // Send button — large 3D orange
  sendBtn: {
    marginTop: Spacing.lg, height: 64, borderRadius: Radius.lg,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primaryDark, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
    borderBottomWidth: 4, borderBottomColor: Colors.primaryDark,
  },
  sendBtnOff: {
    backgroundColor: Colors.textLight,
    shadowOpacity: 0, elevation: 0,
    borderBottomColor: Colors.textLight,
  },
  sendBtnText: { fontSize: FontSize.lg, fontFamily: Fonts.orBold, color: '#fff' },
  sendBtnSub:  { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.82)', marginTop: 2 },
});
