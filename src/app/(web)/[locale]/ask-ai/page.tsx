"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ensureThreadId, streamGenerate, sendFeedback } from "@/lib/api/services/ai.service";
import { useLocale as useAppLocale } from "@/hooks/useLocale";
import Markdown from "@/components/common/Markdown";
import { useTranslations } from "next-intl";
 

type Msg = { role: "user" | "ai"; text: string; streaming?: boolean; id?: number; feedback?: "up" | "down" };

// 将模型输出标准化为更易读的 Markdown：
// - 合并“1.”独立一行与其后首个非空行
// - 标准化编号标点 (1)、1、 1、 -> 1.
// - 将 • · ・ 等前缀转换为 - 列表
function normalizeAiMarkdown(text: string): string {
  const raw = text.replace(/\r\n?/g, "\n");
  const src = raw.split("\n");
  const out: string[] = [];
  for (let i = 0; i < src.length; i++) {
    let l = src[i];
    // bullet dots -> '- '
    if (/^\s*[•·・]\s+/.test(l)) {
      out.push(l.replace(/^\s*[•·・]\s+/, "- "));
      continue;
    }
    // number-only line -> merge with next non-empty line
    const mOnly = l.match(/^\s*(\d+)[\.)。、，]?\s*$/);
    if (mOnly) {
      let j = i + 1;
      while (j < src.length && !src[j].trim()) j++;
      if (j < src.length) {
        const next = src[j].trim().replace(/^[-•·・]\s+/, "");
        out.push(`${mOnly[1]}. ${next}`);
        i = j;
        continue;
      }
    }
    // normalize numbered line start
    if (/^\s*\d+[\.)。、，]\s+/.test(l)) {
      l = l.replace(/^\s*(\d+)[\.)。、，]\s+/, (_s, n) => `${n}. `);
      out.push(l);
      continue;
    }
    out.push(l);
  }
  return out.join("\n");
}

