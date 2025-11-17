import path from "node:path";
import fs from "node:fs/promises";
import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap, defaultLocale } from "@/i18n/locales";
import { site } from "@/config/site";
import { getSeoMeta } from "@/config/seo-tags";
import Markdown from "@/components/common/Markdown";

export default async function TermsOfUse(
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale: locRaw } = await params;
  const supported = ["ja", "en", "zh", "vi", "ko"] as const;
  const loc = (supported as readonly string[]).includes(locRaw) ? (locRaw as typeof supported[number]) : "ja";
  const base = path.join(process.cwd(), "src/i18n/dictionaries/legal");
  const file = path.join(base, loc, "terms.md");
  let content = "";
  try {
    content = await fs.readFile(file, "utf-8");
  } catch {
    content = await fs.readFile(path.join(base, "ja", "terms.md"), "utf-8");
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Markdown className="prose prose-slate max-w-none">{content}</Markdown>
    </div>
  );
}

type Params = { params: Promise<{ locale: Locale }> };
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const url = `/${locale}/legal/terms`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `/${l}/legal/terms`;
  languages["x-default"] = `/${defaultLocale}/legal/terms`;

  const staticMeta = getSeoMeta(locale as Locale, 'legal/terms');
  const finalTitle = (staticMeta as { title?: string }).title || 'Terms of Service';
  const finalDescription = staticMeta.description || 'The terms and conditions for using our services.';

  return {
    // 使用 absolute 避免模板追加站点名（集中配置已包含品牌）
    title: { absolute: finalTitle },
    description: finalDescription,
    robots: { index: false, follow: false },
    alternates: { canonical: url, languages },
    openGraph: { title: finalTitle, description: finalDescription, url, siteName: site.name, locale: ogLocaleMap[locale], type: "article" },
    twitter: { card: "summary", title: finalTitle, description: finalDescription },
  };
}
