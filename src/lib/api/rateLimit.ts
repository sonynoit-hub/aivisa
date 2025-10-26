import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Upstash clients only when env is present
let redis: Redis | null = null;
let initialized = false;

function getRedis(): Redis | null {
  if (initialized) return redis;
  initialized = true;
  try {
    // 先校验 URL 与 Token 是否合理，避免出现 fetch '/pipeline' 的相对地址报错
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !/^https?:\/\//i.test(url) || !token) {
      redis = null;
      console.warn('[rateLimit] Upstash env invalid or missing. Rate limiting disabled.');
      return redis;
    }
    // Will throw if env missing/invalid in library
    redis = Redis.fromEnv();
  } catch {
    redis = null;
    console.warn('[rateLimit] Upstash Redis init failed. Rate limiting disabled.');
  }
  return redis;
}

const shared = {
  api: () => {
    const r = getRedis();
    return r
      ? new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(10, '10 s'), analytics: true, prefix: 'rl:api' })
      : null;
  },
  chatStream: () => {
    const r = getRedis();
    return r
      ? new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(5, '1 m'), analytics: true, prefix: 'rl:chat' })
      : null;
  },
  form: () => {
    const r = getRedis();
    return r
      ? new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(3, '1 h'), analytics: true, prefix: 'rl:form' })
      : null;
  },
};

export type LimiterKey = 'api' | 'chatStream' | 'form';

export function getClientId(req?: NextRequest): string {
  try {
    if (req) {
      const xff = req.headers.get('x-forwarded-for');
      const ip = (xff?.split(',')[0] || req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '').trim();
      if (ip) return ip;
    } else {
      // headers() returns ReadonlyHeaders in Next 15; in some runtimes it may be a promise-like
      type Gettable = { get(name: string): string | null };
      const hdrsU = headers() as unknown;
      if (hdrsU && typeof hdrsU === 'object' && 'get' in hdrsU && typeof (hdrsU as Gettable).get === 'function') {
        const hdrs = hdrsU as Gettable;
        const xff = hdrs.get('x-forwarded-for');
        const ip = (xff?.split(',')[0] || hdrs.get('x-real-ip') || hdrs.get('cf-connecting-ip') || '').trim();
        if (ip) return ip;
      }
    }
  } catch {}
  return 'unknown';
}

export async function withRateLimit(
  limiter: LimiterKey,
  req?: NextRequest,
  keySuffix?: string
): Promise<{ success: boolean; response?: Response }> {
  const factory = shared[limiter];
  const instance = factory();
  if (!instance) return { success: true };

  const idBase = getClientId(req);
  const id = keySuffix ? `${idBase}:${keySuffix}` : idBase;
  let success = true;
  let limit = 0;
  let remaining = 0;
  let reset = Date.now();
  try {
    const r = await instance.limit(id);
    success = r.success; limit = r.limit; remaining = r.remaining; reset = r.reset;
  } catch (e: unknown) {
    const msg = String((e as { message?: unknown })?.message || e);
    // 当 Upstash 客户端被错误配置（如基址为空导致请求 /pipeline）时，视为限流不可用 -> 放行并记录 warning
    if (/invalid url|failed to parse url|only absolute urls/i.test(msg)) {
      console.warn('[rateLimit] Upstash limit skipped due to invalid URL/env. Proceeding without rate limit.');
      return { success: true };
    }
    // 其他错误也不阻断主流程，但记录一条 warning
    console.warn('[rateLimit] Upstash limit error:', msg);
    return { success: true };
  }

  if (!success) {
    const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(reset),
      'Retry-After': String(retryAfter),
    });
    return {
      success: false,
      response: new Response(
        JSON.stringify({ error: 'Too Many Requests', message: '请求过于频繁，请稍后再试', retryAfter }),
        { status: 429, headers }
      ),
    };
  }
  return { success: true };
}
