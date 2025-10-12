import { EP } from "../endpoints";
import { apiGet } from "../client";
import type { CompanyAdContext } from "@/types/ad";
import { normalizeOfficeDetail } from "./company.service";

export async function getCompanyAdContext(officeSlug: string, adSlug: string, locale: string): Promise<CompanyAdContext> {
  const raw = await apiGet<any>(EP.company.officeAdContext(officeSlug, adSlug), { locale });
  const companyRaw = raw?.company ?? raw?.office ?? raw?.partner_office ?? raw?.data?.company ?? raw?.data?.office;
  const company = normalizeOfficeDetail(companyRaw || {}, locale);
  const ad = raw?.ad ?? raw?.advert ?? raw?.advertisement ?? raw?.data?.ad ?? raw?.data?.advert;
  const placement = raw?.placement ?? raw?.data?.placement;
  if (process.env.NODE_ENV !== 'production' && !company.descriptionMd) {
    console.warn("[companyAd] descriptionMd missing for", officeSlug, "locale=", locale, "keys:", Object.keys(companyRaw || {}));
  }
  return { company, ad, placement } as CompanyAdContext;
}
