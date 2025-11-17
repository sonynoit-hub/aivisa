import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap, defaultLocale } from "@/i18n/locales";
import { site, getPublicBaseUrl } from "@/config/site";

type Props = { params: Promise<{ locale: Locale }> };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h2 className="text-2xl font-semibold mb-4">About</h2>
      <p className="text-gray-600">（会社・プラットフォームについて）</p>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const base = await getPublicBaseUrl();
  const url = `${base}/${locale}/about`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${base}/${l}/about`;
  languages["x-default"] = `${base}/${defaultLocale}/about`;

  let title = "About";
  let description = "About the platform and our mission.";
  try {
    const mod = await import(`@/i18n/messages/${locale}/about.json`);
    const root = (mod && typeof mod === 'object') ? (mod as Record<string, unknown>) : {};
    const def = (root.default && typeof root.default === 'object') ? (root.default as Record<string, unknown>) : undefined;
    const about = (def?.about && typeof def.about === 'object') ? (def.about as Record<string, unknown>) : undefined;
    const data = (about?.index && typeof about.index === 'object') ? (about.index as Record<string, unknown>) : {};
    const t = typeof data.seoTitle === 'string' ? data.seoTitle : undefined;
    const d = typeof data.seoDescription === 'string' ? data.seoDescription : undefined;
    title = t || title;
    description = d || description;
  } catch {}

  return {
    title: title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: url, languages },
    openGraph: { title: title, description, url, siteName: site.name, locale: ogLocaleMap[locale], type: "website" },
    twitter: { card: "summary_large_image", title: title, description },
  };
}
