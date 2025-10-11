import { visaCatalog } from "@/data/visaCatalog";
import { visaCategories } from "@/data/visaCategories";

export function validateVisaData() {
  const slugs = new Set(visaCatalog.map(v => v.slug));
  const missing: string[] = [];
  for (const c of visaCategories) {
    for (const s of c.visas) {
      if (!slugs.has(s)) missing.push(`${c.key}:${s}`);
    }
  }
  if (missing.length) {
    console.warn("[validateVisaData] Unknown slugs in visaCategories:", missing);
  }
}
