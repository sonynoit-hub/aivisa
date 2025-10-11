"use client";
import { useEffect } from "react";
import { sendEvent } from "@/lib/api/services/analytics.service";

export default function ClickTrackerClient() {
  useEffect(() => {
    const queue: Array<{ type: string; name: string; route: string }> = [];
    let flushed = false;
    const tryFlush = () => {
      const ids: any = (window as any).__ANALYTICS_IDS__;
      if (!ids || queue.length === 0) return;
      const items = queue.splice(0, queue.length);
      items.forEach(({ type, name, route }) => {
        sendEvent({
          type: "click",
          payload: { name, type },
          anonId: ids.anonId,
          sessionId: ids.sessionId,
          deviceId: ids.deviceId,
          deviceTokenHash: ids.deviceTokenHash,
          route,
          referrer: document.referrer || undefined,
          isBot: /bot|crawl|spider/i.test(navigator.userAgent)
        }).catch(() => {});
      });
    };

    const onReady = () => {
      if (flushed) return;
      flushed = true;
      tryFlush();
    };

    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      let el = target.closest("[data-analytics]") as HTMLElement | null;
      let type = "click";
      let name: string | null = null;
      const route = window.location.pathname;

      if (!el) {
        // 回退：捕获 tablist 下的 role=tab
        const tab = target.closest('[role="tab"]') as HTMLElement | null;
        const list = target.closest('[role="tablist"]') as HTMLElement | null;
        if (tab && list) {
          el = tab;
          type = "click";
          const txt = tab.textContent?.trim() || tab.getAttribute('aria-label') || tab.id || 'Tab';
          name = `StageTab:${txt}`;
        }
      }

      if (!el) return;
      type = el.getAttribute("data-analytics") || type || "click";
      name = el.getAttribute("data-analytics-name") || name || el.textContent || el.tagName;
      const ids: any = (window as any).__ANALYTICS_IDS__;
      if (!ids) {
        // 未就绪则进入队列，等待 ready 后补发
        queue.push({ type, name: String(name), route });
        // 确保监听一次 ready 进行 flush
        window.addEventListener("analytics:ready", onReady, { once: true } as any);
        return;
      }
      sendEvent({
        type: "click",
        payload: { name, type },
        anonId: ids.anonId,
        sessionId: ids.sessionId,
        deviceId: ids.deviceId,
        deviceTokenHash: ids.deviceTokenHash,
        route,
        referrer: document.referrer || undefined,
        isBot: /bot|crawl|spider/i.test(navigator.userAgent)
      }).catch(() => {});
    }
    document.addEventListener("click", handler, { capture: true });
    return () => {
      document.removeEventListener("click", handler, { capture: true } as any);
      window.removeEventListener("analytics:ready", onReady as any);
    };
  }, []);
  return null;
}
