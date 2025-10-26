import { useCallback, useEffect, useRef, useState } from "react";
import { MessageItem, pollMessages } from "@/lib/api/services/ai.service";

export type UseThreadPollingOptions = {
  baseIntervalMs?: number;   // 默认 1000ms
  maxIntervalMs?: number;    // 默认 8000ms
  limitPerPoll?: number;     // 默认 6（服务端会裁到 1..10）
  pauseWhenStreaming?: boolean; // SSE 进行中是否暂停/退避
  streamingRef?: React.MutableRefObject<boolean | undefined>;
};

export type UseThreadPollingReturn = {
  messages: MessageItem[];              // 本 Hook 内部维护的新消息列表（可与历史合并）
  setMessages: React.Dispatch<React.SetStateAction<MessageItem[]>>;
  lastId: number | undefined;           // 最近一条消息 id
  running: boolean;                     // 轮询是否在运行
  reset: () => void;                    // 手动重置退避/立即触发下一次
};

/**
 * useThreadPolling
 * 为指定 threadId 提供短轮询能力：
 * - 单 in-flight 并发保护
 * - 空结果/错误的指数退避（base -> 2x -> ... -> max）
 * - 429 限流遵循 Retry-After 秒数
 * - 以 message.id 去重，append 顺序为后端的 createdAt 升序
 */
export function useThreadPolling(threadId?: number, opts: UseThreadPollingOptions = {}): UseThreadPollingReturn {
  const base = opts.baseIntervalMs ?? 1000;
  const max = opts.maxIntervalMs ?? 8000;
  const limit = Math.min(10, Math.max(1, opts.limitPerPoll ?? 6));

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [lastId, setLastId] = useState<number | undefined>(undefined);
  const [running, setRunning] = useState(false);

  const intervalRef = useRef(base);
  const timerRef = useRef<number | null>(null);
  const inflightRef = useRef(false);
  const stoppedRef = useRef(false);

  const append = useCallback((items: MessageItem[]) => {
    if (!items?.length) return;
    setMessages((prev) => {
      if (!prev.length) {
        // 无历史，直接去重后拼接
        const seen = new Set<number>();
        const out: MessageItem[] = [];
        for (const it of items) { if (!seen.has(it.id)) { seen.add(it.id); out.push(it); } }
        return out;
      }
      const seen = new Set(prev.map((m) => m.id));
      const merged = [...prev];
      for (const it of items) {
        if (!seen.has(it.id)) merged.push(it);
      }
      return merged;
    });
    setLastId((id) => Math.max(...items.map((m) => m.id), id ?? 0));
  }, []);

  const tickRef = useRef<() => void>(() => {});
  const schedule = useCallback((ms: number) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const fn = tickRef.current;
    timerRef.current = window.setTimeout(() => fn(), ms) as unknown as number;
  }, []);

  const tick = useCallback(async () => {
    if (stoppedRef.current || !threadId) return;

    // SSE 进行中：暂停或延迟
    if (opts.pauseWhenStreaming && opts.streamingRef?.current) {
      intervalRef.current = Math.min(max, Math.max(base, intervalRef.current * 2));
      schedule(intervalRef.current);
      return;
    }

    if (inflightRef.current) {
      // 并发保护：保持单 in-flight
      schedule(intervalRef.current);
      return;
    }

    inflightRef.current = true;
    try {
      const page = await pollMessages(threadId, { sinceMessageId: lastId, limit });
      if (page?.items?.length) {
        append(page.items);
        intervalRef.current = base; // 命中增量 -> 重置
        schedule(base);
      } else {
        // 无新消息 -> 指数退避
        intervalRef.current = Math.min(max, Math.max(base, intervalRef.current * 2));
        schedule(intervalRef.current);
      }
    } catch (e: unknown) {
      const err = (e && typeof e === 'object') ? (e as Record<string, unknown>) : {};
      const status = (typeof err.status === 'number' ? err.status : (typeof err.code === 'number' ? err.code : undefined)) as number | undefined; // 兼容 http 封装差异
      if (status === 429) {
        // 429: 优先使用 Retry-After 头/元数据
        const h = (err.headers as Record<string, unknown> | undefined)?.["retry-after"] ?? (err.meta as Record<string, unknown> | undefined)?.retryAfterSec;
        const n = Number(h);
        const waitMs = Number.isFinite(n) && n >= 0 ? n * 1000 : Math.min(max, Math.max(base, intervalRef.current * 2));
        intervalRef.current = waitMs;
        schedule(waitMs);
      } else {
        // 其他错误 -> 退避
        intervalRef.current = Math.min(max, Math.max(base, intervalRef.current * 2));
        schedule(intervalRef.current);
      }
    } finally {
      inflightRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [append, base, lastId, limit, max, threadId]);

  // keep latest tick in ref for schedule
  useEffect(() => { tickRef.current = tick; }, [tick]);

  const reset = useCallback(() => {
    intervalRef.current = base;
    schedule(0);
  }, [base, schedule]);

  useEffect(() => {
    if (!threadId) return;
    stoppedRef.current = false;
    setRunning(true);
    intervalRef.current = base;
    schedule(0);
    return () => {
      stoppedRef.current = true;
      setRunning(false);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [threadId, base, schedule]);

  return { messages, setMessages, lastId, running, reset };
}
