import { EP } from "../endpoints";
import { apiGet } from "../client";
import type { OfficeDetail, OfficeCard } from "@/types/company";

// 选取 locale 对应的 i18n 记录，兼容数组/对象/直接平铺
function pickI18n(raw: unknown, locale: string): Record<string, unknown> {
  const loc = (locale || '').toLowerCase();
  const normalize = (s: string) => String(s || '').toLowerCase().replace(/_/g, '-');
  const nloc = normalize(loc);
  const base = nloc.split('-')[0];
  // 兼容多层嵌套：out.i18n / out.office.i18n / 直接挂载
  const r = raw as Record<string, unknown> | undefined;
  const out = (r?.["out"] as Record<string, unknown> | undefined) ?? undefined;
  const outOffice = (out?.["office"] as Record<string, unknown> | undefined) ?? undefined;
  const i18n = (r?.["i18n"]
    ?? r?.["office_i18n"]
    ?? r?.["partner_office_i18n"]
    ?? out?.["i18n"]
    ?? outOffice?.["i18n"]) as unknown;
  if (!i18n) return {};
  // 1) { ja: {...}, en: {...} } 这种 map 结构
  if (!Array.isArray(i18n) && typeof i18n === 'object') {
    const map = i18n as Record<string, unknown>;
    const keys = Object.keys(map);
    // 1) 精确匹配（包含带地区）
    let key = keys.find((k) => normalize(k) === nloc);
    // 2) loc 或 key 前缀匹配（en 与 en-US / en_US 互通）
    if (!key) key = keys.find((k) => normalize(k).startsWith(nloc) || nloc.startsWith(normalize(k)));
    // 3) 仅语言部分匹配（如 en），尝试等于或前缀
    if (!key) key = keys.find((k) => normalize(k) === base || normalize(k).startsWith(base));
    // 4) 旧逻辑的直取（防御）
    if (!key && (map[loc] || map[base])) key = (map[loc] ? loc : base);
    if (key) {
      const val = map[key];
      if (val && typeof val === 'object') return val as Record<string, unknown>;
    }
    // 退回任意一个
    const anyKey = keys[0];
    const anyVal = map[anyKey];
    return (anyVal && typeof anyVal === 'object') ? (anyVal as Record<string, unknown>) : {};
  }
  // 2) 数组结构，尝试按 language/locale/lang/cc 匹配
  if (Array.isArray(i18n)) {
    // 兼容更多可能的键名
    const candidates = ['locale', 'language', 'lang', 'cc', 'locale_code', 'lang_code', 'language_code'];
    const list = i18n as Array<Record<string, unknown>>;
    const findBy = (k: string) => list.find((row) => String((row?.[k] as string | undefined) || '').toLowerCase().startsWith(loc));
    const rec = candidates.reduce<Record<string, unknown> | undefined>((acc, key) => acc || findBy(key), undefined);
    return rec || (list[0] ?? {});
  }
  return {};
}

