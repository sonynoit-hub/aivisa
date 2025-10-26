import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap } from "@/i18n/locales";
import { site } from "@/config/site";

type Props = { params: Promise<{ locale: Locale }> };

export default function CompanyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">運営会社</h1>
      <p className="text-slate-600">会社情報ページ（準備中）。</p>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const base = site.baseUrl.replace(/\/$/, "");
  const url = `${base}/${locale}/about/company`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${base}/${l}/about/company`;

  let title = "Company";
  let description = "Company information and corporate details.";
  let keywords: string[] | undefined;
  try {
    const mod = await import(`@/i18n/messages/${locale}/about.json`);
    const root = (mod && typeof mod === 'object') ? (mod as Record<string, unknown>) : {};
    const def = (root.default && typeof root.default === 'object') ? (root.default as Record<string, unknown>) : undefined;
    const about = (def?.about && typeof def.about === 'object') ? (def.about as Record<string, unknown>) : undefined;
    const data = (about?.company && typeof about.company === 'object') ? (about.company as Record<string, unknown>) : {};
    const t = typeof data.seoTitle === 'string' ? data.seoTitle : undefined;
    const d = typeof data.seoDescription === 'string' ? data.seoDescription : undefined;
    const k = (Array.isArray(data.seoKeywords as unknown) ? (data.seoKeywords as unknown[]) : undefined)?.filter((x): x is string => typeof x === 'string');
    title = t || title;
    description = d || description;
    keywords = k;
  } catch {}

  return {
    title: `${title} | ${site.name}`,
    description,
    keywords,
    robots: { index: false, follow: false },
    alternates: { canonical: url, languages },
    openGraph: { title: `${title} | ${site.name}`, description, url, siteName: site.name, locale: ogLocaleMap[locale], type: "website" },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description },
  };
}
