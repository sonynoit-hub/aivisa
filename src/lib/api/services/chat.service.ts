import { apiGet, apiPost, apiPostWithMeta, type ApiResponse } from "../client";

export type ChatLimits = { limit: number; remaining: number };
export type ChatAnswer = { answer: string; conversationId?: string };

export function getChatLimits(opts?: { timeoutMs?: number; signal?: AbortSignal }) {
  return apiGet<ChatLimits>("/api/chat/limits", undefined, opts);
}

export function sendChat(prompt: string, opts?: { timeoutMs?: number; signal?: AbortSignal; conversationId?: string }) {
  const body: Record<string, unknown> = { prompt };
  if (opts?.conversationId) body.conversationId = opts.conversationId;
  return apiPost<ChatAnswer>("/api/chat", body, opts);
}

export function sendChatWithRate(prompt: string, opts?: { timeoutMs?: number; signal?: AbortSignal; conversationId?: string }) {
  const body: Record<string, unknown> = { prompt };
  if (opts?.conversationId) body.conversationId = opts.conversationId;
  return apiPostWithMeta<ChatAnswer>("/api/chat", body, opts) as Promise<ApiResponse<ChatAnswer>>;
}

export async function streamChat(
  prompt: string,
  opts: {
    conversationId?: string;
    signal?: AbortSignal;
    onEvent?: (ev: { event: string; data?: unknown }) => void;
    onMessage?: (data: unknown) => void;
    onDone?: () => void;
    onError?: (message: string) => void;
  } = {}
) {
  const controller = new AbortController();
  const signal = opts.signal ?? controller.signal;
  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({ prompt, conversationId: opts.conversationId }),
    signal,
  });
  if (!res.ok || !res.body) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      const text = await res.text().catch(() => "");
      if (text) {
        // 尝试解析 JSON 错误响应
        try {
          const errorData: unknown = JSON.parse(text);
          const rec = (errorData && typeof errorData === 'object') ? (errorData as Record<string, unknown>) : undefined;
          if (rec?.code === 'BACKEND_UNREACHABLE') {
            errorMessage = 'BACKEND_UNREACHABLE';
          } else if (typeof rec?.message === 'string' && rec.message) {
            errorMessage = rec.message;
          }
        } catch {
          // 如果不是 JSON，直接使用文本
          errorMessage = text;
        }
      }
    } catch {
      // 忽略读取错误响应体的失败
    }
    throw new Error(errorMessage);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const flush = () => {
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line) continue;
      if (line.startsWith(":")) continue; // comment
      // SSE 格式: event: <name> / data: <json or text>
      if (line.startsWith("event:")) {
        const event = line.slice(6).trim();
        opts.onEvent?.({ event });
      } else if (line.startsWith("data:")) {
        // Do NOT trim. Some providers stream tokens prefixed with a space.
        // Trimming would remove these and glue words together.
        const dataStr = line.slice(5);
        let data: unknown = dataStr;
        try { data = JSON.parse(dataStr); } catch {}
        opts.onMessage?.(data);
      }
    }
  };
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      flush();
    }
    if (buffer) flush();
    opts.onDone?.();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    opts.onError?.(msg);
    throw e;
  } finally {
    reader.releaseLock();
  }
  return { abort: () => controller.abort() };
}
