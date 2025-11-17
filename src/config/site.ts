// 站点公开基础 URL（用于 canonical / hreflang / sitemap / OG）
// 优先级：NEXT_PUBLIC_SITE_URL > VERCEL_URL 推断 >（回退）请求头 x-forwarded-proto/host > localhost
// 生产环境若仍是 localhost 给出明显警告，避免把本地地址推到搜索引擎。
import { headers } from 'next/headers';
const rawBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
  || 'http://localhost:3000';

// 统一去掉末尾斜杠，避免拼接时出现双斜杠
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '');

if (process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1/.test(normalizedBaseUrl)) {
  // eslint-disable-next-line no-console
  console.warn('[site] ⚠️ Production build detected a localhost baseUrl. Set NEXT_PUBLIC_SITE_URL=https://your-domain.example to fix canonical/hreflang/og:url/sitemap.');
}

export const site = {
  name: 'aivisa',
  description: 'A multilingual visa information platform',
  baseUrl: normalizedBaseUrl,
};

// 获取公开 Base URL：
// - 首选配置的 site.baseUrl；
// - 若检测为 localhost，则尝试基于请求头（x-forwarded-proto/host 或 host）动态推断；
// - 最后仍回退为 site.baseUrl。
export async function getPublicBaseUrl(): Promise<string> {
  const base = site.baseUrl;
  if (!/localhost|127\.0\.0\.1/.test(base)) return base;
  try {
    const h = await headers();
    const proto = (h.get('x-forwarded-proto') || h.get('x-forwarded-protocol') || 'https').split(',')[0].trim();
    const host = (h.get('x-forwarded-host') || h.get('host') || '').split(',')[0].trim();
    if (host) {
      return `${proto}://${host}`.replace(/\/$/, '');
    }
  } catch {
    // 在构建或无请求上下文时，headers() 不可用，静默回退
  }
  return base;
}
