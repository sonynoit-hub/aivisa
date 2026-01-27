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
  const current = `/${locale}`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `/${l}`;
  // 为语言备用版本提供 x-default（指向站点默认语言首页）
  languages["x-default"] = "/";
  // 使用静态配置写死 title/description（若未配置再回退到原逻辑）
  const staticMeta = getSeoMeta(locale, 'home');
  const title = (staticMeta as { title?: string }).title || 'AIVisa';
  const description = staticMeta.description;
  const ogLocale = ogLocaleMap[locale];

  return {
    title: title,
    description,
    alternates: { canonical: current, languages },
    openGraph: {
      title: title,
      description,
      url: current,
      siteName: site.name,
      locale: ogLocale,
      type: "website",
    },
    twitter: { card: "summary_large_image", title: title, description },
  };
}

