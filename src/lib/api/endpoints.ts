export const EP = {
  ads: {
    // 建议的后端路由（可选）：GET /ads?page=top&slot=top_card&locale=ja&category=&limit=2
    // 目前前端先走 mock，后端准备好后可直接切换
    byPlacement: "/api/ads",
    byPlacementList: "/api/ads",
  },
  visa: {
    list: "/visa",
    detail: (slug: string) => `/visa/${slug}`,
    documents: (slug: string) => `/visa/${slug}/documents`
  },
  questionnaire: {
    submit: "/questionnaire",
    review: "/questionnaire/review",
    recommend: "/questionnaire/recommend",
    recommendOffice: "/questionnaire/recommend/office",
    contact: "/questionnaire/contact"
  },
  // 统一 AI 路由以 chat 命名空间，不再区分 ask-ai
  company: {
    offices: "/companies",
    officeDetail: (slug: string) => `/api/companies/${slug}`,
    officeAdContext: (officeSlug: string, adSlug: string) => `/api/companies/${officeSlug}/ads/${adSlug}`,
    officeAdPage: (locale: string, officeSlug: string, adSlug: string) => `/${locale}/companies/${officeSlug}/ads/${adSlug}`,
  },
  analytics: {
    base: "/api/analytics",
    anonEnsure: "/api/analytics/anon/ensure",
    devices: "/api/analytics/devices",
    webSessions: "/api/analytics/web-sessions",
    sessions: "/api/analytics/sessions",
    events: "/api/analytics/events"
  }
} as const;
