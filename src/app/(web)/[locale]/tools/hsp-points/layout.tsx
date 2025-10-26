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
    const root = (mod as { default?: unknown }).default;
    const data = root && typeof root === 'object' ? (root as Record<string, unknown>) : undefined;
    const tools = data?.tools && typeof data.tools === 'object' ? (data.tools as Record<string, unknown>) : undefined;
    const hspPoints = tools?.hspPoints && typeof tools.hspPoints === 'object' ? (tools.hspPoints as Record<string, unknown>) : undefined;
    const t = hspPoints ?? {};
    const seoTitle = typeof t.seoTitle === 'string' ? t.seoTitle : undefined;
    const dataTitle = typeof t.title === 'string' ? t.title : undefined;
    const seoDescription = typeof t.seoDescription === 'string' ? t.seoDescription : undefined;
    const subtitle = typeof t.subtitle === 'string' ? t.subtitle : undefined;
    const seoKeywords = Array.isArray(t.seoKeywords) ? (t.seoKeywords.filter(x => typeof x === 'string') as string[]) : undefined;
    title = seoTitle || dataTitle || title;
    description = seoDescription || subtitle || description;
    keywords = seoKeywords;
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
