"use client";

import React, { useEffect, useState } from "react";
import AdCard from "./AdCard";
import type { AdPlacementQuery, AdListResponse } from "@/types/ad";
import { getAdsByPlacement } from "@/lib/api/services/ads.service";

export type AdSlotsProps = Omit<AdPlacementQuery, "locale"> & { locale?: string };

export default function AdSlots({ page, slot, categorySlug, locale, limit }: AdSlotsProps) {
  const [list, setList] = useState<AdListResponse>([]);
  const [loading, setLoading] = useState(true);
  const DEBUG_ADS = process.env.NEXT_PUBLIC_DEBUG_ADS === 'true';

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const defaultLimit = (typeof limit === 'number') ? limit : (page === 'top' && slot === 'top_card' ? 2 : undefined);
    const params: AdPlacementQuery = { page, slot, categorySlug, locale: locale || "ja" } as AdPlacementQuery;
    if (typeof defaultLimit === 'number') params.limit = defaultLimit;
    if (DEBUG_ADS && typeof window !== 'undefined') console.debug('[ads] AdSlots:fetch', params);
    getAdsByPlacement(params)
      .then((res) => {
        if (mounted) setList(res || []);
        if (DEBUG_ADS && typeof window !== 'undefined') console.debug('[ads] AdSlots:result', { count: res?.length ?? 0 });
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [page, slot, categorySlug, locale, limit, DEBUG_ADS]);

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        {Array.from({ length: typeof limit === 'number' ? limit : 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft animate-pulse">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="mt-2 h-3 w-3/4 bg-slate-200 rounded" />
            <div className="mt-2 h-3 w-2/3 bg-slate-200 rounded" />
            <div className="mt-4 h-9 w-32 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }
  if (!list || list.length === 0) return null;
  return (
    <div className="flex flex-col gap-5">
      {list.map((ad) => (
        <AdCard key={String(ad.id)} ad={ad} />
      ))}
    </div>
  );
}
