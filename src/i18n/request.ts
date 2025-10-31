import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import { defaultLocale, locales, type Locale } from './locales';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function deepMerge<T extends AbstractIntlMessages, U extends AbstractIntlMessages>(base: T, override: U): T & U {
  const out: AbstractIntlMessages = { ...base };
  for (const [k, v] of Object.entries(override)) {
    const bv = (base as Record<string, unknown>)[k];
    (out as Record<string, unknown>)[k] = isPlainObject(bv) && isPlainObject(v)
      ? deepMerge(bv as AbstractIntlMessages, v as AbstractIntlMessages)
      : (v as unknown);
  }
  return out as T & U;
}

export async function loadMessages(locale: Locale): Promise<AbstractIntlMessages> {
  try {
    const [home, layout, common, visa, askAi, faq, forms, errors, tools, footer, legal] = await Promise.all([
      import(`./messages/${locale}/home.json`).then(m => m.default as AbstractIntlMessages).catch(() => ({} as AbstractIntlMessages)),
      import(`./messages/${locale}/layout.json`).then(m => m.default as AbstractIntlMessages).catch(() => ({} as AbstractIntlMessages)),
      import(`./messages/${locale}/common.json`).then(m => m.default as AbstractIntlMessages).catch(() => ({} as AbstractIntlMessages)),
      import(`./messages/${locale}/visa.json`).then(m => m.default as AbstractIntlMessages).catch(() => ({} as AbstractIntlMessages)),
      import(`./messages/${locale}/ask-ai.json`).then(m => m.default as AbstractIntlMessages).catch(() => ({} as AbstractIntlMessages)),
      import(`./messages/${locale}/faq.json`).then(m => m.default as AbstractIntlMessages).catch(() => ({} as AbstractIntlMessages)),
      import(`./messages/${locale}/forms.json`).then(m => m.default as AbstractIntlMessages).catch(() => ({} as AbstractIntlMessages)),
      import(`./messages/${locale}/errors.json`).then(m => m.default as AbstractIntlMessages).catch(() => ({} as AbstractIntlMessages)),
      import(`./messages/${locale}/tools.json`).then(m => m.default as AbstractIntlMessages).catch(() => ({} as AbstractIntlMessages)),
      import(`./messages/${locale}/footer.json`).then(m => m.default as AbstractIntlMessages).catch(() => ({} as AbstractIntlMessages)),
      import(`./messages/${locale}/legal.json`).then(m => m.default as AbstractIntlMessages).catch(() => ({} as AbstractIntlMessages)),
    ]);
    // Fallback/merge: ensure forms domain exists by merging defaultLocale -> locale
    const fallbackForms: AbstractIntlMessages = locale === defaultLocale
      ? ({} as AbstractIntlMessages)
      : await import(`./messages/${defaultLocale}/forms.json`).then(m => m.default as AbstractIntlMessages).catch(() => ({} as AbstractIntlMessages));
    const mergedForms = deepMerge(fallbackForms, forms);
    // Flatten domains at top-level; spread tools so keys under `tools` are accessible directly
    // Normalize faq domain: allow either {faq: {...}} or flat {...}
    const faqNs: AbstractIntlMessages = isPlainObject((faq as Record<string, unknown>).faq)
      ? ((faq as Record<string, unknown>).faq as unknown as AbstractIntlMessages)
      : faq;

    return { ...home, layout, common, visa, 'ask-ai': askAi, faq: faqNs, forms: mergedForms, ...errors, ...tools, ...footer, legal } as AbstractIntlMessages;
  } catch {
    return {} as AbstractIntlMessages;
  }
}

export default getRequestConfig(async ({ locale: requestLocale }) => {
  const candidate = requestLocale as string | undefined;
  const locale: Locale = (candidate && (locales as readonly string[]).includes(candidate))
    ? (candidate as Locale)
    : defaultLocale;

  const messages = await loadMessages(locale);
  if (Object.keys(messages).length > 0) {
    return { locale, messages };
  }
  const fallback = await loadMessages(defaultLocale);
  return { locale: defaultLocale, messages: fallback };
});
