// Requests default to same-origin via computed base below.

export type RateMeta = {
  limit?: number;
  remaining?: number;
  retryAfterSec?: number; // 仅 429 时出现
};

export type ApiResponse<T> = {
  data: T;
  meta: RateMeta;
  status: number;
  contentType?: string | null;
};

function parseRateMeta(res: Response): RateMeta {
  const limit = Number(res.headers.get("x-ratelimit-limit") ?? "");
  const remaining = Number(res.headers.get("x-ratelimit-remaining") ?? "");
  const retryAfter = Number(res.headers.get("retry-after") ?? "");
  return {
    limit: Number.isFinite(limit) ? limit : undefined,
    remaining: Number.isFinite(remaining) ? remaining : undefined,
    retryAfterSec: Number.isFinite(retryAfter) ? retryAfter : undefined,
  };
}

function withTimeoutAndAbort(ms = 30000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(new Error("Request timeout")), ms);
  return {
    signal: ctrl.signal,
    clear: () => clearTimeout(id),
    controller: ctrl,
  } as const;
}

function getClientIdHeader(): Record<string, string> {
  try {
    if (typeof window === "undefined") return {};
    const k = "vp_client_id";
    let cid = window.localStorage.getItem(k);
    if (!cid) {
      cid = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) as string;
      window.localStorage.setItem(k, cid);
    }
    return cid ? { "X-Client-Id": cid } : {};
  } catch {
    return {};
  }
}

export async function apiGet<T>(path: string, params?: Record<string, string>, opts?: { timeoutMs?: number; signal?: AbortSignal }) {
  const base = typeof window === 'undefined'
    ? (process.env.NEXT_BASE_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'http://localhost:3000')
    : (globalThis as any).location?.origin ?? 'http://localhost:3000';
  const url = new URL(path, base);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const timeoutMs = opts?.timeoutMs ?? 30000;
  const helper = withTimeoutAndAbort(timeoutMs);
  const signal = opts?.signal ?? helper.signal;
  try {
  const res = await fetch(url.toString(), { method: "GET", signal, headers: { ...getClientIdHeader() }, credentials: "include" });
    if (!res.ok) throw await buildError(res);
    return res.json() as Promise<T>;
  } finally {
    helper.clear();
  }
}

export async function apiPost<T>(path: string, body?: any, opts?: { timeoutMs?: number; signal?: AbortSignal }) {
  const base = typeof window === 'undefined'
    ? (process.env.NEXT_BASE_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'http://localhost:3000')
    : (globalThis as any).location?.origin ?? 'http://localhost:3000';
  const url = new URL(path, base);
  const timeoutMs = opts?.timeoutMs ?? 30000;
  const helper = withTimeoutAndAbort(timeoutMs);
  const signal = opts?.signal ?? helper.signal;
  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...getClientIdHeader() },
      body: body ? JSON.stringify(body) : undefined,
      signal,
      credentials: "include",
    });
    if (!res.ok) throw await buildError(res);
    return res.json() as Promise<T>;
  } finally {
    helper.clear();
  }
}

export async function apiGetWithMeta<T>(path: string, params?: Record<string, string>, opts?: { timeoutMs?: number; signal?: AbortSignal }): Promise<ApiResponse<T>> {
  const base = typeof window === 'undefined'
    ? (process.env.NEXT_BASE_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'http://localhost:3000')
    : (globalThis as any).location?.origin ?? 'http://localhost:3000';
  const url = new URL(path, base);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const timeoutMs = opts?.timeoutMs ?? 30000;
  const helper = withTimeoutAndAbort(timeoutMs);
  const signal = opts?.signal ?? helper.signal;
  try {
  const res = await fetch(url.toString(), { method: "GET", signal, headers: { ...getClientIdHeader() }, credentials: "include" });
    const meta = parseRateMeta(res);
    const contentType = res.headers.get("content-type");
    let data: any;
    if (contentType && contentType.includes("application/json")) data = await res.json();
    else data = (await res.text()) as any;
    if (!res.ok) throw buildPlainError(res.status, data, meta);
    return { data, meta, status: res.status, contentType } as ApiResponse<T>;
  } finally {
    helper.clear();
  }
}

