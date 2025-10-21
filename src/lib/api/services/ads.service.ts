import { EP } from "../endpoints";
import { apiGet } from "../client";
import type { AdPlacementQuery, AdPlacementResponse, AdCardContent, AdListResponse } from "@/types/ad";

// Use backend by default; enable mock only when explicitly set to 'true'
const RAW_USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
const DEBUG_ADS = process.env.NEXT_PUBLIC_DEBUG_ADS === 'true';

function isForceRemote(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const u = new URL(window.location.href);
    return u.searchParams.get('adsRemote') === '1';
  } catch {
    return false;
  }
}

function dlog(...args: any[]) {
  try {
    if (typeof window !== 'undefined' && DEBUG_ADS) {
      // eslint-disable-next-line no-console
      console.debug('[ads]', ...args);
    }
  } catch {}
}

// 将后端返回的不同字段名统一映射为前端使用的 AdCardContent 结构
function toAd(raw: any): AdCardContent {
  if (!raw || typeof raw !== 'object') return raw as AdCardContent;
  const id = raw.id ?? raw.ad_id ?? raw._id ?? raw.uuid ?? String(Math.random());
  const title = raw.title ?? raw.name ?? raw.ad_title;
  const leadMd = raw.leadMd ?? raw.lead ?? raw.description ?? raw.desc ?? raw.summary;
  const bullets = Array.isArray(raw.bullets)
    ? raw.bullets
    : Array.isArray(raw.highlights)
      ? raw.highlights
      : Array.isArray(raw.points)
        ? raw.points
        : undefined;
  const badgeText = raw.badgeText ?? raw.badge ?? raw.tag ?? raw.category_text;
  const badgeVariant = raw.badgeVariant ?? raw.badge_variant ?? raw.badgeType ?? raw.type ?? raw.category;
  const imageUrl = raw.imageUrl ?? raw.image_url ?? raw.thumbnail ?? raw.cover;
  const companyName = raw.companyName ?? raw.company_name ?? raw.company?.name ?? raw.office?.name ?? raw.brand ?? undefined;
  const primaryCtaLabel = raw.primaryCtaLabel ?? raw.primary_label ?? raw.cta_label ?? raw.action_label ?? raw.button_label ?? raw.detail_label ?? raw.ctaText;
  const primaryCtaUrl = raw.primaryCtaUrl ?? raw.primary_url ?? raw.cta_url ?? raw.action_url ?? raw.button_url ?? raw.detail_url ?? raw.link ?? raw.url;
  const secondaryCtaLabel = raw.secondaryCtaLabel ?? raw.secondary_label ?? raw.second_label ?? raw.secondaryCtaText;
  const secondaryCtaUrl = raw.secondaryCtaUrl ?? raw.secondary_url ?? raw.second_url ?? raw.secondaryLink ?? raw.secondaryUrl;
  const officeSlug = raw.officeSlug ?? raw.office_slug ?? raw.office?.slug ?? raw.company?.slug ?? undefined;
  const adSlug = raw.adSlug ?? raw.slug ?? raw.ad_slug ?? undefined;
  return {
    id,
    title,
    leadMd,
    bullets,
    badgeText,
    badgeVariant,
    imageUrl,
    companyName,
    primaryCtaLabel,
    primaryCtaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
    officeSlug,
    adSlug,
  } as AdCardContent;
}

function mockTopAd(locale: string): AdCardContent {
  // 与截图风格接近的默认卡片
  const isJa = locale === 'ja';
  return {
    id: "mock-top-1",
    title: isJa ? "行政書士ネットワーク" : "Gyoseishoshi Network",
    leadMd: isJa ? "配偶・永住・就労ビザの申請代行。日本語/中国語/英語対応。" : "Visa application support (JP/ZH/EN).",
    bullets: isJa ? ["初回相談 30分 無料", "見積り即時発行"] : ["First consultation free", "Instant quote"],
    badgeText: isJa ? "法務" : "Legal",
    badgeVariant: "legal",
    companyName: isJa ? "行政書士ネットワーク" : "Gyoseishoshi Network",
    primaryCtaLabel: isJa ? "AIでマッチング" : "AI Match",
    primaryCtaUrl: "/ja/questionnaire/recommend-office",
    secondaryCtaLabel: isJa ? "事務所一覧" : "Offices",
    secondaryCtaUrl: "/ja/services",
  };
}

