import { EP } from "../endpoints";
import { apiGet } from "../client";
import type { OfficeDetail } from "@/types/company";

// 选取 locale 对应的 i18n 记录，兼容数组/对象/直接平铺
function pickI18n(raw: any, locale: string) {
  const loc = (locale || '').toLowerCase();
  const i18n = raw?.i18n ?? raw?.office_i18n ?? raw?.partner_office_i18n;
  if (!i18n) return {};
  // 1) { ja: {...}, en: {...} } 这种 map 结构
  if (!Array.isArray(i18n) && typeof i18n === 'object') {
    const direct = i18n[loc] || i18n[loc.split('-')[0]];
    if (direct) return direct;
    // 退回任意一个
    const anyKey = Object.keys(i18n)[0];
    return i18n[anyKey] || {};
  }
  // 2) 数组结构，尝试按 language/locale/lang/cc 匹配
  if (Array.isArray(i18n)) {
    // 兼容更多可能的键名
    const candidates = ['locale', 'language', 'lang', 'cc', 'locale_code', 'lang_code', 'language_code'];
    const findBy = (k: string) => i18n.find((r: any) => String(r?.[k] || '').toLowerCase().startsWith(loc));
    const rec = candidates.reduce((acc: any, key) => acc || findBy(key), undefined as any);
    return rec || i18n[0] || {};
  }
  return {};
}

export function normalizeOfficeDetail(raw: any, locale: string): OfficeDetail {
  const i18n = pickI18n(raw, locale) || {};
  // Address: prefer structured object; else build from flat fields; else fallback to i18n string
  const addrFromRaw = raw?.address ?? raw?.office_address ?? undefined;
  const flatZip = raw?.zip ?? raw?.postal_code ?? raw?.post_code ?? raw?.postcode ?? undefined;
  const flatPref = raw?.pref ?? raw?.prefecture ?? raw?.state ?? undefined;
  const flatCity = raw?.city ?? raw?.ward ?? undefined;
  const flatLine1 = raw?.line1 ?? raw?.addr1 ?? raw?.address1 ?? raw?.street ?? raw?.street1 ?? undefined;
  const flatLine2 = raw?.line2 ?? raw?.addr2 ?? raw?.address2 ?? raw?.street2 ?? undefined;
  const flatCountry = raw?.country ?? undefined;
  const addrBuilt = (flatZip || flatPref || flatCity || flatLine1 || flatLine2 || flatCountry)
    ? { zip: flatZip, pref: flatPref, city: flatCity, line1: flatLine1, line2: flatLine2, country: flatCountry }
    : undefined;
  const i18nAddressString = i18n?.address ?? i18n?.address_text ?? i18n?.addressStr ?? undefined;
  const addr = addrFromRaw ?? addrBuilt ?? i18nAddressString ?? {};

  const address = typeof addr === 'string' ? addr : (
    addr && typeof addr === 'object'
      ? {
          zip: addr.zip ?? addr.postal_code ?? addr.post_code ?? undefined,
          pref: addr.pref ?? addr.prefecture ?? undefined,
          city: addr.city ?? undefined,
          line1: addr.line1 ?? addr.addr1 ?? addr.address1 ?? undefined,
          line2: addr.line2 ?? addr.addr2 ?? addr.address2 ?? undefined,
          country: addr.country ?? undefined,
        }
      : undefined
  );

  const name = i18n?.display_name ?? raw?.display_name ?? raw?.displayName ?? i18n?.name ?? raw?.name ?? raw?.office_name ?? raw?.slug ?? '';
  const shortDesc = i18n?.short_desc ?? raw?.shortDesc ?? raw?.short_desc ?? raw?.intro ?? i18n?.summary ?? raw?.summary ?? i18n?.tagline ?? raw?.tagline ?? undefined;
  // 兼容 detail 字段的多种命名（后端/数据不一致时依然可显示）
  const descriptionMd =
    i18n?.detail_md ?? i18n?.detailMd ?? i18n?.description_md ?? i18n?.descriptionMd ?? i18n?.detail_markdown ?? i18n?.details_markdown ??
    raw?.descriptionMd ?? raw?.detailMd ?? raw?.description_md ?? raw?.detail_md ?? raw?.detail ?? raw?.details ?? raw?.detail_markdown ?? raw?.details_markdown ?? raw?.description_markdown ?? undefined;

  // Contact info: try i18n first then raw; support common variants
  const websiteUrl = i18n?.websiteUrl ?? i18n?.website_url ?? i18n?.website ?? i18n?.homepage ?? i18n?.home_page ?? i18n?.url ??
    raw?.websiteUrl ?? raw?.website_url ?? raw?.website ?? raw?.homepage ?? raw?.home_page ?? raw?.site ?? raw?.url ?? undefined;
  const email = i18n?.email ?? i18n?.mail ?? i18n?.contact_email ?? i18n?.e_mail ?? i18n?.email_public ??
    raw?.email ?? raw?.mail ?? raw?.contact_email ?? raw?.e_mail ?? raw?.info_email ?? raw?.emailPublic ?? undefined;
  const phone = i18n?.phone ?? i18n?.tel ?? i18n?.telephone ?? i18n?.phone_number ?? i18n?.contact_phone ?? i18n?.phone_public ??
    raw?.phone ?? raw?.tel ?? raw?.telephone ?? raw?.phone_number ?? raw?.contact_phone ?? raw?.phonePublic ?? undefined;

  return {
    id: raw?.id ?? raw?.office_id ?? raw?.uuid ?? '',
    slug: raw?.slug ?? raw?.office_slug ?? '',
    name,
    shortDesc,
    descriptionMd,
  websiteUrl,
  email,
  phone,
    address,
  languages: raw?.languages ?? i18n?.languages ?? undefined,
  services: raw?.services ?? i18n?.services ?? raw?.tags ?? undefined,
    badgeText: raw?.badgeText ?? raw?.badge_text ?? undefined,
    badgeVariant: raw?.badgeVariant ?? raw?.badge_variant ?? undefined,
    sns: raw?.sns ?? undefined,
  } as OfficeDetail;
}

export async function getOfficeDetail(slug: string, locale: string): Promise<OfficeDetail> {
  // 获取后端数据（可能为 snake_case 或带 i18n 嵌套），在此归一化到前端 OfficeDetail 结构
  const raw = await apiGet<any>(EP.company.officeDetail(slug), { locale });
  const office = normalizeOfficeDetail(raw, locale);
  return office;
}
