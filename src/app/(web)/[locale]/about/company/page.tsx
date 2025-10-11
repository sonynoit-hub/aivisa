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
    const data = (mod as any).default?.about?.company ?? {};
    title = data.seoTitle || title;
    description = data.seoDescription || description;
    keywords = Array.isArray(data.seoKeywords) ? data.seoKeywords : undefined;
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
