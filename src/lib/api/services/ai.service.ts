import { http, getClientIdHeader } from "../client";

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object";
}

// AI Chat API types based on backend contract
export type ThreadItem = {
  id: number;
  status: string;
  locale: string | null;
  topicHint: string | null;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  closedAt: string | null; // ISO-8601 | null
};

export type MessageRole = "user" | "assistant" | "system" | "tool";

export type MessageItem = {
  id: number;
  threadId: number;
  role: MessageRole;
  content: string;
  provider: string | null;
  model: string | null;
  createdAt: string; // ISO-8601
};

export type AiConfig = {
  openai: {
    configured: boolean;
    baseUrl?: string | null;
    model?: string | null;
    summarizeModel?: string | null;
    restrictVisaScope?: boolean;
    timeoutMs?: number;
    debug?: boolean;
  };
  chat: {
    dailyLimit?: number | null;
    ipDailyLimit?: number | null;
    historySize?: number | null;
    summary?: {
      enabled?: boolean;
      minMessages?: number | null;
      intervalMessages?: number | null;
      maxHistory?: number | null;
      maxSummaryChars?: number | null;
    };
    debugContext?: boolean;
  };
};

export type ThreadCreateRequest = {
  webSessionId?: number;
  anonUserId?: string; // UUID
  userId?: number;
  locale?: string;
  topicHint?: string;
};

export type MessageCreateRequest = {
  role: MessageRole;
  content: string;
  metaJson?: string;
  tokenIn?: number;
  tokenOut?: number;
  latencyMs?: number;
  costMicroUsd?: number;
  safetyFlags?: string;
  provider?: string;
  model?: string;
  redacted?: boolean;
};

export type GenerateRequest = {
  content: string; // user input
  locale?: string;
  metaJson?: string;
};

export type FeedbackCreateRequest = {
  threadId: number;
  messageId: number;
  scoreText: string; // helpful/spam...
  commentText: string;
  source: string; // user/internal
  createdByUserId?: number;
};

export type RunCreateRequest = {
  threadId?: number;
  messageId?: number;
  provider?: string;
  model?: string;
  inputJson?: string;
  outputJson?: string;
  tokenIn?: number;
  tokenOut?: number;
  latencyMs?: number;
  httpStatus?: number;
  cacheHit?: boolean;
  errorCode?: string;
  retryOf?: number;
  costMicroUsd?: number;
};

export type ToolCallCreateRequest = {
  runId: number;
  toolName: string;
  arguments?: string; // json
  result?: string; // json
  latencyMs?: number;
  success?: boolean;
  errorCode?: string;
  sensitive?: boolean;
};

export async function getAiConfig() {
  return http<AiConfig>("/api/ai/config", { method: "GET" });
}

export async function createThread(body: ThreadCreateRequest) {
  return http<ThreadItem>("/api/ai/threads", { method: "POST", body, headers: { "X-Requested-With": "XMLHttpRequest" } });
}

export async function listThreads(params: { anonUserId?: string; webSessionId?: number; userId?: number; size?: number }) {
  const search = new URLSearchParams();
  if (params.anonUserId) search.set("anonUserId", params.anonUserId);
  if (typeof params.webSessionId === "number") search.set("webSessionId", String(params.webSessionId));
  if (typeof params.userId === "number") search.set("userId", String(params.userId));
  if (typeof params.size === "number") search.set("size", String(params.size));
  const qs = search.toString();
  return http<{ items: ThreadItem[]; size: number }>(`/api/ai/threads${qs ? `?${qs}` : ""}`);
}

export async function createMessage(threadId: number, body: MessageCreateRequest) {
  return http<MessageItem>(`/api/ai/threads/${threadId}/messages`, { method: "POST", body, headers: { "X-Requested-With": "XMLHttpRequest" } });
}

export async function listMessages(threadId: number, size?: number) {
  const qs = typeof size === "number" ? `?size=${size}` : "";
  return http<{ items: MessageItem[]; size: number }>(`/api/ai/threads/${threadId}/messages${qs}`);
}

// Incremental polling for new messages in a thread
// Server contract: returns items with id > sinceMessageId, up to limit (server clamps 1..10)
export async function pollMessages(
  threadId: number,
  params?: { sinceMessageId?: number; limit?: number }
) {
  const search = new URLSearchParams();
  if (typeof params?.sinceMessageId === "number") search.set("sinceMessageId", String(params.sinceMessageId));
  if (typeof params?.limit === "number") search.set("limit", String(params.limit));
  const qs = search.toString();
  return http<{ items: MessageItem[]; total: number }>(`/api/ai/threads/${threadId}/poll${qs ? `?${qs}` : ""}`);
}

