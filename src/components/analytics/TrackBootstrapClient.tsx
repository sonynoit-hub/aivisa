"use client";
import { useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";

export default function TrackBootstrapClient() {
  const ctx = useTracking();
  useEffect(() => {
    if (ctx) {
      // eslint-disable-next-line no-console
      console.debug("[track] session started", ctx);
    }
  }, [ctx]);
  return null;
}
