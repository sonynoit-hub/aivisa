import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap, defaultLocale } from "@/i18n/locales";
import { site, getPublicBaseUrl } from "@/config/site";

type Params = { params: Promise<{ locale: Locale }> };

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h2 className="text-2xl font-semibold mb-4">サービス</h2>
      <p className="text-gray-600">（サービスの説明をここに配置）</p>
    </div>
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const base = await getPublicBaseUrl();
  const path = `${base}/${locale}/services`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${base}/${l}/services`;
  languages["x-default"] = `${base}/${defaultLocale}/services`;

  let title = "Services";
  let description = "Our visa-related services and offerings.";
  try {
    const mod = await import(`@/i18n/messages/${locale}/services.json`);
    const root = (mod && typeof mod === 'object') ? (mod as Record<string, unknown>) : {};
    const def = (root.default && typeof root.default === 'object') ? (root.default as Record<string, unknown>) : undefined;
    const services = (def?.services && typeof def.services === 'object') ? (def.services as Record<string, unknown>) : undefined;
    const data = (services?.index && typeof services.index === 'object') ? (services.index as Record<string, unknown>) : {};
    const t = typeof data.seoTitle === 'string' ? data.seoTitle : undefined;
    const d = typeof data.seoDescription === 'string' ? data.seoDescription : undefined;
    title = t || title;
    description = d || description;
  } catch {}

  return {
    title: title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: path, languages },
    openGraph: {
      title: title,
      description,
      url: path,
      siteName: site.name,
      locale: ogLocaleMap[locale],
      type: "website",
    },
    twitter: { card: "summary_large_image", title: title, description },
  };
}
