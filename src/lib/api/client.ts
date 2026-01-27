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

export type ApiError = Error & {
  status?: number;
  payload?: unknown;
  meta?: RateMeta;
};

function getRuntimeOrigin(): string | undefined {
  try {
    const g = globalThis as unknown as { location?: { origin?: unknown } };
    const origin = g.location?.origin;
    return typeof origin === "string" ? origin : undefined;
  } catch {
    return undefined;
  }
}

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

export function getClientIdHeader(): Record<string, string> {
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
  const isServer = typeof window === 'undefined';
  const isAbsolute = /^https?:\/\//i.test(path);
  let urlStr: string;
  if (isServer && !isAbsolute && path.startsWith('/')) {
    // 在服务端对相对路径保持相对请求，避免依赖绝对基座（端口/域名配置差异）
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    urlStr = `${path}${qs}`;
  } else {
    const base = isServer
      ? (
          process.env.NEXT_BASE_URL
          || process.env.NEXT_PUBLIC_API_BASE
          || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
          || 'http://localhost:3000'
        )
      : (getRuntimeOrigin() ?? 'http://localhost:3000');
    const url = new URL(path, base);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    urlStr = url.toString();
  }
  const timeoutMs = opts?.timeoutMs ?? 30000;
  const helper = withTimeoutAndAbort(timeoutMs);
  const signal = opts?.signal ?? helper.signal;
  try {
  const res = await fetch(urlStr, { method: "GET", signal, headers: { ...getClientIdHeader() }, credentials: "include" });
    if (!res.ok) throw await buildError(res);
    return res.json() as Promise<T>;
  } finally {
    helper.clear();
  }
}