// SSE via POST for generation
export function streamGenerate(
  threadId: number,
  body: GenerateRequest,
  handlers: {
    signal?: AbortSignal;
    onDelta?: (chunk: string) => void;
    onMessage?: (item: MessageItem) => void;
    onDone?: () => void;
    onError?: (message: string) => void;
  } = {}
) {
  const controller = new AbortController();
  const signal = handlers.signal ?? controller.signal;
  const url = `/api/ai/threads/${threadId}/stream`;
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream", "X-Requested-With": "XMLHttpRequest", ...getClientIdHeader() },
    body: JSON.stringify(body),
    signal,
    credentials: "include",
    // 避免自动跟随到登录页，便于我们识别 30x/401 并给出友好提示（浏览器会将跨源 opaqueredirect 屏蔽细节，这里同源通常可用）
    redirect: "follow",
  };
  let cancelled = false;

  const run = async () => {
    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      handlers.onError?.(msg);
      throw e;
    }
    const ct = res.headers.get("content-type") || "";
    // 鉴别鉴权失败/被重定向到登录页或非 SSE 响应
    if (!res.ok || !res.body || !ct.includes("text/event-stream")) {
      // 429: 将 Retry-After 与后端 JSON (若有) 编码给 UI，便于倒计时
      if (res.status === 429) {
        let retryAfterSec: number | undefined;
        const h = res.headers.get("retry-after");
        const n = Number(h ?? "");
        if (Number.isFinite(n) && n >= 0) retryAfterSec = n;
        let resetAt: string | undefined;
        try {
          const text = await res.text();
          try {
            const obj: unknown = JSON.parse(text);
            if (isRecord(obj)) {
              const resetAtVal = obj["resetAt"];
              if (typeof resetAtVal === "string") resetAt = resetAtVal;

              const retryAfterVal = obj["retryAfter"];
              if (retryAfterSec == null && typeof retryAfterVal === "number") retryAfterSec = retryAfterVal;
            }
          } catch {
            // ignore non-JSON body
          }
        } catch {}
        const payload = { code: 'RATE_LIMIT', retryAfterSec, resetAt };
        const encoded = `RATE_LIMIT:${JSON.stringify(payload)}`;
        handlers.onError?.(encoded);
        throw new Error("HTTP 429");
      }

      let msg = `HTTP ${res.status}`;
      if (res.status === 401 || res.status === 403) {
        msg = "AUTH_REQUIRED";
      } else {
        try {
          const text = await res.text();
          // 常见后端会返回登录页 HTML 或 JSON 提示
          if (/login|signin|auth/i.test(text)) msg = "AUTH_REQUIRED";
          else if (text) msg = text;
        } catch {}
      }
      handlers.onError?.(msg);
      throw new Error(msg);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    // Robust SSE parser: accumulates fields until a blank line, then dispatches
    let buf = "";
    let event: string | null = null;
    let dataLines: string[] = [];

    const dispatch = () => {
      const dataStr = dataLines.join("\n");
      if (!event || event === "message") {
        // In our API, message carries the final assistant MessageItem JSON
        try {
          const obj = JSON.parse(dataStr);
          handlers.onMessage?.(obj as MessageItem);
        } catch {
          // ignore non-JSON message
        }
      } else if (event === "delta") {
        handlers.onDelta?.(dataStr);
      } else if (event === "done") {
        handlers.onDone?.();
      } else if (event === "error") {
        handlers.onError?.(dataStr || "生成失败");
      }
    };

    const processChunk = (text: string) => {
      buf += text;
      let idx: number;
      while ((idx = buf.indexOf("\n\n")) >= 0) {
        const raw = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        const lines = raw.split(/\r?\n/);
        event = null;
        dataLines = [];
        for (const line of lines) {
          if (!line) continue;
          if (line.startsWith(":")) continue; // comment
          if (line.startsWith("event:")) {
            event = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            // Preserve leading spaces in SSE data payloads. Many LLM token streams
            // send chunks that begin with a leading space; trimming here will glue
            // words together (e.g., "hello" + " world" -> "helloworld").
            dataLines.push(line.slice(5));
          }
        }
        if (event || dataLines.length) dispatch();
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done || cancelled) break;
        processChunk(decoder.decode(value, { stream: true }));
      }
      if (buf) processChunk("\n\n"); // flush last event
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!cancelled) handlers.onError?.(msg);
      throw e;
    } finally {
      reader.releaseLock();
    }
  };

  void run();
  return { abort: () => { cancelled = true; controller.abort(); } };
}

// Helpers for browser local storage of anon user and thread
export function getOrCreateAnonUserId(): string | undefined {
  try {
    if (typeof window === "undefined") return undefined;
    const key = "ai_anon_user_id";
    const isUuid = (s: string) => /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i.test(s);
    const uuidv4 = () =>
      (globalThis.crypto?.randomUUID?.() ||
        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        })) as string;

    let id = window.localStorage.getItem(key) || undefined;
    if (!id || !isUuid(id)) {
      id = uuidv4();
      window.localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export async function ensureThreadId(locale?: string): Promise<number> {
  // Try to reuse existing thread id
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem("ai_thread_id") : null;
    if (raw) {
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {}
  const keyUser = "ai_anon_user_id";
  const tryCreate = async (): Promise<number> => {
    const anonUserId = getOrCreateAnonUserId();
    const thread = await createThread({ anonUserId, locale });
    return thread.id;
  };
  try {
    const id = await tryCreate();
    try { if (typeof window !== 'undefined') window.localStorage.setItem("ai_thread_id", String(id)); } catch {}
    return id;
  } catch (e: unknown) {
    const err = isRecord(e) ? e : undefined;
    const status = typeof err?.status === "number" ? (err.status as number) : undefined;
    // 如果由于历史上存了非 UUID 导致 400，则清理并重试一次
    if (status === 400) {
      try { if (typeof window !== 'undefined') window.localStorage.removeItem(keyUser); } catch {}
      const id = await tryCreate();
      try { if (typeof window !== 'undefined') window.localStorage.setItem("ai_thread_id", String(id)); } catch {}
      return id;
    }
    throw e;
  }
}

export async function sendFeedback(body: FeedbackCreateRequest) {
  return http("/api/ai/feedback", { method: "POST", body, headers: { "X-Requested-With": "XMLHttpRequest" } });
}

export async function logRun(body: RunCreateRequest) {
  return http("/api/ai/runs", { method: "POST", body, headers: { "X-Requested-With": "XMLHttpRequest" } });
}

export async function logToolCall(body: ToolCallCreateRequest) {
  return http("/api/ai/tool-calls", { method: "POST", body, headers: { "X-Requested-With": "XMLHttpRequest" } });
}
