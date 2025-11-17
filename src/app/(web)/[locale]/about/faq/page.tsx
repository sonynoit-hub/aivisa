import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap, defaultLocale } from "@/i18n/locales";
import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
const FaqClient = dynamic(() => import("./FaqClient"), { ssr: true });
import { site } from "@/config/site";
import { getSeoMeta } from "@/config/seo-tags";

type Props = { params: Promise<{ locale: Locale }> };

export default async function FAQPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  let title = "FAQ";
  try {
    const t = await getTranslations({ locale, namespace: "faq" });
    title = t("title");
  } catch {
    try {
      const mod = await import(`@/i18n/messages/${locale}/faq.json`);
      const root = (mod?.default ?? {}) as Record<string, unknown>;
      const data = (root.faq && typeof root.faq === 'object') ? (root.faq as Record<string, unknown>) : root;
      const maybeTitle = data.title;
      if (typeof maybeTitle === 'string') title = maybeTitle;
    } catch {}
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      <FaqClient />
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const url = `/${locale}/about/faq`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `/${l}/about/faq`;
  languages["x-default"] = `/${defaultLocale}/about/faq`;

  const staticMeta = getSeoMeta(locale as Locale, 'about/faq');
  const finalTitle = (staticMeta as { title?: string }).title || 'FAQ';
  const finalDescription = staticMeta.description || 'Frequently asked questions about our platform.';

  return {
    title: { absolute: finalTitle },
    description: finalDescription,
    robots: { index: false, follow: false },
    alternates: { canonical: url, languages },
    openGraph: { title: finalTitle, description: finalDescription, url, siteName: site.name, locale: ogLocaleMap[locale], type: "website" },
    twitter: { card: "summary_large_image", title: finalTitle, description: finalDescription },
  };
}
