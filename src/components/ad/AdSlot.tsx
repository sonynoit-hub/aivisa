"use client";

import React, { useEffect, useState } from "react";
import AdCard from "./AdCard";
import type { AdPlacementQuery, AdPlacementResponse } from "@/types/ad";
import { getAdByPlacement } from "@/lib/api/services/ads.service";

export type AdSlotProps = Omit<AdPlacementQuery, "locale"> & { locale?: string };

export default function AdSlot({ page, slot, categorySlug, locale }: AdSlotProps) {
  const [data, setData] = useState<AdPlacementResponse>(null);
  const [loading, setLoading] = useState(true);
  const DEBUG_ADS = process.env.NEXT_PUBLIC_DEBUG_ADS === 'true';

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = { page, slot, categorySlug, locale: locale || "ja" } as const;
    if (DEBUG_ADS && typeof window !== 'undefined') console.debug('[ads] AdSlot:fetch', params);
    getAdByPlacement(params)
      .then((res) => { if (mounted) setData(res); if (DEBUG_ADS && typeof window !== 'undefined') console.debug('[ads] AdSlot:result', { has: !!res }); })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page, slot, categorySlug, locale, DEBUG_ADS]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft animate-pulse">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="mt-2 h-3 w-3/4 bg-slate-200 rounded" />
        <div className="mt-2 h-3 w-2/3 bg-slate-200 rounded" />
        <div className="mt-4 h-9 w-32 bg-slate-200 rounded" />
      </div>
    );
  }
  if (!data) return null;
  return <AdCard ad={data} />;
}
