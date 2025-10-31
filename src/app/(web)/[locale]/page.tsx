import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales, type Locale, ogLocaleMap } from "@/i18n/locales";
import { site } from "@/config/site";
import type { AbstractIntlMessages } from "next-intl";
import dynamic from "next/dynamic";
const HomeClient = dynamic(() => import("@/app/(web)/[locale]/HomeClient"), { ssr: true });

type Props = { params: Promise<{ locale: Locale }> };

export default function Page(_: Props) {
  return <HomeClient />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const base = site.baseUrl.replace(/\/$/, "");
  const current = `${base}/${locale}`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${base}/${l}`;

  let seoTitle: string | undefined;
  let seoDescription: string | undefined;
  let seoKeywords: string[] | undefined;
  try {
    const mod = await import(`@/i18n/messages/${locale}/home.json`);
    const data = (mod.default as AbstractIntlMessages | undefined)?.home as
      | { seoTitle?: string; seoDescription?: string; seoKeywords?: unknown }
      | undefined;
    if (data) {
      seoTitle = typeof data.seoTitle === "string" ? data.seoTitle : undefined;
      seoDescription = typeof data.seoDescription === "string" ? data.seoDescription : undefined;
      seoKeywords = Array.isArray(data.seoKeywords)
        ? (data.seoKeywords.filter((v) => typeof v === "string") as string[])
        : [];
    }
  } catch {}
  const t = await getTranslations({ locale, namespace: "home" });
  const title = seoTitle || t("hero.title");
  const description = seoDescription || t("hero.subtitle");
  const keywords = Array.isArray(seoKeywords) ? seoKeywords : [];
  const ogLocale = ogLocaleMap[locale];

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
      locale: ogLocale,
      type: "website",
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description },
  };
}

