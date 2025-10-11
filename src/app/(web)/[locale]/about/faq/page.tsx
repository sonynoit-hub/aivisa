import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap } from "@/i18n/locales";
import { site } from "@/config/site";

type Props = { params: Promise<{ locale: Locale }> };

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>よくある質問１</li>
        <li>よくある質問２</li>
      </ul>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const base = site.baseUrl.replace(/\/$/, "");
  const url = `${base}/${locale}/about/faq`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${base}/${l}/about/faq`;

  let title = "FAQ";
  let description = "Frequently asked questions about our platform.";
  let keywords: string[] | undefined;
  try {
    const mod = await import(`@/i18n/messages/${locale}/about.json`);
    const data = (mod as any).default?.about?.faq ?? {};
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
