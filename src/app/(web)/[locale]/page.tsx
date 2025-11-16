import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap } from "@/i18n/locales";
import { site } from "@/config/site";
import dynamic from "next/dynamic";
import { getSeoMeta } from "@/config/seo-tags";
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
  // 使用静态配置写死 title/description/keywords（若未配置再回退到原逻辑）
  const staticMeta = getSeoMeta(locale, 'home');
  const title = (staticMeta as { title?: string }).title || 'AIVisa';
  const description = staticMeta.description;
  const keywords = staticMeta.keywords;
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

