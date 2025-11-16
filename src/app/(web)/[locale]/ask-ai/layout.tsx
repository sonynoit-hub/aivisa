import type { Metadata } from "next";
import { defaultLocale, locales as LOCALES, type Locale, ogLocaleMap } from "@/i18n/locales";
import { site } from "@/config/site";
import { getSeoMeta } from "@/config/seo-tags";

export default function AskAiLayout({ children }: { children: React.ReactNode }) {
  return children;
}

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const base = site.baseUrl.replace(/\/$/, "");
  const current = `${base}/${locale}/ask-ai`;
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, `${base}/${l}/ask-ai`]));
  languages["x-default"] = `${base}/${defaultLocale}/ask-ai`;
  // 使用静态配置的标题/描述/关键词；若未设置标题则回退到 i18n 文案
  const staticMeta = getSeoMeta(locale, 'ask-ai');
  const title = (staticMeta as { title?: string }).title || 'Ask AI';
  const description = staticMeta.description;
  const keywords = staticMeta.keywords;
  return {
    title: `${title} | ${site.name}`,
    description,
    keywords,
    alternates: { canonical: current, languages },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: current,
      siteName: site.name,
      locale: ogLocaleMap[locale] || "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description },
  };
}
