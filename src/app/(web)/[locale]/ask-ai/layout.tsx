import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { defaultLocale, locales as LOCALES, type Locale, ogLocaleMap } from "@/i18n/locales";
import { site } from "@/config/site";

export default function AskAiLayout({ children }: { children: React.ReactNode }) {
  return children;
}

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ask-ai" });
  const base = site.baseUrl.replace(/\/$/, "");
  const current = `${base}/${locale}/ask-ai`;
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, `${base}/${l}/ask-ai`]));
  languages["x-default"] = `${base}/${defaultLocale}/ask-ai`;
  const title = t("seoTitle", { default: "AIVISA - Ask AI" });
  const description = t("seoDescription", { default: "Ask AI about Japan visas." });
  return {
    title: `${title} | ${site.name}`,
    description,
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
