import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap } from "@/i18n/locales";
import { site } from "@/config/site";

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
  const base = site.baseUrl.replace(/\/$/, "");
  const path = `${base}/${locale}/services`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${base}/${l}/services`;

  let title = "Services";
  let description = "Our visa-related services and offerings.";
  let keywords: string[] | undefined;
  try {
    const mod = await import(`@/i18n/messages/${locale}/services.json`);
    const data = (mod as any).default?.services?.index ?? {};
    title = data.seoTitle || title;
    description = data.seoDescription || description;
    keywords = Array.isArray(data.seoKeywords) ? data.seoKeywords : undefined;
  } catch {}

  return {
    title: `${title} | ${site.name}`,
    description,
    keywords,
    robots: { index: false, follow: false },
    alternates: { canonical: path, languages },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: path,
      siteName: site.name,
      locale: ogLocaleMap[locale],
      type: "website",
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description },
  };
}
