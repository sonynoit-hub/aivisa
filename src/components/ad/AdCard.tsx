"use client";

import Link from "next/link";
import type { AdCardContent } from "@/types/ad";
import React from "react";
import { useLocale } from "@/hooks/useLocale";
import { EP } from "@/lib/api/endpoints";

export type AdCardProps = {
  ad: AdCardContent;
};

export default function AdCard({ ad }: AdCardProps) {
  const locale = useLocale();
  const bullets = (ad.bullets ?? []).filter(Boolean).slice(0, 4);
  const variant = (ad.badgeVariant || '').toLowerCase();
  const badgeMap: Record<string, { badge: string; dot: string }> = {
    legal:  { badge: 'bg-indigo-100 text-indigo-800',  dot: 'bg-indigo-500' },
    life:   { badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
    career: { badge: 'bg-violet-100 text-violet-800',  dot: 'bg-violet-500' },
    pr:     { badge: 'bg-cyan-100 text-cyan-800',      dot: 'bg-cyan-500' },
  };
  const badgeStyle = badgeMap[variant]?.badge || 'bg-slate-100 text-slate-700';
  const dotStyle = badgeMap[variant]?.dot || 'bg-teal-500';
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <h3 className="text-[17px] font-semibold text-slate-900">
          {ad.title}
        </h3>
        {ad.badgeText && (
          <span className={`rounded-full px-2 py-0.5 text-xs ${badgeStyle}`}>
            {ad.badgeText}
          </span>
        )}
      </div>
      {ad.leadMd && (
        <p className="mt-1 text-[14px] leading-6 text-slate-700 whitespace-pre-wrap">
          {ad.leadMd}
        </p>
      )}
      {bullets.length > 0 && (
        <ul className="mt-2 space-y-1 text-[13px] text-slate-700">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={`mt-1 h-1.5 w-1.5 rounded-full ${dotStyle}`} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex gap-2 justify-end">
        {ad.primaryCtaLabel && (
          <Link
            href={ad.officeSlug && ad.adSlug ? EP.company.officeAdPage(locale, ad.officeSlug, ad.adSlug) : (ad.primaryCtaUrl || "#")}
            className="h-10 inline-flex items-center rounded-lg bg-gradient-to-br from-[#04c4b6] to-[#039991] px-4 text-white shadow-lg hover:from-[#03a898] hover:to-[#028074] focus:outline-none focus:ring-2 focus:ring-teal-300 active:scale-[.99]"
          >
            {ad.primaryCtaLabel}
          </Link>
        )}
        {ad.secondaryCtaLabel && ad.secondaryCtaUrl && (
          <Link href={ad.secondaryCtaUrl} className="h-10 inline-flex items-center rounded-lg border px-4">
            {ad.secondaryCtaLabel}
          </Link>
        )}
      </div>
    </article>
  );
}