export async function apiPost<T>(path: string, body?: unknown, opts?: { timeoutMs?: number; signal?: AbortSignal }) {
  const isServer = typeof window === 'undefined';
  const isAbsolute = /^https?:\/\//i.test(path);
  let urlStr: string;
  if (isServer && !isAbsolute && path.startsWith('/')) {
    urlStr = path; // POST 无需追加查询字符串（调用方自行附带）
  } else {
    const base = isServer
      ? (
          process.env.NEXT_BASE_URL
          || process.env.NEXT_PUBLIC_API_BASE
          || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
          || 'http://localhost:3000'
        )
      : (getRuntimeOrigin() ?? 'http://localhost:3000');
    const url = new URL(path, base);
    urlStr = url.toString();
  }
  const timeoutMs = opts?.timeoutMs ?? 30000;
  const helper = withTimeoutAndAbort(timeoutMs);
  const signal = opts?.signal ?? helper.signal;
  try {
    const res = await fetch(urlStr, {
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
  const isServer = typeof window === 'undefined';
  const isAbsolute = /^https?:\/\//i.test(path);
  let urlStr: string;
  if (isServer && !isAbsolute && path.startsWith('/')) {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    urlStr = `${path}${qs}`;
  } else {
    const base = isServer
      ? (
          process.env.NEXT_BASE_URL
          || process.env.NEXT_PUBLIC_API_BASE
          || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
          || 'http://localhost:3000'
        )
      : (getRuntimeOrigin() ?? 'http://localhost:3000');
    const url = new URL(path, base);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    urlStr = url.toString();
  }
  const timeoutMs = opts?.timeoutMs ?? 30000;
  const helper = withTimeoutAndAbort(timeoutMs);
  const signal = opts?.signal ?? helper.signal;
  try {
  const res = await fetch(urlStr, { method: "GET", signal, headers: { ...getClientIdHeader() }, credentials: "include" });
    const meta = parseRateMeta(res);
    const contentType = res.headers.get("content-type");
    let data: unknown;
    if (contentType && contentType.includes("application/json")) data = await res.json();
    else data = await res.text();
    if (!res.ok) throw buildPlainError(res.status, data, meta);
    return { data: data as T, meta, status: res.status, contentType };
  } finally {
    helper.clear();
  }
}

export async function apiPostWithMeta<T>(path: string, body?: unknown, opts?: { timeoutMs?: number; signal?: AbortSignal }): Promise<ApiResponse<T>> {
  const isServer = typeof window === 'undefined';
  const isAbsolute = /^https?:\/\//i.test(path);
  let urlStr: string;
  if (isServer && !isAbsolute && path.startsWith('/')) {
    urlStr = path;
  } else {
    const base = isServer
      ? (
          process.env.NEXT_BASE_URL
          || process.env.NEXT_PUBLIC_API_BASE
          || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
          || 'http://localhost:3000'
        )
      : (getRuntimeOrigin() ?? 'http://localhost:3000');
    const url = new URL(path, base);
    urlStr = url.toString();
  }
  const timeoutMs = opts?.timeoutMs ?? 30000;
  const helper = withTimeoutAndAbort(timeoutMs);
  const signal = opts?.signal ?? helper.signal;
  try {
    const res = await fetch(urlStr, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...getClientIdHeader() },
      body: body ? JSON.stringify(body) : undefined,
      signal,
      credentials: "include",
    });
    const meta = parseRateMeta(res);
    const contentType = res.headers.get("content-type");
    let data: unknown;
    if (contentType && contentType.includes("application/json")) data = await res.json();
    else data = await res.text();
    if (!res.ok) throw buildPlainError(res.status, data, meta);
    return { data: data as T, meta, status: res.status, contentType };
  } finally {
    helper.clear();
  }
}

async function buildError(res: Response) {
  const meta = parseRateMeta(res);
  const contentType = res.headers.get("content-type");
  let payload: unknown = undefined;
  try {
    if (contentType && contentType.includes("application/json")) payload = await res.json();
    else payload = await res.text();
  } catch {
    // ignore
  }
  const err = new Error(`HTTP ${res.status}`) as ApiError;
  err.status = res.status;
  err.payload = payload;
  err.meta = meta;
  return err;
}

function buildPlainError(status: number, payload: unknown, meta: RateMeta) {
  const err = new Error(`HTTP ${status}`) as ApiError;
  err.status = status;
  err.payload = payload;
  err.meta = meta;
  return err;
}

// 使用提供的 schema 验证响应数据（schema 需有 .parse 方法，如 zod）
export function createHttpWithSchema<S>(schema: { parse: (data: unknown) => S }) {
  return async function <T = S>(path: string, init?: RequestInit & { next?: unknown }): Promise<T> {
    const isServer = typeof window === 'undefined';
    const isAbsolute = /^https?:\/\//i.test(path);
    const urlStr = (isServer && !isAbsolute && path.startsWith('/'))
      ? path
      : new URL(
          path,
          isServer
            ? (
                process.env.NEXT_BASE_URL
                || process.env.NEXT_PUBLIC_API_BASE
                || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
                || 'http://localhost:3000'
              )
              : (getRuntimeOrigin() ?? 'http://localhost:3000')
        ).toString();
    const res = await fetch(urlStr, {
        method: init?.method ?? "GET",
      ...init,
      headers: { Accept: "application/json", ...(init?.headers || {}), ...getClientIdHeader() },
      credentials: "include",
    });
    if (!res.ok) throw await buildError(res);
    const contentType = res.headers.get("content-type");
      let data: unknown;
      if (contentType && contentType.includes("application/json")) data = await res.json();
      else data = await res.text();
    const parsed = schema.parse(data);
    return parsed as unknown as T;
  };
}

// A lightweight helper mirroring the shape used by services: accepts a RequestInit,
// auto-JSON stringifies plain object bodies, adds common headers, and returns parsed JSON/text.
type HttpInit = Omit<RequestInit, 'body'> & { body?: unknown; next?: unknown };

export async function http<T = unknown>(path: string, init?: HttpInit): Promise<T> {
  const isServer = typeof window === 'undefined';
  const isAbsolute = /^https?:\/\//i.test(path);
  const urlStr = (isServer && !isAbsolute && path.startsWith('/'))
    ? path
    : new URL(
        path,
        isServer
          ? (
              process.env.NEXT_BASE_URL
              || process.env.NEXT_PUBLIC_API_BASE
              || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
              || 'http://localhost:3000'
            )
          : (getRuntimeOrigin() ?? 'http://localhost:3000')
      ).toString();
  const hasJsonBody = typeof init?.body === "object" && init?.body !== null && !(init?.body instanceof FormData) && !(init?.body instanceof Blob);
  const res = await fetch(urlStr, {
    method: init?.method ?? "GET",
    ...init,
    headers: {
      Accept: "application/json",
      ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
      ...getClientIdHeader(),
    },
    body: hasJsonBody ? JSON.stringify(init?.body) : (init?.body as BodyInit | null | undefined),
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res);
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}
