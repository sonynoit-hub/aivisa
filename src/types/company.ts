export type OfficeDetail = {
  id: string;
  slug: string;
  code?: string;
  // 新增：后端基础状态
  isActive?: boolean;
  name: string;
  shortDesc?: string;
  descriptionMd?: string;
  websiteUrl?: string;
  email?: string; // 规范化自 emailPublic
  phone?: string; // 规范化自 phonePublic
  // SEO / OG / 发布时间等
  seoTitle?: string;
  seoDesc?: string;
  ogImageUrl?: string;
  publishedAt?: string;
  // 位置信息
  geoLat?: number;
  geoLng?: number;
  // 来自 partner_office_i18n.cards_json 等：展示用的卡片列表
  cards?: OfficeCard[];
  // 标签/能力
  tags?: string[];
  address?:
    | string
    | {
        pref?: string;
        city?: string;
        zip?: string;
        line1?: string;
        line2?: string;
        country?: string;
      };
  languages?: string[]; // e.g., ['ja','en','zh']
  services?: string[];  // e.g., ['spouse','pr','study']
  badgeText?: string;   // e.g., '広告(PR)'
  badgeVariant?: string; // e.g., 'pr' | 'legal' | 'life' | 'career'
  sns?: Record<string, string>; // e.g., { x: 'https://x.com/..', line: '...', facebook: '...' }
  // 其他 JSON 字段解析结果
  media?: unknown;
  listings?: unknown;
};

// 展示卡片的通用类型（字段名做了最小假设与兼容）
export type OfficeCard = {
  // 当 cards 以对象映射提供时，保留原始 key（仅用于标识/调试，不用于展示）
  key?: string;
  // 可选排序权重，值越小越靠前
  order?: number;
  title?: string;
  name?: string;
  heading?: string;
  label?: string;
  pill?: string;
  desc?: string;
  lead?: string;
  description?: string;
  text?: string;
  content?: string;
  subtitle?: string;
  emoji?: string;
  icon?: string;
  imageUrl?: string;
  bullets?: string[];
  detail?: string[];
  url?: string;
  href?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  cta_primary?: string;
  cta_primary_url?: string;
  cta_secondary?: string;
  cta_secondary_url?: string;
  [k: string]: unknown;
};
