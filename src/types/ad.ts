export type AdCardContent = {
  id: number | string;
  title?: string;
  leadMd?: string;
  bullets?: string[];
  badgeText?: string;
  badgeVariant?: string; // '法律' | '生活' | 'キャリア' ... 等，前端样式映射
  imageUrl?: string;
  // 新增：公司名称（与请求 locale 一致，带后端回退）
  companyName?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  // 用于跳转“公司+广告”内部页
  officeSlug?: string;
  adSlug?: string;
};

export type AdPlacementQuery = {
  page: 'top' | 'detail';
  slot: 'top_card' | 'detail_bottom';
  categorySlug?: string | null;
  locale: string;
  limit?: number;
};

export type AdPlacementResponse = AdCardContent | null;
export type AdListResponse = AdCardContent[];
