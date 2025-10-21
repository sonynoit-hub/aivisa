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
  const hasPrimary = !!ad.primaryCtaLabel;
  const hasSecondary = !!(ad.secondaryCtaLabel && ad.secondaryCtaUrl);
  const hasButtons = hasPrimary || hasSecondary;

  // 安全归一：
  const normalizeHref = (url?: string): string => {
    if (!url) return "#";
    const u = String(url);
    // 外链或协议相对
    if (/^https?:\/\//i.test(u) || /^\/\//.test(u)) return u;
    // 站内：确保前导斜杠存在
    return u.startsWith('/') ? u : `/${u}`;
  };

  // 详细按钮跳转（新版）：
  // 1) 若有 officeSlug => 公司详情页 /{locale}/companies/{officeSlug}
  // 2) 否则 => 使用 primaryCtaUrl（站内链接补前导斜杠）
  const primaryHref = ad.officeSlug
    ? `/${locale}/companies/${ad.officeSlug}`
    : normalizeHref(ad.primaryCtaUrl);
  const secondaryHref = normalizeHref(ad.secondaryCtaUrl);
  const showPrimary = hasPrimary && primaryHref !== '#';
  const showSecondary = hasSecondary && secondaryHref !== '#';
  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300/80 hover:-translate-y-1">
      {/* Title + Badge */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900 clamp-2 min-w-0 tracking-tight" data-card-title>
          {ad.title}
        </h3>
        {ad.badgeText && (
          <span className={`flex-none rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
            {ad.badgeText}
          </span>
        )}
      </div>

      {/* Lead */}
      {ad.leadMd && (
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600 font-light">
          {ad.leadMd}
        </p>
      )}

      {/* Bullets */}
      {bullets.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-slate-600">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className={`mt-[9px] h-[3px] w-[3px] flex-shrink-0 rounded-full ${dotStyle}`} />
              <span className="flex-1">{b}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Footer: company + CTAs */}
      <div className={`mt-4 pt-4 border-t border-slate-100 flex items-center ${hasButtons ? 'justify-between' : 'justify-start'} gap-3`}>
        {/* 左侧：公司名 */}
        {ad.companyName ? (
          <div className="min-w-0 flex-1" title={ad.companyName}>
            <p className="text-[15px] font-semibold text-slate-700 truncate tracking-tight">
              {ad.companyName}
            </p>
          </div>
        ) : <span className="flex-1" />}
        
        {/* 右侧：按钮区 */}
        {(showPrimary || showSecondary) && (
          <div className="flex gap-2.5 shrink-0">
            {showPrimary && (
              <Link
                href={primaryHref}
                className="h-11 inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-[#04c4b6] to-[#039991] px-4 text-white shadow-soft transition-all hover:from-[#03a898] hover:to-[#028074] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                {ad.primaryCtaLabel}
              </Link>
            )}
            {showSecondary && (
              <Link 
                href={secondaryHref} 
                className="h-11 inline-flex items-center justify-center rounded-lg bg-white border-2 border-slate-200 px-4 text-slate-700 shadow-soft transition-all hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                {ad.secondaryCtaLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
