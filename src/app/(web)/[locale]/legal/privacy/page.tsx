import path from "node:path";
import fs from "node:fs/promises";
import type { Metadata } from "next";
import { locales, type Locale, ogLocaleMap } from "@/i18n/locales";
import { site } from "@/config/site";
import Markdown from "@/components/common/Markdown";

export default async function PrivacyPolicy(
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale: locRaw } = await params;
  const supported = ["ja", "en", "zh", "vi", "ko"] as const;
  const loc = (supported as readonly string[]).includes(locRaw) ? (locRaw as typeof supported[number]) : "ja";
  const base = path.join(process.cwd(), "src/i18n/dictionaries/legal");
  const file = path.join(base, loc, "privacy.md");
  let content = "";
  try {
    content = await fs.readFile(file, "utf-8");
  } catch {
    content = await fs.readFile(path.join(base, "ja", "privacy.md"), "utf-8");
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
  const url = `${base}/${locale}/legal/privacy`;
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${base}/${l}/legal/privacy`;

  let title = "Privacy Policy";
  let description = "Our commitment to protecting your privacy.";
  let keywords: string[] | undefined;
  try {
    const mod = await import(`@/i18n/messages/${locale}/legal.json`);
    const data = (mod as any).default?.legal?.privacy ?? {};
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
    openGraph: { title: `${title} | ${site.name}`, description, url, siteName: site.name, locale: ogLocaleMap[locale], type: "article" },
    twitter: { card: "summary", title: `${title} | ${site.name}`, description },
  };
}