function mockCategoryAd(locale: string, categorySlug?: string | null): AdCardContent {
  const isJa = locale === 'ja';
  const cat = categorySlug ?? 'study';
  if (cat === 'study') {
    return {
      id: 'mock-cat-study',
      title: isJa ? "住まい（不動産）" : "Real Estate",
      leadMd: isJa ? "在留カード・保証人なしプランも。英語/中国語スタッフ在籍。" : "Apartments for foreigners. EN/ZH staff.",
      bullets: isJa ? ["短中期OK（マンスリー）", "家賃の目安をAI試算"] : ["Monthly OK", "AI rent estimate"],
      badgeText: isJa ? "生活" : "Life",
      badgeVariant: 'life',
      companyName: isJa ? "さくら不動産" : "Sakura Real Estate",
      primaryCtaLabel: isJa ? "条件入力で提案" : "Get Proposals",
      primaryCtaUrl: "/ja/resources/real-estate",
      secondaryCtaLabel: isJa ? "物件を見る" : "Browse",
      secondaryCtaUrl: "/ja/resources/real-estate/list",
    };
  }
  // default sample for hsp-i etc.
  return {
    id: 'mock-cat-generic',
    title: isJa ? "採用・求人" : "Jobs",
    leadMd: isJa ? "就労ビザに合う職種だけを抽出。日本語レベル別に求人を提示。" : "Job picks matching your work visa.",
    bullets: isJa ? ["ビザ適合フィルター", "リファラル・企業紹介"] : ["Visa fit filter", "Referral"],
    badgeText: isJa ? "キャリア" : "Career",
    badgeVariant: 'career',
    companyName: isJa ? "AIVISA 採用" : "AIVISA Jobs",
    primaryCtaLabel: isJa ? "AI求人を見る" : "AI Jobs",
    primaryCtaUrl: "/ja/resources/jobs",
    secondaryCtaLabel: isJa ? "エージェント一覧" : "Agents",
    secondaryCtaUrl: "/ja/resources/jobs/agents",
  };
}

export async function getAdByPlacement(q: AdPlacementQuery): Promise<AdPlacementResponse> {
  const useMock = RAW_USE_MOCK && !DEBUG_ADS && !isForceRemote();
  dlog('getAdByPlacement:init', { q, useMock, endpoint: EP.ads.byPlacement });
  if (useMock) {
    dlog('getAdByPlacement:mock', q);
    if (q.page === 'top') return mockTopAd(q.locale);
    if (q.page === 'category') return mockCategoryAd(q.locale, q.categorySlug);
  }
  const tryCombos: Array<{ page: string; slot: string }> = [];
  // 1) 原始值
  tryCombos.push({ page: q.page, slot: q.slot });
  // 2) 兼容后端命名：top -> home
  if (q.page === 'top') tryCombos.push({ page: 'home', slot: q.slot });
  // 3) 兼容后端命名：category -> detail（有些后端用 detail 表示详情页）
  if (q.page === 'category') tryCombos.push({ page: 'detail', slot: q.slot });
  // 3) 常见 slot 备选：top_card -> hero / sidebar
  if (q.slot === 'top_card') {
    tryCombos.push({ page: q.page, slot: 'hero' });
    if (q.page === 'top') tryCombos.push({ page: 'home', slot: 'hero' });
    tryCombos.push({ page: q.page, slot: 'sidebar' });
    if (q.page === 'top') tryCombos.push({ page: 'home', slot: 'sidebar' });
  }
  dlog('getAdByPlacement:tryCombos', tryCombos);
  const paramsBase: Record<string, string> = { locale: q.locale };
  if (q.categorySlug) paramsBase.category = q.categorySlug;
  for (const c of tryCombos) {
    const params = { ...paramsBase, page: c.page, slot: c.slot };
    try {
      dlog('getAdByPlacement:request', params);
      const res = await apiGet<any>(EP.ads.byPlacement, params);
      dlog('getAdByPlacement:response', { params, has: !!res });
      // 兼容 DTO 外层包装：{ items: AdCardContent[] }
      if (res && typeof res === 'object') {
        if (Array.isArray((res as any).items)) {
          const first = (res as any).items[0] || null;
          if (first) return toAd(first);
          continue;
        }
        return toAd(res);
      }
      if (res === null) continue;
    } catch {
      // 忽略错误，继续尝试下一个组合
      dlog('getAdByPlacement:error, continue next combo');
    }
  }
  dlog('getAdByPlacement:fallback-null');
  return null;
}

