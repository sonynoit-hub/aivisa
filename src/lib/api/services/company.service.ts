import { EP } from "../endpoints";
import { apiGet } from "../client";
import type { OfficeDetail, OfficeCard } from "@/types/company";

// 选取 locale 对应的 i18n 记录，兼容数组/对象/直接平铺
function pickI18n(raw: any, locale: string) {
  const loc = (locale || '').toLowerCase();
  // 兼容多层嵌套：out.i18n / out.office.i18n / 直接挂载
  const i18n =
    raw?.i18n ??
    raw?.office_i18n ??
    raw?.partner_office_i18n ??
    raw?.out?.i18n ??
    raw?.out?.office?.i18n;
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
  // 支持新接口：OfficeDto.OfficeGetResponse => { out: { office: {...}, i18n: {...} } }
  const base = raw?.out?.office ?? raw?.office ?? raw;
  const i18n = pickI18n(raw, locale) || {};
  // Address: prefer structured object; else build from flat fields; else fallback to i18n string
  const addrFromRaw = base?.address ?? base?.office_address ?? undefined;
  // 后端可能提供 addressZip（camelCase），纳入归一化
  const flatZip = base?.zip ?? base?.postal_code ?? base?.post_code ?? base?.postcode ?? base?.addressZip ?? undefined;
  const flatPref = base?.pref ?? base?.prefecture ?? base?.state ?? undefined;
  const flatCity = base?.city ?? base?.ward ?? undefined;
  const flatLine1 = base?.line1 ?? base?.addr1 ?? base?.address1 ?? base?.street ?? base?.street1 ?? undefined;
  const flatLine2 = base?.line2 ?? base?.addr2 ?? base?.address2 ?? base?.street2 ?? undefined;
  const flatCountry = base?.country ?? undefined;
  const addrBuilt = (flatZip || flatPref || flatCity || flatLine1 || flatLine2 || flatCountry)
    ? { zip: flatZip, pref: flatPref, city: flatCity, line1: flatLine1, line2: flatLine2, country: flatCountry }
    : undefined;
  const i18nAddressString = i18n?.address ?? i18n?.address_text ?? i18n?.addressStr ?? undefined;
  // 地址选择策略：
  // 1) 如果是对象，直接用对象
  // 2) 如果是字符串：
  //    - 若仅有 zip 或少量结构字段，则把字符串塞到 line1，保留 zip，保证既有邮编也有地址文本
  //    - 若结构字段较完整（pref/city/line1/line2/country 任一存在），优先用结构化对象
  //    - 否则回退用字符串
  let addr: any;
  if (addrFromRaw && typeof addrFromRaw === 'object') {
    addr = addrFromRaw;
  } else if (typeof addrFromRaw === 'string') {
    const hasStruct = Boolean(flatPref || flatCity || flatLine1 || flatLine2 || flatCountry);
    if (flatZip || hasStruct) {
      addr = {
        zip: flatZip,
        pref: flatPref,
        city: flatCity,
        line1: flatLine1 || (hasStruct ? undefined : addrFromRaw),
        line2: flatLine2,
        country: flatCountry,
      };
    } else {
      addr = addrFromRaw;
    }
  } else {
    addr = addrBuilt ?? i18nAddressString ?? {};
  }

  const address = typeof addr === 'string' ? addr : (
    addr && typeof addr === 'object'
      ? {
          zip: addr.zip ?? addr.postal_code ?? addr.post_code ?? addr.addressZip ?? undefined,
          pref: addr.pref ?? addr.prefecture ?? undefined,
          city: addr.city ?? undefined,
          line1: addr.line1 ?? addr.addr1 ?? addr.address1 ?? undefined,
          line2: addr.line2 ?? addr.addr2 ?? addr.address2 ?? undefined,
          country: addr.country ?? undefined,
        }
      : undefined
  );

  const name = i18n?.display_name ?? i18n?.displayName ?? base?.display_name ?? base?.displayName ?? i18n?.name ?? base?.name ?? base?.office_name ?? base?.slug ?? '';
  const shortDesc = i18n?.short_desc ?? i18n?.shortDesc ?? base?.shortDesc ?? base?.short_desc ?? base?.intro ?? i18n?.summary ?? base?.summary ?? i18n?.tagline ?? base?.tagline ?? undefined;
  // 兼容 detail 字段的多种命名（后端/数据不一致时依然可显示）
  const descriptionMd =
    i18n?.detail_md ?? i18n?.detailMd ?? i18n?.description_md ?? i18n?.descriptionMd ?? i18n?.detail_markdown ?? i18n?.details_markdown ??
    base?.descriptionMd ?? base?.detailMd ?? base?.description_md ?? base?.detail_md ?? base?.detail ?? base?.details ?? base?.detail_markdown ?? base?.details_markdown ?? base?.description_markdown ?? undefined;

  // Contact info: try i18n first then raw; support common variants
  const websiteUrl = i18n?.websiteUrl ?? i18n?.website_url ?? i18n?.website ?? i18n?.homepage ?? i18n?.home_page ?? i18n?.url ??
    base?.websiteUrl ?? base?.website_url ?? base?.website ?? base?.homepage ?? base?.home_page ?? base?.site ?? base?.url ?? undefined;
  const email = i18n?.email ?? i18n?.mail ?? i18n?.contact_email ?? i18n?.e_mail ?? i18n?.email_public ??
    base?.email ?? base?.mail ?? base?.contact_email ?? base?.e_mail ?? base?.info_email ?? base?.emailPublic ?? undefined;
  const phone = i18n?.phone ?? i18n?.tel ?? i18n?.telephone ?? i18n?.phone_number ?? i18n?.contact_phone ?? i18n?.phone_public ??
    base?.phone ?? base?.tel ?? base?.telephone ?? base?.phone_number ?? base?.contact_phone ?? base?.phonePublic ?? undefined;

  // cards_json: 后端 i18n 表中可能包含的 JSON 字段
  function parseCards(src: any): OfficeCard[] | undefined {
    try {
      const v = src?.cards_json ?? src?.cardsJson ?? src?.cardsJSON ?? src?.cards ?? undefined;
      if (!v) return undefined;
      const parsed = typeof v === 'string' ? JSON.parse(v) : v;
      // 情况1：直接数组
      if (Array.isArray(parsed)) {
        return parsed.filter((x: any) => x && typeof x === 'object');
      }
      // 情况2：对象形式，包含 cards
      if (parsed && typeof parsed === 'object' && parsed.cards) {
        // 2a) cards 是数组
        if (Array.isArray(parsed.cards)) {
          return parsed.cards.filter((x: any) => x && typeof x === 'object');
        }
        // 2b) cards 是对象映射：{ key: {...}, key2: {...} }
        if (parsed.cards && typeof parsed.cards === 'object') {
          const entries = Object.entries(parsed.cards);
          if (entries.length) {
            return entries
              .map(([key, val]) => (val && typeof val === 'object') ? ({ key, ...(val as any) }) : undefined)
              .filter(Boolean) as any[];
          }
        }
      }
      // 情况3：对象映射，如 { legal: {...}, career: {...} }
      if (parsed && typeof parsed === 'object') {
        const entries = Object.entries(parsed);
        if (entries.length) {
          return entries
            .map(([key, val]) => (val && typeof val === 'object') ? ({ key, ...(val as any) }) : undefined)
            .filter(Boolean) as any[];
        }
      }
      return undefined;
    } catch { return undefined; }
  }
  const cards = parseCards(i18n) ?? parseCards(base) ?? parseCards(raw?.out);

  // 辅助解析 JSON 字段
  const parseJson = (v: any) => {
    try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return undefined; }
  };
  const sns = base?.sns ?? parseJson(base?.snsJson ?? base?.sns_json) ?? parseJson(i18n?.snsJson ?? i18n?.sns_json) ?? undefined;
  const media = parseJson(base?.mediaJson ?? base?.media_json) ?? undefined;
  const listings = parseJson(base?.listingsJson ?? base?.listings_json) ?? undefined;
  // 直连咨询渠道
  const contactChannels =
    parseJson(base?.contact_channels_json ?? base?.contactChannelsJson) ??
    parseJson(i18n?.contact_channels_json ?? i18n?.contactChannelsJson) ??
    undefined;
  
  // 解析办公室图片
  const imagesRaw = parseJson(base?.officeImagesJson ?? base?.office_images_json ?? base?.imagesJson ?? base?.images_json) ?? undefined;
  const images = Array.isArray(imagesRaw) 
    ? imagesRaw.filter((img: any) => img && typeof img === 'object' && img.url).map((img: any) => ({
        url: img.url,
        alt: img.alt ?? img.caption ?? img.title ?? undefined,
        sort: typeof img.sort === 'number' ? img.sort : (typeof img.order === 'number' ? img.order : undefined),
        caption: img.caption ?? img.description ?? undefined,
      }))
    : undefined;
  
  const tags = Array.isArray(base?.tags) ? base?.tags : (Array.isArray(i18n?.tags) ? i18n?.tags : undefined);
  const isActive = base?.isActive ?? base?.active ?? undefined;
  const ogImageUrl = base?.ogImageUrl ?? base?.og_image_url ?? undefined;
  const publishedAt = base?.publishedAt ?? base?.published_at ?? undefined;
  const geoLat = base?.geoLat ?? base?.geo_lat ?? base?.lat ?? undefined;
  const geoLng = base?.geoLng ?? base?.geo_lng ?? base?.lng ?? base?.lon ?? base?.long ?? undefined;
  const seoTitle = i18n?.seoTitle ?? i18n?.seo_title ?? undefined;
  const seoDesc = i18n?.seoDesc ?? i18n?.seo_desc ?? undefined;

  return {
    id: base?.id ?? base?.office_id ?? base?.uuid ?? '',
    slug: base?.slug ?? base?.office_slug ?? '',
    isActive,
    name,
    shortDesc,
    descriptionMd,
    websiteUrl,
    email,
    phone,
    address,
    cards,
    languages: base?.languages ?? i18n?.languages ?? undefined,
    services: base?.services ?? i18n?.services ?? base?.tags ?? undefined,
    badgeText: raw?.badgeText ?? raw?.badge_text ?? undefined,
    badgeVariant: raw?.badgeVariant ?? raw?.badge_variant ?? undefined,
    sns,
  contactChannelsJson: contactChannels,
    tags,
    media,
    listings,
    images,
    publishedAt,
    ogImageUrl,
    geoLat,
    geoLng,
    seoTitle,
    seoDesc,
  } as OfficeDetail;
}

export async function getOfficeDetail(slug: string, locale: string): Promise<OfficeDetail> {
  // 获取后端数据（可能为 snake_case 或带 i18n 嵌套），在此归一化到前端 OfficeDetail 结构
  const raw = await apiGet<any>(EP.company.officeDetail(slug), { locale });
  const office = normalizeOfficeDetail(raw, locale);
  return office;
}
