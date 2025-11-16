import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap } from "@/i18n/locales";
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
  const base = site.baseUrl.replace(/\/$/, "");
  const url = `${base}/${locale}/about/faq`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${base}/${l}/about/faq`;

  let description = "Frequently asked questions about our platform.";
  let keywords: string[] | undefined;
  try {
    const mod = await import(`@/i18n/messages/${locale}/about.json`);
    const root = (mod && typeof mod === 'object') ? (mod as Record<string, unknown>) : {};
    const def = (root.default && typeof root.default === 'object') ? (root.default as Record<string, unknown>) : undefined;
    const about = (def?.about && typeof def.about === 'object') ? (def.about as Record<string, unknown>) : undefined;
    const data = (about?.faq && typeof about.faq === 'object') ? (about.faq as Record<string, unknown>) : {};
    const d = typeof data.seoDescription === 'string' ? data.seoDescription : undefined;
    const k = (Array.isArray(data.seoKeywords as unknown) ? (data.seoKeywords as unknown[]) : undefined)?.filter((x): x is string => typeof x === 'string');
    description = d || description;
    keywords = k;
  } catch {}

  // 优先使用静态 SEO 配置中的标题/描述/关键词（若未设置则回退到上面的 i18n 结果）
  const staticMeta = getSeoMeta(locale as Locale, 'about/faq');
  const finalTitle = (staticMeta as { title?: string }).title || 'FAQ';
  const finalDescription = staticMeta.description || description;
  const finalKeywords = staticMeta.keywords || keywords;

  return {
    // 使用 absolute 避免再追加站点后缀（centralized 标题已含品牌）
    title: { absolute: finalTitle },
    description: finalDescription,
    keywords: finalKeywords,
    robots: { index: false, follow: false },
    alternates: { canonical: url, languages },
    openGraph: { title: finalTitle, description: finalDescription, url, siteName: site.name, locale: ogLocaleMap[locale], type: "website" },
    twitter: { card: "summary_large_image", title: finalTitle, description: finalDescription },
  };
}