export async function getAdsByPlacement(q: AdPlacementQuery): Promise<AdListResponse> {
  const useMock = RAW_USE_MOCK && !DEBUG_ADS && !isForceRemote();
  dlog('getAdsByPlacement:init', { q, useMock, endpoint: EP.ads.byPlacementList });
  if (useMock) {
    dlog('getAdsByPlacement:mock', q);
    // For top list: prepare two items
    if (q.page === 'top') {
      const first = mockTopAd(q.locale);
      const second = { ...first, id: 'mock-top-2', title: (q.locale === 'ja' ? '行政書士ネットワーク（B）' : 'Gyoseishoshi Network B') };
      const arr = [first, second];
      return (typeof q.limit === 'number') ? arr.slice(0, q.limit) : arr;
    }
    if (q.page === 'category') {
      const a = mockCategoryAd(q.locale, q.categorySlug);
      const b = { ...a, id: (a.id as string) + '-b' };
      const arr = [a, b];
      return (typeof q.limit === 'number') ? arr.slice(0, q.limit) : arr;
    }
    return [];
  }
  const tryCombos: Array<{ page: string; slot: string }> = [];
  tryCombos.push({ page: q.page, slot: q.slot });
  if (q.page === 'top') tryCombos.push({ page: 'home', slot: q.slot });
  if (q.page === 'category') tryCombos.push({ page: 'detail', slot: q.slot });
  if (q.slot === 'top_card') {
    tryCombos.push({ page: q.page, slot: 'hero' });
    if (q.page === 'top') tryCombos.push({ page: 'home', slot: 'hero' });
    tryCombos.push({ page: q.page, slot: 'sidebar' });
    if (q.page === 'top') tryCombos.push({ page: 'home', slot: 'sidebar' });
  }
  dlog('getAdsByPlacement:tryCombos', tryCombos);
  const DEFAULT_LIST_LIMIT = Number(process.env.NEXT_PUBLIC_ADS_DEFAULT_LIST_LIMIT || '20');
  const paramsBase: Record<string, string> = { locale: q.locale };
  if (q.categorySlug) paramsBase.category = q.categorySlug;
  // 若未显式传入 limit，则使用一个较大的默认值，确保后端返回数组（而非单对象）
  if (typeof q.limit === 'number') {
    paramsBase.limit = String(q.limit);
  } else if (Number.isFinite(DEFAULT_LIST_LIMIT) && DEFAULT_LIST_LIMIT > 0) {
    paramsBase.limit = String(DEFAULT_LIST_LIMIT);
  }
  for (const c of tryCombos) {
    const params = { ...paramsBase, page: c.page, slot: c.slot };
    try {
      dlog('getAdsByPlacement:request', params);
      const list = await apiGet<any>(EP.ads.byPlacementList, params);
      // 后端可能永远返回数组，也可能在 limit 的情况下才返回数组，这里做兼容
      if (Array.isArray(list)) {
        dlog('getAdsByPlacement:response-array', { params, length: list.length });
        if (list.length > 0) return (list as any[]).map(toAd) as AdListResponse;
        // 空数组则尝试下一组合
        continue;
      }
      // 兼容 DTO 外层包装：{ items: AdCardContent[] }
      if (list && typeof list === 'object' && Array.isArray((list as any).items)) {
        const items = (list as any).items as any[];
        dlog('getAdsByPlacement:response-dto-items', { params, length: items.length });
        if (items.length > 0) return items.map(toAd) as AdListResponse;
        continue;
      }
      if (list && typeof list === 'object') {
        dlog('getAdsByPlacement:response-single', { params });
        // 单对象也兼容为列表返回
        return [toAd(list) as AdCardContent];
      }
    } catch {
      // 忽略错误，继续尝试下一个组合
      dlog('getAdsByPlacement:error, continue next combo');
    }
  }
  dlog('getAdsByPlacement:fallback-empty');
  return [];
}
