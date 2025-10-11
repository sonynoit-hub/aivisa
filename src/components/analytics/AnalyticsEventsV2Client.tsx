"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logEventV2 } from "@/lib/api/services/analytics.v2";

// Helper to get numeric sessionId from existing analytics chain if available
function getV2SessionId(): number | string | null {
  // Prefer existing analytics session id if available
  const a: any = (window as any).__ANALYTICS_IDS__;
  // Our upstream may produce a numeric session id; fallback to string sessionId
  if (a?.sessionId) return a.sessionId;
  const sid = (window as any).__WEB_SESSION_ID__;
  return sid ?? null;
}

export default function AnalyticsEventsV2Client() {
  const pathname = usePathname() || "/";

  // 1) Page view on route change
  useEffect(() => {
    const sessionId = getV2SessionId();
    if (!sessionId) {
      const onReady = () => {
        const sid = getV2SessionId();
        if (!sid) return;
        logEventV2({ sessionId: sid, name: "page_view", category: "navigation", props: { path: pathname, title: document.title } }).catch(() => {});
      };
      window.addEventListener("analytics:ready", onReady, { once: true } as any);
      return () => window.removeEventListener("analytics:ready", onReady as any);
    }
    logEventV2({ sessionId, name: "page_view", category: "navigation", props: { path: pathname, title: document.title } }).catch(() => {});
  }, [pathname]);

  // 2) Clicks: category links, detail tabs, PDFs
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const now = new Date().toISOString();
      const sessionId = getV2SessionId();
      const send = (name: string, category?: string, label?: string, props?: Record<string, any>) => {
        const sid = sessionId ?? getV2SessionId();
        if (!sid) {
          const payload = { name, category, label, props, ts: now };
          const onReady = () => {
            const readySid = getV2SessionId();
            if (!readySid) return;
            logEventV2({ sessionId: readySid, ...payload }).catch(() => {});
          };
          window.addEventListener("analytics:ready", onReady, { once: true } as any);
          return;
        }
        logEventV2({ sessionId: sid, name, category, label, props, ts: now }).catch(() => {});
      };

      // PDF buttons
      const pdfBtn = t.closest('[data-analytics][data-analytics-name^="ExportPDF"], [data-analytics][data-analytics-name^="PrintPDF"]') as HTMLElement | null;
      if (pdfBtn) {
        const label = pdfBtn.getAttribute("data-analytics-name") || pdfBtn.textContent || "PDF";
        send("pdf", "interaction", String(label), { path: location.pathname });
        return;
      }

      // Detail tabs: role=tab inside [role=tablist]
      const tab = t.closest('[role="tab"]') as HTMLElement | null;
      const tabList = t.closest('[role="tablist"]');
      if (tab && tabList) {
        const label = tab.textContent?.trim() || tab.getAttribute("aria-label") || tab.id || "Tab";
        send("tab", "ui", `DetailTab:${label}`, { path: location.pathname });
        return;
      }

      // Category links: heuristic — site header category drawer links to /[locale]/visa/*
      const link = t.closest('a[href*="/visa/"]') as HTMLAnchorElement | null;
      if (link) {
        const href = link.getAttribute("href") || "";
        // avoid generic home/logo clicks
        if (/\/visa\//.test(href)) {
          const slug = href.split("/visa/")[1] || href;
          send("click", "category", slug, { href, path: location.pathname });
          return;
        }
      }
    }
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true } as any);
  }, []);

  return null;
}