export default function AskAIPage() {
  const t = useTranslations("ask-ai");
  const te = useTranslations("errors");
  const appLocale = useAppLocale();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const sendingRef = useRef(false);
  const [threadId, setThreadId] = useState<number | undefined>(undefined);
  const streamAbortRef = useRef<{ abort: () => void } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // 429 限流处理：封禁到期时间与倒计时
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [blockedCountdown, setBlockedCountdown] = useState<number>(0);
  // 打字机“... ”动画：1~3个点循环
  const [typingTick, setTypingTick] = useState(0);
  const typingTimerRef = useRef<number | null>(null);
  const didAutoAskRef = useRef(false);

  // 滚动到底部 + 根据固定输入框高度留白
  const listRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const [bottomPad, setBottomPad] = useState(120);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const prevComposerHRef = useRef(0);
  const roRafRef = useRef<number | null>(null);

  const scrollToBottom = (behavior: "auto" | "smooth" = "smooth") => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ block: "end", behavior });
    } else if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior });
    }
  };
  // 不再基于 messages 副作用自动滚动，改为在发送/接收时按需滚动
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    const apply = () => {
      const h = el.offsetHeight;
      const prev = prevComposerHRef.current || 0;
      if (Math.abs(h - prev) >= 2) {
        prevComposerHRef.current = h;
        setBottomPad(h + 8);
      }
      roRafRef.current = null;
    };
    const ro = new ResizeObserver(() => {
      if (roRafRef.current) return;
      roRafRef.current = window.requestAnimationFrame(apply);
    });
    ro.observe(el);
    // 初始应用一次
    prevComposerHRef.current = el.offsetHeight;
    setBottomPad(el.offsetHeight + 8);
    return () => {
      ro.disconnect();
      if (roRafRef.current) cancelAnimationFrame(roRafRef.current);
      roRafRef.current = null;
    };
  }, []);

  // 仅在存在流式消息时开启动画计时器，避免频繁创建/销毁
  useEffect(() => {
    const active = messages.some((m) => m.streaming);
    if (active && typingTimerRef.current == null) {
      typingTimerRef.current = window.setInterval(() => {
        setTypingTick((t) => (t + 1) % 3);
      }, 350);
    } else if (!active && typingTimerRef.current != null) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
      setTypingTick(0);
    }
  }, [messages]);
  useEffect(() => {
    return () => {
      if (typingTimerRef.current != null) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, []);

  // 监听滚动，确定是否接近底部
  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const threshold = 120; // px
    const dist = el.scrollHeight - (el.scrollTop + el.clientHeight);
    const nb = dist <= threshold;
    setShowScrollDown(!nb);
  };

  // 读取本地保存的线程ID（如有）
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem("ai_thread_id") : null;
      if (raw) {
        const n = Number(raw);
        if (Number.isFinite(n) && n > 0) setThreadId(n);
      }
    } catch {}
  }, []);

  // 读取本地封禁信息（429 后存入 localStorage）
  useEffect(() => {
    try {
      const s = typeof window !== 'undefined' ? window.localStorage.getItem('ai_block_until') : null;
      const n = s ? Number(s) : NaN;
      if (Number.isFinite(n) && n > Date.now()) {
        setBlockedUntil(n);
      } else if (s) {
        // 过期清理
        window.localStorage.removeItem('ai_block_until');
      }
    } catch {}
  }, []);

  // 倒计时定时器
  useEffect(() => {
    if (!blockedUntil) return;
    const tick = () => {
      const leftMs = Math.max(0, blockedUntil - Date.now());
      setBlockedCountdown(Math.ceil(leftMs / 1000));
      if (leftMs <= 0) {
        setBlockedUntil(null);
        try { if (typeof window !== 'undefined') window.localStorage.removeItem('ai_block_until'); } catch {}
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => { clearInterval(id); };
  }, [blockedUntil]);

  const isNearBottomNow = () => {
    const el = listRef.current;
    if (!el) return true;
    const threshold = 120;
    const dist = el.scrollHeight - (el.scrollTop + el.clientHeight);
    return dist <= threshold;
  };

  const sendWith = async (content: string) => {
    const text = content.trim();
    if (!text || loading || sendingRef.current) return;
    // 若处于限流封禁期，直接提示并不发起请求
    if (blockedUntil && blockedUntil > Date.now()) {
      const left = Math.max(0, blockedUntil - Date.now());
      const sec = Math.ceil(left / 1000);
      const mins = Math.floor(sec / 60);
      const rem = sec % 60;
      const hint = mins > 0 ? `${mins}分${rem}秒` : `${rem}秒`;
      setMessages((m) => [...m, { role: "ai", text: `⚠️ 今日次数已用尽，${hint} 后可再试。`, streaming: false }]);
      return;
    }
    sendingRef.current = true;
  setMessages((m) => [...m, { role: "user", text, streaming: false }]);
    setInput("");
    // 发送后强制滚到底部（产品期望：发出与回复完成都自动贴底）
    requestAnimationFrame(() => scrollToBottom("smooth"));
    setShowScrollDown(false);
    setLoading(true);
  // 不使用伪流式，直接等待完整答案，避免排版错乱
    try {
      // 使用真正的 POST SSE 流式
      // 确保线程存在
      let tid = threadId;
      if (!tid) {
        tid = await ensureThreadId(appLocale);
        setThreadId(tid);
      }
      // 先插入空的 AI 消息作为占位
      setMessages((m) => [...m, { role: "ai", text: "", streaming: true }]);
  const nbStart = isNearBottomNow();
      const handle = streamGenerate(tid!, { content: text }, {
        onDelta: (slice: string) => {
          // 逐段追加
          setMessages((m) => {
            if (m.length === 0) return m;
            const n = [...m];
            for (let k = n.length - 1; k >= 0; k--) {
              if (n[k].role === "ai") {
                n[k] = { ...n[k], text: String(n[k].text || "") + slice };
                break;
              }
            }
            return n;
          });
          if (nbStart) requestAnimationFrame(() => scrollToBottom("smooth"));
        },
        onMessage: (item) => {
          // 记录后端返回的最终消息ID，便于后续反馈
          setMessages((m) => {
            if (m.length === 0) return m;
            const n = [...m];
            for (let k = n.length - 1; k >= 0; k--) {
              if (n[k].role === "ai") {
                n[k] = { ...n[k], id: item.id };
                break;
              }
            }
            return n;
          });
        },
        onDone: () => {
          setMessages((m) => {
            if (m.length === 0) return m;
            const n = [...m];
            for (let k = n.length - 1; k >= 0; k--) {
              if (n[k].role === "ai" && n[k].streaming) {
                n[k] = { ...n[k], streaming: false };
                break;
              }
            }
            return n;
          });
          streamAbortRef.current = null;
          // 回复完成后强制滚到底部（贴合预期行为）
          requestAnimationFrame(() => scrollToBottom("smooth"));
          setShowScrollDown(false);
        },
        onError: (msg: string) => {
          // 特判限流：RATE_LIMIT:{ retryAfterSec, resetAt }
          if (typeof msg === 'string' && msg.startsWith('RATE_LIMIT:')) {
            try {
              const raw = msg.slice('RATE_LIMIT:'.length);
              const info = JSON.parse(raw) as { code?: string; retryAfterSec?: number; resetAt?: string };
              let until = Date.now();
              if (typeof info.retryAfterSec === 'number' && info.retryAfterSec >= 0) {
                until = Date.now() + info.retryAfterSec * 1000;
              } else if (typeof info.resetAt === 'string') {
                const t = Date.parse(info.resetAt);
                if (!Number.isNaN(t)) until = t;
              }
              if (until > Date.now()) {
                setBlockedUntil(until);
                try { if (typeof window !== 'undefined') window.localStorage.setItem('ai_block_until', String(until)); } catch {}
              }
              const leftMs = Math.max(0, until - Date.now());
              const sec = Math.ceil(leftMs / 1000);
              const mins = Math.floor(sec / 60);
              const rem = sec % 60;
              const hint = mins > 0 ? `${mins}分${rem}秒` : `${rem}秒`;
              setMessages((m) => {
                if (m.length === 0) return [{ role: 'ai', text: `⚠️ 今日次数已用尽，${hint} 后可再试。`, streaming: false }];
                const n = [...m];
                for (let k = n.length - 1; k >= 0; k--) {
                  if (n[k].role === 'ai' && n[k].streaming) {
                    n[k] = { ...n[k], text: `${(n[k].text || '').trim()}\n⚠️ 今日次数已用尽，${hint} 后可再试。`.trim(), streaming: false };
                    return n;
                  }
                }
                n.push({ role: 'ai', text: `⚠️ 今日次数已用尽，${hint} 后可再试。`, streaming: false });
                return n;
              });
              streamAbortRef.current = null;
              return;
            } catch {
              // fallthrough to generic
            }
          }

          // 结束当前流并附加错误提示（通用）
          setMessages((m) => {
            if (m.length === 0) return [{ role: "ai", text: `⚠️ ${/BACKEND_UNREACHABLE|fetch failed|NetworkError/i.test(msg) ? te('serverBusy') : te('generic')}` , streaming: false }];
            const n = [...m];
            for (let k = n.length - 1; k >= 0; k--) {
              if (n[k].role === "ai" && n[k].streaming) {
                const hint = msg === 'AUTH_REQUIRED' ? te('serverBusy') : (/BACKEND_UNREACHABLE|fetch failed|NetworkError/i.test(msg) ? te('serverBusy') : te('generic'));
                n[k] = { ...n[k], text: `${n[k].text}\n⚠️ ${hint}`.trim(), streaming: false };
                return n;
              }
            }
            const hint = msg === 'AUTH_REQUIRED' ? te('serverBusy') : (/BACKEND_UNREACHABLE|fetch failed|NetworkError/i.test(msg) ? te('serverBusy') : te('generic'));
            n.push({ role: "ai", text: `⚠️ ${hint}`, streaming: false });
            return n;
          });
          streamAbortRef.current = null;
          // 错误也视为一次回复结束，滚到底部方便用户查看
          requestAnimationFrame(() => scrollToBottom("smooth"));
          setShowScrollDown(false);
        },
      });
      streamAbortRef.current = handle;
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown): string => {
        if (typeof e === 'string') return e;
        if (e && typeof e === 'object') {
          const maybe = (e as { message?: unknown }).message;
          if (typeof maybe === 'string') return maybe;
        }
        return 'Unknown error';
      };
      const msg = getErrorMessage(err);
      const hint = /BACKEND_UNREACHABLE|fetch failed|NetworkError/i.test(msg) ? te('serverBusy') : te('generic');
      setMessages((m) => [...m, { role: "ai", text: `⚠️ ${hint}` }]);
      // 错误同样遵循不打断阅读
      const nbAfter = isNearBottomNow();
      if (nbAfter) {
        requestAnimationFrame(() => scrollToBottom("smooth"));
      } else {
        setShowScrollDown(true);
      }
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  const send = async () => {
    const content = input.trim();
    if (!content) return;
    await sendWith(content);
  };

  // textarea 自适应（最多 5 行）
  const taRef = useRef<HTMLTextAreaElement>(null);
  const autoResize = () => {
    if (!taRef.current) return;
    const lineH = 24;
    const maxH = 5 * lineH + 16;
    taRef.current.style.height = "0px";
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, maxH) + "px";
  };
  useEffect(() => { autoResize(); }, []);
  useEffect(() => { autoResize(); }, [input]);

  // 初次加载：若有 ?q= 自动发送
  useEffect(() => {
    // 恢复消息记录
    let didRestore = false;
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('vp_askai_msgs_v1') : null;
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          const sanitized = arr.filter((x) => x && (x.role === 'user' || x.role === 'ai') && typeof x.text === 'string');
          if (sanitized.length) {
            setMessages(sanitized as Msg[]);
            didRestore = true;
          }
        }
      }
    } catch {}

    const q = searchParams.get("q");
    if (q && q.trim()) {
      if (!didAutoAskRef.current) {
        didAutoAskRef.current = true;
        setInput(q);
        // 先滚到底再发，避免首条消息在视口外
        requestAnimationFrame(() => scrollToBottom("auto"));
        // 触发一次发送
        void sendWith(q);
        // 清理 URL 中的 q，避免某些情况下再次触发（如开发模式下严格模式副作用重复）
        try {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("q");
          router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`);
        } catch {}
      }
    } else if (didRestore) {
      // 首次进入并恢复了历史消息：默认滚到底部，仿 ChatGPT
      setTimeout(() => scrollToBottom("auto"), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 初始计算是否接近底部，避免页面挂载时误判为接近底部
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const threshold = 120;
    const dist = el.scrollHeight - (el.scrollTop + el.clientHeight);
    const nb = dist <= threshold;
    setShowScrollDown(!nb);
  }, []);

  // 持久化消息记录
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('vp_askai_msgs_v1', JSON.stringify(messages));
      }
    } catch {}
  }, [messages]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isEnter = e.key === "Enter";
    const isMetaSend = (e.metaKey || e.ctrlKey) && isEnter;
    if ((isEnter && !e.shiftKey) || isMetaSend) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* 消息列表（可滚动区域） */}
      <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto" onScroll={onScroll}>
        <div className="mx-auto max-w-2xl px-4 sm:px-5 py-6 space-y-5" style={{ paddingBottom: bottomPad }}>
          {messages.length === 0 && (
            <div className="min-h-[40vh] grid place-items-center">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold text-slate-900">{t("hero.title")}</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {(
                    [
                      "suggestions.hspPoints",
                      "suggestions.whichWorkVisa",
                      "suggestions.permanentResidency",
                      "suggestions.familyStay",
                      "suggestions.updateChangeDocs",
                    ] as const
                  ).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { const tag = t(key); setInput(tag); void sendWith(tag); }}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition"
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className="flex w-full mb-6"> {/* mb-2 -> mb-6 间隔更大 */}
              {m.role === "ai" ? (
                <div className="flex-1 flex">
                  <div className="group relative px-5 py-3 max-w-full sm:max-w-[80%] text-[15px] leading-7 text-slate-900 space-y-3" style={{ wordBreak: "break-word", background: "none", boxShadow: "none", border: "none" }}>
                    <Markdown className="prose prose-slate max-w-none">{normalizeAiMarkdown(m.text)}</Markdown>
                    {/* 流式中：显示省略号和光标效果 */}
                    {m.streaming && (
                      <div className="inline-flex items-center gap-3 text-slate-500 text-sm select-none">
                        <div className="inline-flex items-baseline">
                          <span className="ml-1 font-mono">{".".repeat(typingTick + 1)}</span>
                          <span className="ml-1 inline-block h-[1em] w-[0.6ch] bg-slate-500/70 animate-pulse align-baseline" />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            try { streamAbortRef.current?.abort(); } catch {}
                            setMessages((ms) => {
                              const n = [...ms];
                              for (let k = n.length - 1; k >= 0; k--) {
                                if (n[k].role === "ai" && n[k].streaming) { n[k] = { ...n[k], streaming: false }; break; }
                              }
                              return n;
                            });
                          }}
                          className="p-1 rounded hover:bg-slate-100 active:scale-95 transition"
                          title="Stop"
                          aria-label="Stop"
                          style={{boxShadow: "none", background: "none"}}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" className="fill-slate-500">
                            <path d="M8 8h8v8H8z" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div className="flex items-end gap-1">
                      {!m.streaming && (
                        <button
                          type="button"
                          onClick={async () => {
                          // 只在浏览器环境下检测
                          if (typeof window === "undefined" || typeof navigator === "undefined") {
                            alert("请在浏览器中使用复制功能。");
                            return;
                          }
                          const text = m.text;
                          // 优先 clipboard API
                          if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                            try {
                              await navigator.clipboard.writeText(text);
                              setCopiedIdx(i);
                              setTimeout(() => setCopiedIdx((v) => (v === i ? null : v)), 1500);
                              return;
                            } catch {
                              // 失败则降级
                            }
                          }
                          // 降级到 execCommand 方案
                          try {
                            const textarea = document.createElement("textarea");
                            textarea.value = text;
                            textarea.setAttribute("readonly", "readonly");
                            textarea.style.position = "absolute";
                            textarea.style.left = "-9999px";
                            document.body.appendChild(textarea);
                            textarea.select();
                            const successful = document.execCommand("copy");
                            document.body.removeChild(textarea);
                            if (successful) {
                              setCopiedIdx(i);
                              setTimeout(() => setCopiedIdx((v) => (v === i ? null : v)), 1500);
                            } else {
                              alert("复制失败，请手动复制内容。");
                            }
                          } catch (e) {
                            alert("复制失败，请手动复制内容。\n" + (e instanceof Error ? e.message : String(e)));
                          }
                        }}
                          className="mt-2 ml-0 p-1 rounded hover:bg-slate-100 active:scale-95 transition"
                          title={t("actions.copy")}
                          aria-label={t("actions.copy")}
                          style={{boxShadow: "none", background: "none"}}
                        >
                          {copiedIdx === i ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" className="fill-green-600">
                              <path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.5-1.5z" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" className="fill-slate-400">
                              <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                            </svg>
                          )}
                        </button>
                      )}
                      {!m.streaming && typeof m.id === 'number' && (
                        <>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!threadId || !m.id) return;
                              try {
                                await sendFeedback({ threadId, messageId: m.id, scoreText: 'helpful', commentText: '', source: 'user' });
                                setMessages((ms) => { const n = [...ms]; n[i] = { ...n[i], feedback: 'up' }; return n; });
                              } catch (e) {
                                // 反馈失败静默/可选提示
                                console.warn('feedback failed', e);
                              }
                            }}
                            className="mt-2 p-1 rounded hover:bg-slate-100 active:scale-95 transition"
                            title="Helpful"
                            aria-label="Helpful"
                            disabled={m.feedback === 'up' || m.feedback === 'down'}
                            style={{boxShadow: "none", background: "none", opacity: (m.feedback ? 0.6 : 1) }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" className={m.feedback === 'up' ? 'fill-teal-600' : 'fill-slate-400'}>
                              <path d="M2 21h4V9H2v12zM22 9h-8l1-5-5 6v11h9l3-10z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!threadId || !m.id) return;
                              try {
                                await sendFeedback({ threadId, messageId: m.id, scoreText: 'not-helpful', commentText: '', source: 'user' });
                                setMessages((ms) => { const n = [...ms]; n[i] = { ...n[i], feedback: 'down' }; return n; });
                              } catch (e) {
                                console.warn('feedback failed', e);
                              }
                            }}
                            className="mt-2 p-1 rounded hover:bg-slate-100 active:scale-95 transition"
                            title="Not helpful"
                            aria-label="Not helpful"
                            disabled={m.feedback === 'up' || m.feedback === 'down'}
                            style={{boxShadow: "none", background: "none", opacity: (m.feedback ? 0.6 : 1) }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" className={m.feedback === 'down' ? 'fill-pink-600' : 'fill-slate-400'}>
                              <path d="M2 3h4v12H2V3zm20 0h-9v11l5 6-1-5h5V3z" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex justify-end">
                  <div
                    className="bg-[#f7f7f8] text-slate-800 rounded-2xl px-5 py-3 max-w-full sm:max-w-[80%] text-[15px] leading-7 shadow border border-slate-100 whitespace-pre-wrap"
                    style={{ wordBreak: "break-word" }}
                  >
                    {m.text}
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* 不再显示独立“入力中…”，因为已用占位消息 + 伪流式 */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* 回到底部按钮 */}
      {showScrollDown && (
        <button
          type="button"
          onClick={() => { scrollToBottom("smooth"); setShowScrollDown(false); }}
          className="fixed right-5 z-40 rounded-full bg-white/95 shadow ring-1 ring-slate-200 hover:bg-white transition grid grid-cols-[auto,1fr] items-center gap-2 px-3 h-10"
          style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + 96px)` }}
          aria-label="Scroll to bottom"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" className="fill-slate-700">
            <path d="M12 16l-6-6h12z" />
          </svg>
          <span className="text-sm text-slate-700">{t("actions.scrollToBottom")}</span>
        </button>
      )}

      {/* 视口底部固定输入区（纯白、无边线、无模糊） */}
      <div ref={composerRef} className="fixed inset-x-0 bottom-0 z-40 bg-white" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 6px)" }}>
        <div className="mx-auto max-w-2xl px-4 sm:px-5 py-3">
          <div className="rounded-3xl bg-white shadow-[0_8px_28px_rgba(0,0,0,0.10)]">
            <form className="flex items-end gap-2 p-2" onSubmit={(e) => { e.preventDefault(); void send(); }}>

              {/* 文本域（自适应高度，最多5行） */}
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t("placeholder")}
                rows={1}
                className="min-h-[44px] max-h-[calc(5*24px+16px)] flex-1 resize-none bg-transparent px-2 py-3 outline-none placeholder:text-slate-400 leading-6"
                style={{ lineHeight: "24px" }}
              />

              {/* 右侧发送：主色、扩大点击区域 */}
              <button
                type="submit"
                disabled={loading || !input.trim() || (blockedUntil !== null && blockedUntil > Date.now())}
                className="shrink-0 h-11 w-11 rounded-full text-white shadow-md ring-1 ring-teal-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition grid place-items-center btn-primary"
                aria-label="Send"
                title={(blockedUntil && blockedUntil > Date.now()) ? `限流中，${blockedCountdown}s 后可再试` : t("actions.sendTitle")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" className="fill-current">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
          <p className="px-2 pt-2 pb-2 text-center text-[12px] leading-5 text-slate-500/90">
            {t("helperLine")}
            {(blockedUntil && blockedUntil > Date.now()) && (
              <span className="ml-2 text-pink-600">已达当日上限，{blockedCountdown}s 后可再试</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// generateMetadata moved to server layout.tsx in same route
