// next.config.ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isProd = process.env.NODE_ENV === "production";
const useReportOnly = process.env.CSP_REPORT_ONLY === "1"; // 置 1 则用 Report-Only 观察

// Helpers
function originOf(v?: string) {
  try {
    if (!v) return null;
    const u = new URL(v);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

// Env origins
const BACKEND_ORIGIN = originOf(process.env.BACKEND_URL);
const ANALYTICS_ORIGIN = originOf(process.env.ANALYTICS_PROXY_BASE) || BACKEND_ORIGIN;
const PUBLIC_ORIGIN = originOf(process.env.NEXT_PUBLIC_API_BASE);
const CSP_REPORT_URI = process.env.CSP_REPORT_URI || ""; // 可选：/csp-report

// --- GTM/GA domains ---
const GTM_GA_SOURCES = [
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
];
const GA_REGIONAL = [
  "https://region1.google-analytics.com", // GA4 常见上报域
];

// connect-src
const connectSrc = [
  "'self'",
  ...(isProd ? ["https:"] : ["http:", "https:", "ws:", "wss:"]),
  ...(BACKEND_ORIGIN ? [BACKEND_ORIGIN] : []),
  ...(ANALYTICS_ORIGIN ? [ANALYTICS_ORIGIN] : []),
  ...(PUBLIC_ORIGIN ? [PUBLIC_ORIGIN] : []),
  ...GTM_GA_SOURCES,
  ...GA_REGIONAL,
].join(" ");

// script-src（含 dev 下 'unsafe-eval'）
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isProd ? [] : ["'unsafe-eval'"]),
  ...GTM_GA_SOURCES,
].join(" ");

// 明确设置 script-src-elem（有些浏览器区分 elem/attr）
const scriptSrcElem = scriptSrc;

// 构建 CSP（最小放行 + 兼容 GTM/GA）
const baseCspParts = [
  "default-src 'self'",
  // 图片像素 & GTM/GA 相关图像
  "img-src 'self' data: https: https://www.google-analytics.com https://www.googletagmanager.com",
  `script-src ${scriptSrc}`,
  `script-src-elem ${scriptSrcElem}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `connect-src ${connectSrc}`,
  // GTM noscript 分支的 <iframe>
  "frame-src https://www.googletagmanager.com",
  // 兼容性：部分代理/旧 UA 仍看 child-src
  "child-src https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
  ...(CSP_REPORT_URI ? [`report-uri ${CSP_REPORT_URI}`] : []),
];
const csp = baseCspParts.join("; ");

const CSP_KEY = useReportOnly
  ? "Content-Security-Policy-Report-Only"
  : "Content-Security-Policy";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.example.com" },
      // 按需添加你自己 CDN/图床域名
    ],
  },

  // Next 15+ dev 安全策略：允许从这些源访问开发服务器
  allowedDevOrigins:
    process.env.NODE_ENV !== "production"
      ? [
          "localhost",
          "127.0.0.1",
          ...(process.env.DEV_ALLOWED_ORIGINS
            ? process.env.DEV_ALLOWED_ORIGINS.split(",")
            : []),
          "192.168.1.2",
          "192.168.1.4",
          "192.168.1.5",
          "192.168.1.8",
          "192.168.1.9",
        ]
      : undefined,

  async redirects() {
    return [
      { source: "/:locale/visa", destination: "/:locale/visa/pr", permanent: true },
      { source: "/:locale/visa/category/:path*",
        destination: "/:locale/visa/pr", permanent: true },

      { source: "/:locale/visa/permanent-resident", destination: "/:locale/visa/pr", permanent: true },
      { source: "/:locale/visa/student", destination: "/:locale/visa/study", permanent: true },
      { source: "/:locale/visa/engineer-humanities-international", destination: "/:locale/visa/engineer", permanent: true },
      { source: "/:locale/visa/highly-skilled-professional", destination: "/:locale/visa/hsp-i", permanent: true },
      { source: "/:locale/visa/dependent", destination: "/:locale/visa/dep", permanent: true },
      { source: "/:locale/visa/designated-activities", destination: "/:locale/visa/da", permanent: true },
      { source: "/:locale/visa/spouse-of-permanent-resident", destination: "/:locale/visa/pr-spouse", permanent: true },
      { source: "/:locale/visa/spouse-of-japanese-national", destination: "/:locale/visa/jp-spouse", permanent: true },
      { source: "/:locale/visa/long-term-resident", destination: "/:locale/visa/ltr", permanent: true },
      { source: "/:locale/visa/business-manager", destination: "/:locale/visa/bm", permanent: true },
      { source: "/:locale/visa/care-worker", destination: "/:locale/visa/care", permanent: true },
      { source: "/:locale/visa/skilled-labor", destination: "/:locale/visa/skilled", permanent: true },
      { source: "/:locale/visa/technical-intern-training", destination: "/:locale/visa/tit", permanent: true },
      { source: "/:locale/visa/temporary-visitor", destination: "/:locale/visa/temp", permanent: true },
      { source: "/:locale/visa/specified-skilled-worker", destination: "/:locale/visa/ssw", permanent: true },
    ];
  },

  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    const destBase =
      (process.env.BACKEND_URL?.replace(/\/$/, "")) || "http://localhost:8080";
    return {
      afterFiles: [
        { source: "/api/:path*", destination: `${destBase}/api/:path*` },
      ],
    } as any;
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
                { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
                { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
              ]
            : []),
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: CSP_KEY, value: csp },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
