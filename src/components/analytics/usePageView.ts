"use client";
import { useEffect, useRef } from "react";
import { sendEvent } from "@/lib/api/services/analytics.service";

// 假定外部会提供当前 anonId/sessionId/deviceId/deviceTokenHash（如通过 context 或其他方式）
// 此处简化为读取 window 上的临时缓存，实际项目可替换为更安全的状态管理

type Ids = { anonId: string; sessionId: string; deviceId: string; deviceTokenHash: string };

export function cacheIds(ids: Ids) {
  (window as any).__ANALYTICS_IDS__ = ids;
  // 通知监听者：链路已就绪
  try { window.dispatchEvent(new CustomEvent("analytics:ready", { detail: ids } as any)); } catch {}
}

export function usePageView(route: string) {
  const sent = useRef<string>("");
  useEffect(() => {
    const key = `${route}`;
    if (sent.current === key) return;
    const trySend = () => {
      const ids: Ids | undefined = (window as any).__ANALYTICS_IDS__;
      if (!ids) return false;
      sent.current = key;
      sendEvent({
        type: "page_view",
        payload: { path: route, title: document.title },
        anonId: ids.anonId,
        sessionId: ids.sessionId,
        deviceId: ids.deviceId,
        deviceTokenHash: ids.deviceTokenHash,
        route,
        referrer: document.referrer || undefined,
        isBot: /bot|crawl|spider/i.test(navigator.userAgent)
      }).catch(() => {});
      return true;
    };
    // 立即尝试
    if (trySend()) return;
    // 未就绪则监听 ready 事件，触发一次补发
    const onReady = () => { trySend(); };
    window.addEventListener("analytics:ready", onReady, { once: true } as any);
    return () => window.removeEventListener("analytics:ready", onReady as any);
  }, [route]);
}
