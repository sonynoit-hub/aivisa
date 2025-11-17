import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap, defaultLocale } from "@/i18n/locales";
import { site } from "@/config/site";
import { getSeoMeta } from "@/config/seo-tags";

export const dynamic = "force-static";

export default function HspPointsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const url = `/${locale}/tools/hsp-points`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `/${l}/tools/hsp-points`;
  languages["x-default"] = `/${defaultLocale}/tools/hsp-points`;

  const staticMeta = getSeoMeta(locale, 'tools/hsp-points');
  const title = (staticMeta as { title?: string }).title || "HSP Points Calculator";
  const { description } = staticMeta;

  return {
    title: title,
    description,
    alternates: { canonical: url, languages },
    openGraph: { title: title, description: description, url, siteName: site.name, locale: ogLocaleMap[locale], type: "website" },
    twitter: { card: "summary_large_image", title: title, description: description },
  };
}
