export type AdCardContent = {
  id: number | string;
  title?: string;
  leadMd?: string;
  bullets?: string[];
  badgeText?: string;
  badgeVariant?: string; // '法律' | '生活' | 'キャリア' ... 等，前端样式映射
  imageUrl?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  // 用于跳转“公司+广告”内部页
  officeSlug?: string;
  adSlug?: string;
};

export type AdPlacementQuery = {
  page: 'top' | 'category';
  slot: 'top_card' | 'detail_bottom';
  categorySlug?: string | null;
  locale: string;
  limit?: number;
};

export type AdPlacementResponse = AdCardContent | null;
export type AdListResponse = AdCardContent[];

// 公司 + 广告上下文（用于 /companies/{officeSlug}/ads/{adSlug} 页面）
import type { OfficeDetail } from "@/types/company";
export type CompanyAdContext = {
  company: OfficeDetail;
  ad: AdCardContent;
  placement?: { page?: string; slot?: string; category?: string | null } | null;
};