export function normalizeOfficeDetail(raw: unknown, locale: string): OfficeDetail {
  // 支持新接口：OfficeDto.OfficeGetResponse => { out: { office: {...}, i18n: {...} } }
  const r = raw as Record<string, unknown> | undefined;
  const base = (r?.["out"] as Record<string, unknown> | undefined)?.["office"] ?? r?.["office"] ?? r;
  const i18n = pickI18n(raw, locale) || {};
  // Address: prefer structured object; else build from flat fields; else fallback to i18n string
  const addrFromRaw = (base as Record<string, unknown> | undefined)?.["address"] ?? (base as Record<string, unknown> | undefined)?.["office_address"] ?? undefined;
  // 后端可能提供 addressZip（camelCase），纳入归一化
  const b = (base as Record<string, unknown>) || {};
  const flatZip = b["zip"] ?? b["postal_code"] ?? b["post_code"] ?? b["postcode"] ?? b["addressZip"] ?? undefined;
  const flatPref = b["pref"] ?? b["prefecture"] ?? b["state"] ?? undefined;
  const flatCity = b["city"] ?? b["ward"] ?? undefined;
  const flatLine1 = b["line1"] ?? b["addr1"] ?? b["address1"] ?? b["street"] ?? b["street1"] ?? undefined;
  const flatLine2 = b["line2"] ?? b["addr2"] ?? b["address2"] ?? b["street2"] ?? undefined;
  const flatCountry = b["country"] ?? undefined;
  const addrBuilt = (flatZip || flatPref || flatCity || flatLine1 || flatLine2 || flatCountry)
    ? { zip: flatZip, pref: flatPref, city: flatCity, line1: flatLine1, line2: flatLine2, country: flatCountry }
    : undefined;
  // 从 i18n 提取地址字符串：首选 addressI18n；兼容一次性 address_text 与 snake_case
  const pickI18nAddress = (src: Record<string, unknown> | undefined): string | undefined => {
    if (!src) return undefined;
    const s = src as Record<string, unknown>;
    const v = (s["addressI18n"] ?? s["address_i18n"] ?? s["address_text"]) as unknown;
    return typeof v === 'string' && v.trim().length > 0 ? (v as string) : undefined;
  };
  // 优先使用后端 DTO 已赋值在 office 上的 addressI18n（已按 locale 处理），否则再从 i18n map 中提取
  const baseAddressI18n = (b["addressI18n"] ?? b["address_i18n"]) as string | undefined;
  const i18nAddressString = (typeof baseAddressI18n === 'string' && baseAddressI18n.trim().length > 0)
    ? baseAddressI18n
    : pickI18nAddress(i18n as Record<string, unknown> | undefined);
  // 地址选择策略：
  // 1) 如果是对象，直接用对象
  // 2) 如果是字符串：
  //    - 若仅有 zip 或少量结构字段，则把字符串塞到 line1，保留 zip，保证既有邮编也有地址文本
  //    - 若结构字段较完整（pref/city/line1/line2/country 任一存在），优先用结构化对象
  //    - 否则回退用字符串
  let addr: unknown;
  if (addrFromRaw && typeof addrFromRaw === 'object') {
    addr = addrFromRaw as Record<string, unknown>;
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
          zip: (addr as Record<string, unknown>)["zip"] ?? (addr as Record<string, unknown>)["postal_code"] ?? (addr as Record<string, unknown>)["post_code"] ?? (addr as Record<string, unknown>)["addressZip"] ?? undefined,
          pref: (addr as Record<string, unknown>)["pref"] ?? (addr as Record<string, unknown>)["prefecture"] ?? undefined,
          city: (addr as Record<string, unknown>)["city"] ?? undefined,
          line1: (addr as Record<string, unknown>)["line1"] ?? (addr as Record<string, unknown>)["addr1"] ?? (addr as Record<string, unknown>)["address1"] ?? undefined,
          line2: (addr as Record<string, unknown>)["line2"] ?? (addr as Record<string, unknown>)["addr2"] ?? (addr as Record<string, unknown>)["address2"] ?? undefined,
          country: (addr as Record<string, unknown>)["country"] ?? undefined,
        }
      : undefined
  );

  // 供前端直接展示的多语言地址文本：优先使用 i18n 提供的字符串，否则拼接结构字段（不含 zip）
  const addressI18n = (typeof i18nAddressString === 'string' && i18nAddressString.trim().length > 0)
    ? i18nAddressString
    : (typeof address === 'string'
        ? address
        : (address && typeof address === 'object'
            ? [
                (address as Record<string, unknown>)["pref"],
                (address as Record<string, unknown>)["city"],
                (address as Record<string, unknown>)["line1"],
                (address as Record<string, unknown>)["line2"],
                (address as Record<string, unknown>)["country"],
              ].filter(Boolean).join(' ')
            : undefined));

  const name = (i18n?.["display_name"] ?? i18n?.["displayName"] ?? b["display_name"] ?? b["displayName"] ?? i18n?.["name"] ?? b["name"] ?? b["office_name"] ?? b["slug"] ?? '') as string;
  const shortDesc = (i18n?.["short_desc"] ?? i18n?.["shortDesc"] ?? b["shortDesc"] ?? b["short_desc"] ?? b["intro"] ?? i18n?.["summary"] ?? b["summary"] ?? i18n?.["tagline"] ?? b["tagline"] ?? undefined) as string | undefined;
  // 兼容 detail 字段的多种命名（后端/数据不一致时依然可显示）
  const descriptionMd =
  (i18n?.["detail_md"] ?? i18n?.["detailMd"] ?? i18n?.["description_md"] ?? i18n?.["descriptionMd"] ?? i18n?.["detail_markdown"] ?? i18n?.["details_markdown"] ??
  b["descriptionMd"] ?? b["detailMd"] ?? b["description_md"] ?? b["detail_md"] ?? b["detail"] ?? b["details"] ?? b["detail_markdown"] ?? b["details_markdown"] ?? b["description_markdown"] ?? undefined) as string | undefined;

  // Contact info: try i18n first then raw; support common variants
  const websiteUrl = (i18n?.["websiteUrl"] ?? i18n?.["website_url"] ?? i18n?.["website"] ?? i18n?.["homepage"] ?? i18n?.["home_page"] ?? i18n?.["url"] ??
    b["websiteUrl"] ?? b["website_url"] ?? b["website"] ?? b["homepage"] ?? b["home_page"] ?? b["site"] ?? b["url"] ?? undefined) as string | undefined;
  const email = (i18n?.["email"] ?? i18n?.["mail"] ?? i18n?.["contact_email"] ?? i18n?.["e_mail"] ?? i18n?.["email_public"] ??
    b["email"] ?? b["mail"] ?? b["contact_email"] ?? b["e_mail"] ?? b["info_email"] ?? b["emailPublic"] ?? undefined) as string | undefined;
  const phone = (i18n?.["phone"] ?? i18n?.["tel"] ?? i18n?.["telephone"] ?? i18n?.["phone_number"] ?? i18n?.["contact_phone"] ?? i18n?.["phone_public"] ??
    b["phone"] ?? b["tel"] ?? b["telephone"] ?? b["phone_number"] ?? b["contact_phone"] ?? b["phonePublic"] ?? undefined) as string | undefined;

  // cards_json: 后端 i18n 表中可能包含的 JSON 字段
  function parseCards(src: unknown): OfficeCard[] | undefined {
    try {
      const s = src as Record<string, unknown> | undefined;
      const v = s?.["cards_json"] ?? s?.["cardsJson"] ?? s?.["cardsJSON"] ?? s?.["cards"] ?? undefined;
      if (!v) return undefined;
      const parsed = typeof v === 'string' ? JSON.parse(v) : v;
      // 情况1：直接数组
      if (Array.isArray(parsed)) {
        return parsed.filter((x) => x && typeof x === 'object') as OfficeCard[];
      }
      // 情况2：对象形式，包含 cards
      if (parsed && typeof parsed === 'object' && (parsed as Record<string, unknown>)["cards"]) {
        // 2a) cards 是数组
        if (Array.isArray((parsed as Record<string, unknown>)["cards"])) {
          return ((parsed as Record<string, unknown>)["cards"] as unknown[]).filter((x) => x && typeof x === 'object') as OfficeCard[];
        }
        // 2b) cards 是对象映射：{ key: {...}, key2: {...} }
        if ((parsed as Record<string, unknown>)["cards"] && typeof (parsed as Record<string, unknown>)["cards"] === 'object') {
          const entries = Object.entries((parsed as Record<string, unknown>)["cards"] as Record<string, unknown>);
          if (entries.length) {
            return entries
              .map(([key, val]) => (val && typeof val === 'object') ? ({ key, ...(val as Record<string, unknown>) } as OfficeCard) : undefined)
              .filter(Boolean) as OfficeCard[];
          }
        }
      }
      // 情况3：对象映射，如 { legal: {...}, career: {...} }
      if (parsed && typeof parsed === 'object') {
        const entries = Object.entries(parsed as Record<string, unknown>);
        if (entries.length) {
          return entries
            .map(([key, val]) => (val && typeof val === 'object') ? ({ key, ...(val as Record<string, unknown>) } as OfficeCard) : undefined)
            .filter(Boolean) as OfficeCard[];
        }
      }
      return undefined;
    } catch { return undefined; }
  }
  const cards = parseCards(i18n) ?? parseCards(base) ?? parseCards((r?.["out"] as unknown));

  // 辅助解析 JSON 字段
  const parseJson = (v: unknown) => {
    try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return undefined; }
  };
  const sns = b["sns"] ?? parseJson(b["snsJson"] ?? b["sns_json"]) ?? parseJson(i18n?.["snsJson"] ?? i18n?.["sns_json"]) ?? undefined;
  const media = parseJson(b["mediaJson"] ?? b["media_json"]) ?? undefined;
  const listings = parseJson(b["listingsJson"] ?? b["listings_json"]) ?? undefined;
  // 直连咨询渠道：按新契约返回 JSON 字符串（语言相关；缺省为 "{}"）
  const rawContact = (i18n?.["contact_channels_json"]
    ?? i18n?.["contactChannelsJson"]
    ?? b["contact_channels_json"]
    ?? b["contactChannelsJson"]) as unknown;
  let contactChannelsJson = "{}";
  if (typeof rawContact === 'string' && rawContact.trim().length > 0) {
    contactChannelsJson = rawContact;
  } else if (rawContact && typeof rawContact === 'object') {
    try { contactChannelsJson = JSON.stringify(rawContact); } catch { contactChannelsJson = "{}"; }
  }
  
  // 解析办公室图片
  const imagesRaw = parseJson(b["officeImagesJson"] ?? b["office_images_json"] ?? b["imagesJson"] ?? b["images_json"]) ?? undefined;
  const images = Array.isArray(imagesRaw) 
    ? (imagesRaw as unknown[])
        .filter((img) => img && typeof img === 'object' && typeof (img as Record<string, unknown>)["url"] === 'string')
        .map((img) => ({
          url: (img as Record<string, unknown>)["url"] as string,
          alt: ((img as Record<string, unknown>)["alt"] ?? (img as Record<string, unknown>)["caption"] ?? (img as Record<string, unknown>)["title"]) as string | undefined,
          sort: typeof (img as Record<string, unknown>)["sort"] === 'number' ? ((img as Record<string, unknown>)["sort"] as number) : (typeof (img as Record<string, unknown>)["order"] === 'number' ? ((img as Record<string, unknown>)["order"] as number) : undefined),
          caption: ((img as Record<string, unknown>)["caption"] ?? (img as Record<string, unknown>)["description"]) as string | undefined,
        }))
    : undefined;
  
  // 标签：来自 i18n 按语言返回；若无则返回空数组
  const tags = Array.isArray(i18n?.["tags"]) ? (i18n?.["tags"] as string[]) : [];
  const isActive = (b["isActive"] ?? b["active"]) as boolean | undefined;
  const ogImageUrl = (b["ogImageUrl"] ?? b["og_image_url"]) as string | undefined;
  const publishedAt = (b["publishedAt"] ?? b["published_at"]) as string | undefined;
  const geoLat = (b["geoLat"] ?? b["geo_lat"] ?? b["lat"]) as number | undefined;
  const geoLng = (b["geoLng"] ?? b["geo_lng"] ?? b["lng"] ?? b["lon"] ?? b["long"]) as number | undefined;
  const seoTitle = (i18n?.["seoTitle"] ?? i18n?.["seo_title"]) as string | undefined;
  const seoDesc = (i18n?.["seoDesc"] ?? i18n?.["seo_desc"]) as string | undefined;

  return {
    id: (b["id"] ?? b["office_id"] ?? b["uuid"] ?? '') as string,
    slug: (b["slug"] ?? b["office_slug"] ?? '') as string,
    isActive,
    name,
    shortDesc,
    descriptionMd,
    websiteUrl,
    email,
    phone,
  address,
  addressI18n: addressI18n || undefined,
    cards,
    languages: (b["languages"] ?? i18n?.["languages"] ?? undefined) as string[] | undefined,
    services: (b["services"] ?? i18n?.["services"] ?? b["tags"] ?? undefined) as string[] | undefined,
    badgeText: (r?.["badgeText"] ?? r?.["badge_text"] ?? undefined) as string | undefined,
    badgeVariant: (r?.["badgeVariant"] ?? r?.["badge_variant"] ?? undefined) as string | undefined,
    sns,
  contactChannelsJson,
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

export type OfficeDetailOptions = {
  timeoutMs?: number;
  // 当为 true 时，捕获错误并返回最小降级数据，避免页面/metadata 崩溃
  suppressError?: boolean;
};

export async function getOfficeDetail(slug: string, locale: string, opts?: OfficeDetailOptions): Promise<OfficeDetail> {
  try {
    // 获取后端数据（可能为 snake_case 或带 i18n 嵌套），在此归一化到前端 OfficeDetail 结构
    const raw = await apiGet<unknown>(EP.company.officeDetail(slug), { locale }, { timeoutMs: opts?.timeoutMs });
    const office = normalizeOfficeDetail(raw, locale);
    return office;
  } catch (err) {
    if (opts?.suppressError) {
      // 返回最小可渲染结构，保障页面/metadata 不因后端超时而整体失败
      const fallback: OfficeDetail = {
        id: slug,
        slug,
        name: slug.replace(/[-_]/g, ' '),
        shortDesc: undefined,
        contactChannelsJson: "{}",
        tags: [],
      } as OfficeDetail;
      return fallback;
    }
    throw err;
  }
}
