"use client";
import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics/init";

export default function AnalyticsInitClient() {
  useEffect(() => {
    let mounted = true;
    initAnalytics()
      .then(ctx => {
        if (!mounted) return;
        // eslint-disable-next-line no-console
        console.debug("[analytics] ready", ctx);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.warn("[analytics] init failed", err);
      });
    return () => {
      mounted = false;
    };
  }, []);
  return null;
}