export async function apiPostWithMeta<T>(path: string, body?: any, opts?: { timeoutMs?: number; signal?: AbortSignal }): Promise<ApiResponse<T>> {
  const base = typeof window === 'undefined'
    ? (process.env.NEXT_BASE_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'http://localhost:3000')
    : (globalThis as any).location?.origin ?? 'http://localhost:3000';
  const url = new URL(path, base);
  const timeoutMs = opts?.timeoutMs ?? 30000;
  const helper = withTimeoutAndAbort(timeoutMs);
  const signal = opts?.signal ?? helper.signal;
  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...getClientIdHeader() },
      body: body ? JSON.stringify(body) : undefined,
      signal,
      credentials: "include",
    });
    const meta = parseRateMeta(res);
    const contentType = res.headers.get("content-type");
    let data: any;
    if (contentType && contentType.includes("application/json")) data = await res.json();
    else data = (await res.text()) as any;
    if (!res.ok) throw buildPlainError(res.status, data, meta);
    return { data, meta, status: res.status, contentType } as ApiResponse<T>;
  } finally {
    helper.clear();
  }
}

async function buildError(res: Response) {
  const meta = parseRateMeta(res);
  const contentType = res.headers.get("content-type");
  let payload: any = undefined;
  try {
    if (contentType && contentType.includes("application/json")) payload = await res.json();
    else payload = await res.text();
  } catch {
    // ignore
  }
  const err: any = new Error(`HTTP ${res.status}`);
  err.status = res.status;
  err.payload = payload;
  err.meta = meta;
  return err;
}

function buildPlainError(status: number, payload: any, meta: RateMeta) {
  const err: any = new Error(`HTTP ${status}`);
  err.status = status;
  err.payload = payload;
  err.meta = meta;
  return err;
}

// 使用提供的 schema 验证响应数据（schema 需有 .parse 方法，如 zod）
export function createHttpWithSchema<S>(schema: { parse: (data: unknown) => S }) {
  return async function <T = S>(path: string, init?: RequestInit & { next?: any }): Promise<T> {
    const base = typeof window === 'undefined'
      ? (process.env.NEXT_BASE_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'http://localhost:3000')
      : (globalThis as any).location?.origin ?? 'http://localhost:3000';
    const url = new URL(path, base);
    const res = await fetch(url.toString(), {
      method: (init?.method as any) ?? "GET",
      ...init,
      headers: { Accept: "application/json", ...(init?.headers || {}), ...getClientIdHeader() },
      credentials: "include",
    });
    if (!res.ok) throw await buildError(res);
    const contentType = res.headers.get("content-type");
    let data: any;
    if (contentType && contentType.includes("application/json")) data = await res.json();
    else data = await res.text();
    const parsed = schema.parse(data);
    return parsed as unknown as T;
  };
}

// A lightweight helper mirroring the shape used by services: accepts a RequestInit,
// auto-JSON stringifies plain object bodies, adds common headers, and returns parsed JSON/text.
type HttpInit = Omit<RequestInit, 'body'> & { body?: any; next?: any };

export async function http<T = unknown>(path: string, init?: HttpInit): Promise<T> {
  const base = typeof window === 'undefined'
    ? (process.env.NEXT_BASE_URL || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'http://localhost:3000')
    : (globalThis as any).location?.origin ?? 'http://localhost:3000';
  const url = new URL(path, base);
  const hasJsonBody = typeof init?.body === "object" && init?.body !== null && !(init?.body instanceof FormData) && !(init?.body instanceof Blob);
  const res = await fetch(url.toString(), {
    method: (init?.method as any) ?? "GET",
    ...init,
    headers: {
      Accept: "application/json",
      ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
      ...getClientIdHeader(),
    },
    body: hasJsonBody ? JSON.stringify(init?.body) : (init?.body as any),
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res);
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}
