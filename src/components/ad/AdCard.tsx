"use client";

import Link from "next/link";
import type { AdCardContent } from "@/types/ad";
import React from "react";
import { useLocale } from "@/hooks/useLocale";

export type AdCardProps = {
  ad: AdCardContent;
};

export default function AdCard({ ad }: AdCardProps) {
  const locale = useLocale();
  const bullets = (ad.bullets ?? []).filter(Boolean);
  const variant = (ad.badgeVariant || '').toLowerCase();
  const isCareer = variant === 'career';
  const badgeMap: Record<string, { badge: string; dot: string }> = {
    legal:  { badge: 'bg-indigo-100 text-indigo-800',  dot: 'bg-indigo-500' },
    life:   { badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
    career: { badge: 'bg-violet-100 text-violet-800',  dot: 'bg-violet-500' },
    pr:     { badge: 'bg-cyan-100 text-cyan-800',      dot: 'bg-cyan-500' },
  };
  const badgeStyle = badgeMap[variant]?.badge || 'bg-slate-100 text-slate-700';
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
    <article className="group rounded-2xl border border-slate-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md overflow-hidden">
      {/* Content Area */}
      <div className="p-5">
        {/* Title + Badge */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900 min-w-0 leading-snug" data-card-title>
            {ad.title}
          </h3>
          {ad.badgeText && (
            <span className="flex-none text-xs font-medium text-slate-700 whitespace-nowrap">
              {ad.badgeText}
            </span>
          )}
        </div>

        {/* Lead */}
        {ad.leadMd && (
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            {ad.leadMd}
          </p>
        )}

        {/* Bullets */}
        {bullets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {bullets.map((b, i) => (
              <span key={i} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 font-medium hover:bg-slate-200 transition-colors">
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-200"></div>

      {/* Footer: company + CTAs */}
      <div className={`px-5 py-3.5 flex items-center ${hasButtons ? 'justify-between' : 'justify-start'} gap-3 bg-slate-50/50`}>
        {/* 左侧：公司名 */}
        {ad.companyName ? (
          <div className="min-w-0 flex-1" title={ad.companyName}>
            <p className="text-sm font-medium text-slate-700 truncate">
              {ad.companyName}
            </p>
          </div>
        ) : <span className="flex-1" />}
        
        {/* 右侧：按钮区 */}
        {(showPrimary || showSecondary) && (
          <div className="flex gap-2 shrink-0">
            {showPrimary && (
              <Link
                href={primaryHref}
                className="h-9 inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-[#04c4b6] to-[#039991] px-3 text-sm font-medium text-white shadow-sm transition-all hover:from-[#03a898] hover:to-[#028074] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                {ad.primaryCtaLabel}
              </Link>
            )}
            {showSecondary && (
              <Link 
                href={secondaryHref} 
                className="h-9 inline-flex items-center justify-center rounded-lg bg-white border border-slate-300 px-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
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
