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
    const findBy = (k: string) => i18n.find((r: any) => String(r?.[k] || '').toLowerCase().startsWith(loc));
    const rec = findBy('locale') || findBy('language') || findBy('lang') || findBy('cc');
    return rec || i18n[0] || {};
  }
  return {};
}

export function normalizeOfficeDetail(raw: any, locale: string): OfficeDetail {
  const i18n = pickI18n(raw, locale) || {};
  const addr = raw?.address || raw?.office_address || {};

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

  const name = i18n?.display_name ?? raw?.display_name ?? i18n?.name ?? raw?.name ?? raw?.slug ?? '';
  const shortDesc = i18n?.short_desc ?? raw?.shortDesc ?? raw?.short_desc ?? raw?.intro ?? undefined;
  const descriptionMd = i18n?.detail_md ?? raw?.descriptionMd ?? raw?.detail_md ?? raw?.detail ?? raw?.details ?? raw?.detail_markdown ?? undefined;

  return {
    id: raw?.id ?? raw?.office_id ?? raw?.uuid ?? '',
    slug: raw?.slug ?? raw?.office_slug ?? '',
    name,
    shortDesc,
    descriptionMd,
    websiteUrl: raw?.websiteUrl ?? raw?.website_url ?? raw?.site ?? undefined,
    email: raw?.email ?? undefined,
    phone: raw?.phone ?? undefined,
    address,
    languages: raw?.languages ?? i18n?.languages ?? undefined,
    services: raw?.services ?? i18n?.services ?? undefined,
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
