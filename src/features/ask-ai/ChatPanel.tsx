"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
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
  const params = useSearchParams();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

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
    if (initial && initial.trim()) {
      setQ(initial);
      void sendWith(initial);
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
        <div className="p-4 h-[420px] overflow-y-auto space-y-3">
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
