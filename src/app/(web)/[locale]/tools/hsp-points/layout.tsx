import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap } from "@/i18n/locales";
import { site } from "@/config/site";

export const dynamic = "force-static";

export default function HspPointsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const base = site.baseUrl.replace(/\/$/, "");
  const url = `${base}/${locale}/tools/hsp-points`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${base}/${l}/tools/hsp-points`;

  let title = "HSP Points Calculator";
  let description = "Calculate points for Japan Highly Skilled Professional visa.";
  let keywords: string[] | undefined;
  try {
    const mod = await import(`@/i18n/messages/${locale}/tools.json`);
    const data = (mod as any).default?.tools?.hspPoints ?? {};
    title = data.seoTitle || data.title || title;
    description = data.seoDescription || data.subtitle || description;
    keywords = Array.isArray(data.seoKeywords) ? data.seoKeywords : undefined;
  } catch {}

  return {
    title: `${title} | ${site.name}`,
    description,
    keywords,
    alternates: { canonical: url, languages },
    openGraph: { title: `${title} | ${site.name}`, description, url, siteName: site.name, locale: ogLocaleMap[locale], type: "website" },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description },
  };
}
