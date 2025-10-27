export const EP = {
  ads: {
    // 约定：
    // 首页：GET /ads?page=top&slot=top_card&locale=ja&limit=2
    // 详情：GET /ads?page=detail&slot=detail_bottom&locale=ja&category=:slug&limit=20
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
