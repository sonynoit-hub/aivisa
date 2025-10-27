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

function dlog(...args: unknown[]) {
  try {
    if (typeof window !== 'undefined' && DEBUG_ADS) {
      console.debug('[ads]', ...args);
    }
  } catch {}
}

// 将后端返回的不同字段名统一映射为前端使用的 AdCardContent 结构
function toAd(raw: unknown): AdCardContent {
  if (!raw || typeof raw !== 'object') return raw as AdCardContent;
  const r = raw as Record<string, unknown>;
  const id = (r.id ?? r.ad_id ?? r._id ?? r.uuid ?? String(Math.random())) as string;
  const title = (r.title ?? r.name ?? r.ad_title) as string | undefined;
  const leadMd = (r.leadMd ?? r.lead ?? r.description ?? r.desc ?? r.summary) as string | undefined;
  const bullets = Array.isArray(r.bullets)
    ? (r.bullets as string[])
    : Array.isArray(r.highlights)
      ? (r.highlights as string[])
      : Array.isArray(r.points)
        ? (r.points as string[])
        : undefined;
  const badgeText = (r.badgeText ?? r.badge ?? r.tag ?? r.category_text) as string | undefined;
  const badgeVariant = (r.badgeVariant ?? r.badge_variant ?? r.badgeType ?? r.type ?? r.category) as string | undefined;
  const imageUrl = (r.imageUrl ?? r.image_url ?? r.thumbnail ?? r.cover) as string | undefined;
  const companyName = (r.companyName ?? r.company_name ?? (r.company as Record<string, unknown> | undefined)?.name ?? (r.office as Record<string, unknown> | undefined)?.name ?? r.brand) as string | undefined;
  const primaryCtaLabel = (r.primaryCtaLabel ?? r.primary_label ?? r.cta_label ?? r.action_label ?? r.button_label ?? r.detail_label ?? r.ctaText) as string | undefined;
  const primaryCtaUrl = (r.primaryCtaUrl ?? r.primary_url ?? r.cta_url ?? r.action_url ?? r.button_url ?? r.detail_url ?? r.link ?? r.url) as string | undefined;
  const secondaryCtaLabel = (r.secondaryCtaLabel ?? r.secondary_label ?? r.second_label ?? r.secondaryCtaText) as string | undefined;
  const secondaryCtaUrl = (r.secondaryCtaUrl ?? r.secondary_url ?? r.second_url ?? r.secondaryLink ?? r.secondaryUrl) as string | undefined;
  const officeSlug = (r.officeSlug ?? r.office_slug ?? (r.office as Record<string, unknown> | undefined)?.slug ?? (r.company as Record<string, unknown> | undefined)?.slug) as string | undefined;
  const adSlug = (r.adSlug ?? r.slug ?? r.ad_slug) as string | undefined;
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
    if (q.page === 'detail') return mockCategoryAd(q.locale, q.categorySlug);
  }
  const params: Record<string, string> = { page: q.page, slot: q.slot, locale: q.locale };
  if (q.categorySlug) params.category = q.categorySlug;
  try {
    dlog('getAdByPlacement:request', params);
    const res = await apiGet<unknown>(EP.ads.byPlacement, params);
    dlog('getAdByPlacement:response', { has: !!res });
    // 兼容 DTO 外层包装：{ items: AdCardContent[] }
    if (res && typeof res === 'object') {
      const resObj = res as Record<string, unknown>;
      if (Array.isArray(resObj.items)) {
        const first = (resObj.items[0] as unknown) || null;
        return first ? toAd(first) : null;
      }
      return toAd(res);
    }
    return res === null ? null : toAd(res as unknown);
  } catch {
    dlog('getAdByPlacement:error');
    return null;
  }
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
    if (q.page === 'detail') {
      const a = mockCategoryAd(q.locale, q.categorySlug);
      const b = { ...a, id: (a.id as string) + '-b' };
      const arr = [a, b];
      return (typeof q.limit === 'number') ? arr.slice(0, q.limit) : arr;
    }
    return [];
  }
  const DEFAULT_LIST_LIMIT = Number(process.env.NEXT_PUBLIC_ADS_DEFAULT_LIST_LIMIT || '20');
  const params: Record<string, string> = { page: q.page, slot: q.slot, locale: q.locale };
  if (q.categorySlug) params.category = q.categorySlug;
  if (typeof q.limit === 'number') {
    params.limit = String(q.limit);
  } else if (Number.isFinite(DEFAULT_LIST_LIMIT) && DEFAULT_LIST_LIMIT > 0) {
    params.limit = String(DEFAULT_LIST_LIMIT);
  }
  try {
    dlog('getAdsByPlacement:request', params);
    const list = await apiGet<unknown>(EP.ads.byPlacementList, params);
    // 后端可能永远返回数组，也可能在 limit 的情况下才返回数组，这里做兼容
    if (Array.isArray(list)) {
      dlog('getAdsByPlacement:response-array', { length: list.length });
      return (list as unknown[]).map(toAd) as AdListResponse;
    }
    if (list && typeof list === 'object' && Array.isArray((list as Record<string, unknown>).items as unknown[])) {
      const items = (list as Record<string, unknown>).items as unknown[];
      dlog('getAdsByPlacement:response-dto-items', { length: items.length });
      return items.map(toAd) as AdListResponse;
    }
    if (list && typeof list === 'object') {
      dlog('getAdsByPlacement:response-single');
      return [toAd(list) as AdCardContent];
    }
    return [];
  } catch {
    dlog('getAdsByPlacement:error');
    return [];
  }
}
