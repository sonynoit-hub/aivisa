"use client";
import { useEffect, useState } from "react";
import { initTracking } from "@/lib/track/client";

export type TrackingContext = { aid: string; deviceId: string; sessionId: string } | null;

export function useTracking(): TrackingContext {
  const [ctx, setCtx] = useState<TrackingContext>(null);
  useEffect(() => {
    let mounted = true;
    initTracking()
      .then(c => {
        if (mounted) setCtx(c);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  return ctx;
}
