import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isProd = process.env.NODE_ENV === 'production';

// Helpers to extract origins from env URLs (at build time)
function originOf(v?: string) {
  try {
    if (!v) return null;
    const u = new URL(v);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

const BACKEND_ORIGIN = originOf(process.env.BACKEND_URL);
const ANALYTICS_ORIGIN = originOf(process.env.ANALYTICS_PROXY_BASE) || BACKEND_ORIGIN;
const PUBLIC_ORIGIN = originOf(process.env.NEXT_PUBLIC_API_BASE);
const CSP_REPORT_URI = process.env.CSP_REPORT_URI; // optional endpoint

// Build a CSP that is relaxed in development to avoid HTTPS upgrade issues
const connectSrc = [
  "'self'",
  ...(isProd ? ["https:"] : ["http:", "https:", "ws:", "wss:"]),
  ...(BACKEND_ORIGIN ? [BACKEND_ORIGIN] : []),
  ...(ANALYTICS_ORIGIN ? [ANALYTICS_ORIGIN] : []),
  ...(PUBLIC_ORIGIN ? [PUBLIC_ORIGIN] : []),
].join(' ');

const baseCspParts = [
  "default-src 'self'",
  "img-src 'self' data: https:",
  // 在开发环境允许 'unsafe-eval'，生产尽量移除以降低 XSS 风险
  `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `connect-src ${connectSrc}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // 仅生产启用自动升级为 https，避免本地 http 资源被浏览器强制 https 导致失败
  ...(isProd ? ["upgrade-insecure-requests"] : []),
  ...(CSP_REPORT_URI ? [`report-uri ${CSP_REPORT_URI}`] : []),
];

const csp = baseCspParts.join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Produce standalone output for smaller Docker runtime image
  output: 'standalone',
  // 允许开发环境中从这些源发起到本应用的请求（Next 15+ 开发安全策略）
  // 按需补充你的后端开发域名
  allowedDevOrigins: process.env.NODE_ENV !== 'production'
    ? [
        // Localhost aliases
        'localhost',
        '127.0.0.1',
        // Optional: allow extra dev origins from env (comma-separated hostnames)
        ...(process.env.DEV_ALLOWED_ORIGINS ? process.env.DEV_ALLOWED_ORIGINS.split(',') : []),
        // LAN IPs
        '192.168.1.2',
        '192.168.1.4',
        '192.168.1.9',
        '192.168.1.8',
      ]
    : undefined,
  async redirects() {
    return [
      // Index and category to default PR page
      { source: '/:locale/visa', destination: '/:locale/visa/pr', permanent: true },
      { source: '/:locale/visa/category/:path*', destination: '/:locale/visa/pr', permanent: true },

      // Catalog slug -> short path
      { source: '/:locale/visa/permanent-resident', destination: '/:locale/visa/pr', permanent: true },
      { source: '/:locale/visa/student', destination: '/:locale/visa/study', permanent: true },
      { source: '/:locale/visa/engineer-humanities-international', destination: '/:locale/visa/engineer', permanent: true },
      { source: '/:locale/visa/highly-skilled-professional', destination: '/:locale/visa/hsp-i', permanent: true },
      { source: '/:locale/visa/dependent', destination: '/:locale/visa/dep', permanent: true },
      { source: '/:locale/visa/designated-activities', destination: '/:locale/visa/da', permanent: true },
      { source: '/:locale/visa/spouse-of-permanent-resident', destination: '/:locale/visa/pr-spouse', permanent: true },
      { source: '/:locale/visa/spouse-of-japanese-national', destination: '/:locale/visa/jp-spouse', permanent: true },
      { source: '/:locale/visa/long-term-resident', destination: '/:locale/visa/ltr', permanent: true },
      { source: '/:locale/visa/business-manager', destination: '/:locale/visa/bm', permanent: true },
      { source: '/:locale/visa/care-worker', destination: '/:locale/visa/care', permanent: true },
      { source: '/:locale/visa/skilled-labor', destination: '/:locale/visa/skilled', permanent: true },
      { source: '/:locale/visa/technical-intern-training', destination: '/:locale/visa/tit', permanent: true },
      { source: '/:locale/visa/temporary-visitor', destination: '/:locale/visa/temp', permanent: true },
      { source: '/:locale/visa/specified-skilled-worker', destination: '/:locale/visa/ssw', permanent: true },
    ];
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    // 开发环境：将 /api/* 代理到本地后端，保持浏览器同域视角
    const destBase = (process.env.BACKEND_URL?.replace(/\/$/, "")) || 'http://localhost:8080';
    return {
      afterFiles: [
        {
          source: '/api/:path*',
          destination: `${destBase}/api/:path*`,
        },
      ],
    } as any;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // 仅生产开启 HSTS，避免开发环境强制跳转 https 造成 ERR_SSL_PROTOCOL_ERROR
          ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
          { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=()' },
          // COOP/ CORP 在非可信源会被忽略；保留无害，但可按需仅生产开启
          ...(isProd ? [{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' }] : []),
          ...(isProd ? [{ key: 'Cross-Origin-Resource-Policy', value: 'same-origin' }] : []),
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
