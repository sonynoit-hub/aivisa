"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logEvent } from "@/lib/analytics/events";
import { isAnalyticsDebug } from "@/lib/analytics/debug";

export default function AnalyticsEventsClient() {
  const pathname = usePathname() || "/";

  // page_view on route change
  useEffect(() => {
    const send = () => logEvent("page_view", { path: pathname, title: document.title }, { category: "navigation" });
    const getSid = () => (window as any).__ANALYTICS_SESSION_ID__ || (window as any).__WEB_SESSION_ID__ || (window as any).__ANALYTICS_IDS__?.sessionId;
    if (!getSid()) {
      if (isAnalyticsDebug()) console.warn('[analytics] page_view delayed: sessionId not ready');
      let done = false;
      const onReady = () => { if (!done) { done = true; send(); cleanup(); } };
      const poll = setInterval(() => {
        if (getSid()) { if (!done) { done = true; send(); cleanup(); } }
      }, 500);
      const timeout = setTimeout(() => {
        if (!done) {
          done = true;
          if (isAnalyticsDebug()) console.warn('[analytics] page_view skipped: sessionId timeout');
          cleanup();
        }
      }, 15000);
      const cleanup = () => {
        try { window.removeEventListener("analytics:ready", onReady as any); } catch {}
        try { clearInterval(poll); } catch {}
        try { clearTimeout(timeout); } catch {}
      };
      window.addEventListener("analytics:ready", onReady, { once: true } as any);
      return () => cleanup();
    }
    send();
  }, [pathname]);

  // click capture for category links, tabs, PDF
  useEffect(() => {
    function handler(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const getSid = () => (window as any).__ANALYTICS_SESSION_ID__ || (window as any).__WEB_SESSION_ID__ || (window as any).__ANALYTICS_IDS__?.sessionId;
      const sendOrDefer = (eventType: string, payload: Record<string, any>, extra?: { category?: string; label?: string; value?: number }) => {
        if (getSid()) {
          logEvent(eventType, payload, extra);
          return;
        }
        // Defer until analytics ready (single-shot) to avoid dropping early clicks
  let done = false;
  // eslint-disable-next-line prefer-const
  let poll: any;
        const onReady = () => {
          if (done) return;
          done = true;
          try { clearInterval(poll); } catch {}
          try { window.removeEventListener("analytics:ready", onReady as any); } catch {}
          logEvent(eventType, payload, extra);
        };
        window.addEventListener("analytics:ready", onReady as any);
        // Fallback: short poll
        poll = setInterval(() => {
          if (!done && getSid()) {
            done = true;
            try { clearInterval(poll); } catch {}
            try { window.removeEventListener("analytics:ready", onReady as any); } catch {}
            logEvent(eventType, payload, extra);
          }
        }, 500);
        setTimeout(() => { try { clearInterval(poll); } catch {} }, 15000);
      };
  // PDF buttons labelled by data-analytics-name; skip ones marked as direct (handled in-component)
  // Accept any name containing "PDF" to cover localized labels (e.g., just "PDF")
  const pdfBtn = t.closest('[data-analytics][data-analytics-name*="PDF"]:not([data-analytics-direct])') as HTMLElement | null;
      if (pdfBtn) {
        const label = pdfBtn.getAttribute("data-analytics-name") || pdfBtn.textContent || "PDF";
        sendOrDefer("pdf", { path: location.pathname }, { category: "interaction", label: String(label) });
        return;
      }
      // detail tab
      const tab = t.closest('[role="tab"]') as HTMLElement | null;
      const tabList = t.closest('[role="tablist"]');
      if (tab && tabList) {
        const label = tab.textContent?.trim() || tab.getAttribute("aria-label") || tab.id || "Tab";
        sendOrDefer("tab", { path: location.pathname }, { category: "ui", label: `DetailTab:${label}` });
        return;
      }
      // category link under /visa/
      const link = t.closest('a[href*="/visa/"]') as HTMLAnchorElement | null;
      if (link) {
        const href = link.getAttribute("href") || "";
        if (/\/visa\//.test(href)) {
          const slug = href.split("/visa/")[1] || href;
          sendOrDefer("click", { href, path: location.pathname }, { category: "category", label: slug });
        }
      }
    }
    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true } as any);
  }, []);

  return null;
}
