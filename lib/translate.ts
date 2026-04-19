import type { TranslationOutput, TranslationProvider } from '@/types/messaging';

// ── Dictionary provider (V1 — offline, zero dependencies) ───────────────────
// To swap in a real API: implement TranslationProvider and pass it to translate().

function extractAmount(text: string): string | null {
  const m = text.match(/₹\s*([\d,]+)|([\d,]+)\s*(inr|rs\.?|rupee)/i);
  return m ? (m[1] || m[2]).replace(/,/g, '') : null;
}

type Rule = { test: (t: string) => boolean; or: (t: string) => string };

const RULES: Rule[] = [
  {
    test: (t) => /(sent|transfer|paid|deposited)/i.test(t) && extractAmount(t) !== null,
    or:   (t) => `ମୁଁ ₹${extractAmount(t)} ପଠାଇଛି। ଦୟାକରି ATM କୁ ଯାଅ।`,
  },
  {
    test: (t) => /send.*money.*uncle|uncle.*money|money.*uncle/i.test(t),
    or:   () => 'ଚାଚାଙ୍କୁ ଟଙ୍କା ପଠାଅ।',
  },
  {
    test: (t) => /doctor|hospital|clinic|health check|checkup/i.test(t),
    or:   () => 'ଆଜି ଡାକ୍ତରଙ୍କ ପାଖକୁ ଯିବାକୁ ହେବ।',
  },
  {
    test: (t) => /medicine|tablet|pill|capsule|dose/i.test(t),
    or:   () => 'ଦୟାକରି ଖାଇବା ପରେ ଔଷଧ ଖାଅ।',
  },
  {
    test: (t) => /temple|mandir/i.test(t) && /festival|tomorrow|early/i.test(t),
    or:   () => 'ଆସନ୍ତାକାଲି ଉତ୍ସବ। ସକାଳୁ ମନ୍ଦିରକୁ ଯାଅ।',
  },
  {
    test: (t) => /festival|puja|pooja/i.test(t),
    or:   () => 'ଆସନ୍ତାକାଲି ଉତ୍ସବ ଅଛି।',
  },
  {
    test: (t) => /(will call|call you|ring you).*(evening|tonight)|evening.*(call|ring)/i.test(t),
    or:   () => 'ସନ୍ଧ୍ୟାରେ ଫୋନ କରିବି।',
  },
  {
    test: (t) => /call|phone/i.test(t),
    or:   () => 'ଫୋନ ଉଠାଅ।',
  },
  {
    test: (t) => /atm/i.test(t),
    or:   () => 'ATM ରୁ ଟଙ୍କା ନିଅନ୍ତୁ।',
  },
  {
    test: (t) => /(money|cash|payment|rupee|₹)/i.test(t),
    or:   () => 'ଟଙ୍କା ସଂକ୍ରାନ୍ତ ଗୁରୁତ୍ୱପୂର୍ଣ ବାର୍ତ୍ତା।',
  },
  {
    test: (t) => /eat|food|dinner|lunch|breakfast/i.test(t),
    or:   () => 'ସମୟ ମତେ ଖାଇବାକୁ ଭୁଲ ନ ଯିବ।',
  },
  {
    test: (t) => /safe|well|fine|ok|good/i.test(t),
    or:   () => 'ସବୁ ଭଲ ଅଛି। ଚିନ୍ତା ନ କର।',
  },
  {
    test: (t) => /love|miss you/i.test(t),
    or:   () => 'ତୁମ୍ଭ ପ୍ରତି ଭଲ ପାଇ।',
  },
  {
    test: (t) => /tomorrow/i.test(t),
    or:   () => 'ଆସନ୍ତାକାଲି ଗୁରୁତ୍ୱପୂର୍ଣ ଦିନ।',
  },
];

export class DictionaryProvider implements TranslationProvider {
  async translate(englishText: string): Promise<TranslationOutput> {
    const t = englishText.trim();
    for (const rule of RULES) {
      if (rule.test(t)) {
        return {
          original_text_en:   t,
          translated_text_or: rule.or(t),
          status: 'translated',
        };
      }
    }
    // No rule matched — store English, clearly mark it
    return {
      original_text_en:   t,
      translated_text_or: t,
      status: 'passthrough',
    };
  }
}

// ── Google Translate (free, no API key) ──────────────────────────────────────

class GoogleGtxProvider implements TranslationProvider {
  async translate(englishText: string): Promise<TranslationOutput> {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=or&dt=t&q=${encodeURIComponent(englishText)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    let res: Response;
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) throw new Error('gtx failed');
    const data = await res.json();
    const translated: string = (data[0] as [string, string][])
      .map((pair: [string, string]) => pair[0])
      .join('');
    if (!translated || translated === englishText) throw new Error('no translation');
    return { original_text_en: englishText, translated_text_or: translated, status: 'translated' };
  }
}

// ── Chained: dictionary first (fast/offline), then Google ────────────────────

class ChainedProvider implements TranslationProvider {
  private dict = new DictionaryProvider();
  private gtx  = new GoogleGtxProvider();

  async translate(englishText: string): Promise<TranslationOutput> {
    const dictResult = await this.dict.translate(englishText);
    if (dictResult.status === 'translated') return dictResult;
    return this.gtx.translate(englishText);
  }
}

// ── Active provider ───────────────────────────────────────────────────────────
let _provider: TranslationProvider = new ChainedProvider();

export function setTranslationProvider(p: TranslationProvider): void {
  _provider = p;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function translate(englishText: string): Promise<TranslationOutput> {
  if (!englishText.trim()) {
    return { original_text_en: '', translated_text_or: '', status: 'passthrough' };
  }
  try {
    return await _provider.translate(englishText);
  } catch {
    return {
      original_text_en:   englishText,
      translated_text_or: englishText,
      status: 'translation_pending',
    };
  }
}
