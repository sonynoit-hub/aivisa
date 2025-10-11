import { EP } from "../endpoints";
import type { Visa, VisaDetail, DocumentItem } from "@/types/visa";
import { visaCatalog } from "@/data/visaCatalog";
import type { Locale } from "@/i18n/locales";
import { z } from "zod";
import { createHttpWithSchema } from "../client";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

// Schemas
const DocumentItemSchema = z.object({ id: z.string(), name: z.string() });
const DocumentListSchema = z.array(DocumentItemSchema);
const VisaSchema = z.object({ slug: z.string(), title: z.string(), summary: z.string().optional().default("") });
const VisaListSchema = z.array(VisaSchema);
const VisaDetailSchema = z.object({ slug: z.string(), title: z.string(), summary: z.string().optional().default(""), html: z.string() });

const httpDocs = createHttpWithSchema(DocumentListSchema);
const httpVisaList = createHttpWithSchema(VisaListSchema);
const httpVisaDetail = createHttpWithSchema(VisaDetailSchema);

export async function getVisaList(locale: string): Promise<Visa[]> {
  if (USE_MOCK) {
    const l = (locale as Locale);
    return visaCatalog.map(v => ({
      slug: v.slug,
      title: v.names[l] ?? v.names.ja ?? v.slug,
  summary: "",
    }));
  }
  return httpVisaList(`${EP.visa.list}?locale=${locale}`, { cache: "force-cache", next: { revalidate: 3600 } });
}

export async function getVisaDetail(slug: string, locale: string): Promise<VisaDetail> {
  if (USE_MOCK) {
    const l = (locale as Locale);
    const meta = visaCatalog.find(v => v.slug === slug);
    const title = meta?.names[l] ?? meta?.names.ja ?? slug;
  const summary = "";
    return {
      slug,
      title,
      summary,
      html: `<p>${title} の詳細説明（ダミー）。</p>`
    };
  }
  return httpVisaDetail(`${EP.visa.detail(slug)}?locale=${locale}`);
}

export async function getVisaDocuments(slug: string, locale: string): Promise<DocumentItem[]> {
  if (USE_MOCK) {
    return [
      { id: "1", name: "パスポート" },
      { id: "2", name: "写真（縦4cm×横3cm）" }
    ];
  }
  return httpDocs(`${EP.visa.documents(slug)}?locale=${locale}`, { cache: "force-cache", next: { revalidate: 86400 } });
}
