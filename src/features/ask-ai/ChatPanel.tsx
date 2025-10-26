"use client";

import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getChatLimits, sendChatWithRate } from "@/lib/api/services/chat.service";

type Msg = { role: "user" | "ai" | "error"; content: string };

export default function ChatPanel() {
  const t = useTranslations();
  const te = useTranslations('errors');
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [limit, setLimit] = useState<number | undefined>(undefined);
  const [remaining, setRemaining] = useState<number | undefined>(undefined);
  const [retryAfter, setRetryAfter] = useState<number>(0);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const didAutoAskRef = useRef(false);

  const scrollToBottom = useCallback((opts?: { smooth?: boolean }) => {
    const el = listRef.current;
    if (!el) return;
    try {
      const behavior = opts?.smooth === false ? "auto" : "smooth";
      el.scrollTo({ top: el.scrollHeight, behavior });
    } catch {
      // 兜底：部分浏览器不支持 scrollTo options
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  const ensureWindowSeesBottom = useCallback(() => {
    // 确保卡片底部也进入视口（如果外层窗口有滚动条）
    const anchor = bottomRef.current;
    if (!anchor) return;
    try {
      const rect = anchor.getBoundingClientRect();
      const gap = 16; // 预留 16px 余量
      if (rect.bottom > window.innerHeight - gap) {
        anchor.scrollIntoView({ block: "end", behavior: "smooth" });
      }
    } catch {
      // ignore
    }
  }, []);

  useLayoutEffect(() => {
    // 在布局阶段尽早贴底，随后再用 RAF 确认一次
    scrollToBottom({ smooth: false });
    let raf1 = 0, raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        scrollToBottom();
        ensureWindowSeesBottom();
      });
    });
    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [msgs, scrollToBottom, ensureWindowSeesBottom]);

  useEffect(() => {
    // 监听列表尺寸变化（例如字体或图片导致高度变化），保持贴底
    const el = listRef.current;
    if (!el || !(globalThis as any).ResizeObserver) return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        scrollToBottom();
        ensureWindowSeesBottom();
      });
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollToBottom, ensureWindowSeesBottom]);

  useEffect(() => {
    // 初始化获取额度
    void (async () => {
      try {
        const r = await getChatLimits();
        setLimit(r.limit);
        setRemaining(r.remaining);
      } catch {
        // 忽略额度加载错误
      }
    })();
  }, []);

  // 读取本地保存的会话ID
  useEffect(() => {
    try {
      const cid = window.localStorage.getItem("vp_conversation_id") || undefined;
      if (cid) setConversationId(cid);
    } catch {}
  }, []);

  const sendWith = async (text: string) => {
    if (!text.trim() || loading) return;
    if (retryAfter > 0) return; // 限流倒计时中，阻止发送
    setLoading(true);
    setMsgs(m => [...m, { role: "user", content: text }]);
    // 发送后立即尝试贴底，避免用户消息被顶出视口
  requestAnimationFrame(() => { scrollToBottom(); ensureWindowSeesBottom(); });
    try {
    const r = await sendChatWithRate(text, { conversationId });
    const ans = r?.data?.answer ?? "";
      if (typeof r?.data?.conversationId === "string") {
        setConversationId(r.data.conversationId);
        try { window.localStorage.setItem("vp_conversation_id", r.data.conversationId); } catch {}
      }
      setMsgs(m => [...m, { role: "ai", content: ans }]);
      if (typeof r.meta.limit === "number") setLimit(r.meta.limit);
      if (typeof r.meta.remaining === "number") setRemaining(r.meta.remaining);
    } catch (e: any) {
      const status = e?.status as number | undefined;
      const meta = e?.meta as { retryAfterSec?: number; limit?: number; remaining?: number } | undefined;
      const code = String(e?.payload?.code || "").toUpperCase();
      if (status === 429) {
        const wait = Math.max(0, Number(meta?.retryAfterSec ?? 0));
        if (wait > 0) setRetryAfter(wait);
        const isDailyExhausted = (typeof meta?.remaining === 'number' && meta.remaining <= 0) || code === 'RATE_LIMITED';
        const content = isDailyExhausted ? te('rateLimited') : te('rateLimited');
        setMsgs(m => [...m, { role: "error", content }]);
      } else if (code === 'BACKEND_UNREACHABLE' || (e?.message && /fetch failed|Failed to fetch|NetworkError/i.test(String(e.message)))) {
        setMsgs(m => [...m, { role: "error", content: te('serverBusy') }]);
      } else if (status && status >= 400 && status < 500) {
        // 不再显示后端的原始 message，统一使用友好提示
        setMsgs(m => [...m, { role: "error", content: te('generic') }]);
      } else {
        setMsgs(m => [...m, { role: "error", content: te('network') }]);
      }
      if (typeof meta?.limit === "number") setLimit(meta.limit);
      if (typeof meta?.remaining === "number") setRemaining(meta.remaining);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const send = () => {
    const text = q.trim();
    if (!text) return;
    setQ("");
    void sendWith(text);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // 页面初次加载，如果 URL 上有 ?q=...，自动发起一次
  useEffect(() => {
    const initial = params.get("q");
    if (initial && initial.trim() && !didAutoAskRef.current) {
      didAutoAskRef.current = true;
      setQ(initial);
      requestAnimationFrame(() => scrollToBottom());
      void sendWith(initial);
      // 清理 URL 的 q，避免开发模式下副作用重复
      try {
        const p = new URLSearchParams(params.toString());
        p.delete("q");
        router.replace(`${pathname}${p.toString() ? `?${p}` : ""}`);
      } catch {}
    }
    // 仅首次装载时读取
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 429 倒计时
  useEffect(() => {
    if (retryAfter <= 0) return;
    const id = setInterval(() => {
      setRetryAfter((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [retryAfter]);

  return (
    <div className="mx-auto max-w-2xl py-6 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div ref={listRef} className="p-4 h-[420px] overflow-y-auto space-y-3">
          {msgs.length === 0 && (
            <div className="text-sm text-slate-500">
              开始对话吧：在下方输入问题并回车发送（Shift+Enter 换行）。支持从 URL 读取 <code>?q=</code> 自动发问。
            </div>
          )}
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap leading-relaxed text-sm p-3 rounded-xl ${
                m.role === "user"
                  ? "bg-slate-50"
                  : m.role === "ai"
                  ? "bg-emerald-50"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              <div className="mb-1 text-xs font-medium text-slate-400">
                {m.role === "user" ? "你" : m.role === "ai" ? "AI" : "错误"}
              </div>
              {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
            <div>
              今日额度：{limit ?? "-"}，剩余：{remaining ?? "-"}
            </div>
            {retryAfter > 0 && (
              <div className="text-rose-600">触发限流，请在 {retryAfter}s 后重试</div>
            )}
          </div>
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              className="flex-1 resize-none rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              rows={3}
              placeholder="输入你的问题…（回车发送，Shift+Enter 换行）"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              onClick={send}
              disabled={loading || !q.trim() || retryAfter > 0}
              className="h-10 shrink-0 rounded-xl px-4 text-sm font-medium text-white bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
            >
              {loading ? "发送中…" : "发送"}
            </button>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            部分模型不支持自定义 temperature，后端已做兼容处理。
          </div>
        </div>
      </div>
    </div>
  );
}
