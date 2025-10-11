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
    // Will throw if env missing
    redis = Redis.fromEnv();
  } catch {
    redis = null;
    // eslint-disable-next-line no-console
    console.warn('[rateLimit] Upstash Redis env not found. Rate limiting is disabled.');
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
      // headers() returns ReadonlyHeaders in Next 15
      const hdrs = headers();
      // handle both sync and promise typings defensively
      const h: any = (typeof (hdrs as any)?.get === 'function') ? hdrs : undefined;
      if (h) {
        const xff = h.get('x-forwarded-for');
        const ip = (xff?.split(',')[0] || h.get('x-real-ip') || h.get('cf-connecting-ip') || '').trim();
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
  const { success, limit, remaining, reset } = await instance.limit(id);

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
