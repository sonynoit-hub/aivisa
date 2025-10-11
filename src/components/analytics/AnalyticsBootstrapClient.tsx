"use client";
import { useEffect, useRef } from "react";
import { ensureAnon, getOrCreateDeviceToken, registerDevice, createWebSession, upsertAnalyticsSession, sendEvent, sha256Hex } from "@/lib/api/services/analytics.service";
import { useLocale } from "@/hooks/useLocale";
import { cacheIds } from "./usePageView";

function detectDeviceType(): "desktop" | "mobile" | "tablet" {
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|iphone|ipod|android/.test(ua)) return "mobile";
  if (/ipad|tablet/.test(ua)) return "tablet";
  return "desktop";
}

export default function AnalyticsBootstrapClient() {
  const booted = useRef(false);
  const locale = useLocale();

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    
    // Skip analytics in development if ANALYTICS_PROXY_BASE is not set
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ANALYTICS_ENABLED) {
      console.log("[analytics] Skipped in development mode");
      return;
    }

    (async () => {
      try {
        // 1) 确保匿名人（写 aid Cookie）
        const anon = await ensureAnon();
        const anonId = (anon as any)?.anonId || (anon as any)?.id || (anon as any)?.data?.anonId;
        if (!anonId) return; // 无法建立链路

        // 2) 设备 token 与哈希
        const deviceToken = await getOrCreateDeviceToken();
        const tokenHashLocal = await sha256Hex(deviceToken);

        // 3) 注册设备
        const deviceRes = await registerDevice(anonId, tokenHashLocal);
        const deviceId = (deviceRes.data as any)?.id || (deviceRes as any)?.id;
        if (!deviceId) return;

        // 4) 创建 Web 会话
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const ws = await createWebSession({ anonId, deviceId, locale, tz });
  const webSessionId = (ws.data as any)?.id || (ws as any)?.id;
  if (!webSessionId) return;
  try { (window as any).__WEB_SESSION_ID__ = webSessionId; } catch {}

        // 5) 上报画像
        const payload = {
          anonId,
          sessionId: webSessionId, // 先用 webSessionId 作为入参，后端将返回 analyticsSessionId
          deviceId,
          deviceTokenHash: tokenHashLocal,
          userAgent: navigator.userAgent,
          deviceType: detectDeviceType(),
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          screenDpr: window.devicePixelRatio || 1,
          lang: navigator.language,
          timezone: tz,
          geoCountry: undefined
        } as const;
  const aSessionRes = await upsertAnalyticsSession(payload);
  const analyticsSessionId = (aSessionRes.data as any)?.id || (aSessionRes as any)?.id;
  const sessionIdFinal = analyticsSessionId || webSessionId;
  cacheIds({ anonId, sessionId: sessionIdFinal, deviceId, deviceTokenHash: tokenHashLocal });

        // 6) 首次 page_view
        await sendEvent({
          type: "page_view",
          payload: { path: window.location.pathname, title: document.title },
          anonId,
          sessionId: sessionIdFinal,
          deviceId,
          deviceTokenHash: tokenHashLocal,
          route: window.location.pathname,
          referrer: document.referrer || undefined,
          isBot: /bot|crawl|spider/i.test(navigator.userAgent)
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[analytics] bootstrap failed", e);
      }
    })();
  }, [locale]);

  return null;
}
