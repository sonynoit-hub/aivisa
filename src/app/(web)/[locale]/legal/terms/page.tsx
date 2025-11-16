import path from "node:path";
import fs from "node:fs/promises";
import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap } from "@/i18n/locales";
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
  const base = site.baseUrl.replace(/\/$/, "");
  const url = `${base}/${locale}/legal/terms`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${base}/${l}/legal/terms`;

  let description = "The terms and conditions for using our services.";
  let keywords: string[] | undefined;
  try {
    const mod = await import(`@/i18n/messages/${locale}/legal.json`);
    const root = (mod && typeof mod === 'object') ? (mod as Record<string, unknown>) : {};
    const def = (root.default && typeof root.default === 'object') ? (root.default as Record<string, unknown>) : undefined;
    const legal = (def?.legal && typeof def.legal === 'object') ? (def.legal as Record<string, unknown>) : undefined;
    const data = (legal?.terms && typeof legal.terms === 'object') ? (legal.terms as Record<string, unknown>) : {};
    const d = typeof data.seoDescription === 'string' ? data.seoDescription : undefined;
    const k = (Array.isArray(data.seoKeywords as unknown) ? (data.seoKeywords as unknown[]) : undefined)?.filter((x): x is string => typeof x === 'string');
    description = d || description;
    keywords = k;
  } catch {}

  // 从集中配置获取标题/描述/关键词；描述/关键词若缺失则回退到上面的 i18n 结果
  const staticMeta = getSeoMeta(locale as Locale, 'legal/terms');
  const finalTitle = (staticMeta as { title?: string }).title || 'Terms of Service';
  const finalDescription = staticMeta.description || description;
  const finalKeywords = staticMeta.keywords || keywords;

  return {
    // 使用 absolute 避免模板追加站点名（集中配置已包含品牌）
    title: { absolute: finalTitle },
    description: finalDescription,
    keywords: finalKeywords,
    robots: { index: false, follow: false },
    alternates: { canonical: url, languages },
    openGraph: { title: finalTitle, description: finalDescription, url, siteName: site.name, locale: ogLocaleMap[locale], type: "article" },
    twitter: { card: "summary", title: finalTitle, description: finalDescription },
  };
}
