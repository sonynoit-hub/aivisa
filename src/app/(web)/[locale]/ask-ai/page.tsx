"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { useSearchParams } from "next/navigation";
import { streamChat } from "@/lib/api/services/chat.service";
import Markdown from "@/components/common/Markdown";
import { useTranslations } from "next-intl";
 

type Msg = { role: "user" | "ai"; text: string; streaming?: boolean };

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
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const sendingRef = useRef(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const searchParams = useSearchParams();
  // 打字机“... ”动画：1~3个点循环
  const [typingTick, setTypingTick] = useState(0);
  const typingTimerRef = useRef<number | null>(null);

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

  // 读取本地保存的会话ID
  useEffect(() => {
    try {
      const cid = window.localStorage.getItem("vp_conversation_id") || undefined;
      if (cid) setConversationId(cid);
    } catch {}
  }, []);

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
    sendingRef.current = true;
  setMessages((m) => [...m, { role: "user", text, streaming: false }]);
    setInput("");
    const nbNow = isNearBottomNow();
    if (nbNow) {
      requestAnimationFrame(() => scrollToBottom("smooth"));
    } else {
      setShowScrollDown(true);
    }
    setLoading(true);
  // 不使用伪流式，直接等待完整答案，避免排版错乱
    try {
      // 使用真正的 SSE 流式
      // 先插入空的 AI 消息作为占位
  setMessages((m) => [...m, { role: "ai", text: "", streaming: true }]);
      const nbStart = isNearBottomNow();
      await streamChat(text, {
        conversationId,
  onMessage: (data: unknown) => {
          // 后端 message 事件发送的是 ChatResponse 或字符串
          let patch = "";
          let cid: string | undefined;
          if (data && typeof data === "object") {
            const obj = data as Record<string, unknown>;
            if (typeof obj.reply === "string") patch = obj.reply;
            if (typeof obj.conversationId === "string") cid = obj.conversationId;
          } else if (typeof data === "string") {
            patch = data;
          }
          if (cid) {
            setConversationId(cid);
            try { window.localStorage.setItem("vp_conversation_id", cid); } catch {}
          }
          const doAppend = (slice: string) => {
            setMessages((m) => {
              if (m.length === 0) return m;
              const n = [...m];
              for (let k = n.length - 1; k >= 0; k--) {
                if (n[k].role === "ai") {
                  // 仅追加文本，不改变 streaming 状态（避免 onDone 后被重新置为 true）
                  n[k] = { ...n[k], text: String(n[k].text || "") + slice };
                  break;
                }
              }
              return n;
            });
            if (nbStart) requestAnimationFrame(() => scrollToBottom("smooth"));
          };
          if (patch && patch.length > 0) {
            // 若后端一次性返回整段文本，这里做增量揭示
            const total = patch.length;
            let i = 0;
            const baseChunk = total > 3000 ? 40 : total > 1500 ? 28 : total > 600 ? 18 : 12;
            const baseDelay = total > 3000 ? 10 : total > 1500 ? 12 : total > 600 ? 14 : 16;
            const nextBreak = (s: string, start: number) => {
              const rest = s.slice(start);
              const punct = rest.search(/[\n\r]{2,}|[。！？.!?]\s/);
              if (punct >= 0 && punct < baseChunk * 2) return start + punct + 1;
              return Math.min(start + baseChunk, s.length);
            };
            (async () => {
              while (i < total) {
                const j = nextBreak(patch, i);
                const slice = patch.slice(i, j);
                i = j;
                doAppend(slice);
                await new Promise((r) => setTimeout(r, baseDelay));
              }
              // 若后端未明确发送 done，主动将当前条目标记为完成
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
              if (!isNearBottomNow()) setShowScrollDown(true);
            })();
          }
        },
  onError: (msg: string) => {
          // 结束当前流并附加错误提示
          setMessages((m) => {
            if (m.length === 0) return [{ role: "ai", text: `⚠️ ${/BACKEND_UNREACHABLE|fetch failed|NetworkError/i.test(msg) ? te('serverBusy') : te('generic')}` , streaming: false }];
            const n = [...m];
            for (let k = n.length - 1; k >= 0; k--) {
              if (n[k].role === "ai" && n[k].streaming) {
                const hint = /BACKEND_UNREACHABLE|fetch failed|NetworkError/i.test(msg) ? te('serverBusy') : te('generic');
                n[k] = { ...n[k], text: `${n[k].text}\n⚠️ ${hint}`.trim(), streaming: false };
                return n;
              }
            }
            const hint = /BACKEND_UNREACHABLE|fetch failed|NetworkError/i.test(msg) ? te('serverBusy') : te('generic');
            n.push({ role: "ai", text: `⚠️ ${hint}`, streaming: false });
            return n;
          });
        },
        onDone: () => {
          // 将最后一个 AI 消息标记为完成
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
          if (!isNearBottomNow()) setShowScrollDown(true);
        },
      });
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
      setInput(q);
      setTimeout(() => { void sendWith(q); }, 0);
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
                      <div className="inline-flex items-baseline text-slate-500 text-sm select-none">
                        <span className="ml-1 font-mono">{".".repeat(typingTick + 1)}</span>
                        <span className="ml-1 inline-block h-[1em] w-[0.6ch] bg-slate-500/70 animate-pulse align-baseline" />
                      </div>
                    )}
                    <div className="flex items-end">
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex justify-end">
                  <div
                    className="bg-[#f7f7f8] text-slate-800 rounded-2xl px-5 py-3 max-w-full sm:max-w-[80%] text-[15px] leading-7 shadow border border-slate-100"
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
                disabled={loading || !input.trim()}
                className="shrink-0 h-11 w-11 rounded-full text-white shadow-md ring-1 ring-teal-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition grid place-items-center btn-primary"
                aria-label="Send"
                title={t("actions.sendTitle")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" className="fill-current">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
          <p className="px-2 pt-2 pb-2 text-center text-[12px] leading-5 text-slate-500/90">{t("helperLine")}</p>
        </div>
      </div>
    </div>
  );
}

// generateMetadata moved to server layout.tsx in same route
