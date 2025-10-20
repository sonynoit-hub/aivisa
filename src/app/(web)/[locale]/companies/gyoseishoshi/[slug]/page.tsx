import { getOfficeDetail } from "@/lib/api/services/company.service";
import type { OfficeDetail } from "@/types/company";
import Link from "next/link";
import Markdown from "@/components/common/Markdown";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const office: OfficeDetail = await getOfficeDetail(slug, locale);
  const title = office.seoTitle || `${office.name} | aivisa`;
  const description = office.seoDesc || office.shortDesc || undefined;
  const openGraph = office.ogImageUrl ? { images: [{ url: office.ogImageUrl }] } : undefined;
  return { title, description, openGraph };
}

function Badge({ text, variant }: { text?: string; variant?: string }) {
  const v = (variant || '').toLowerCase();
  const map: Record<string, string> = {
    legal: "bg-indigo-100 text-indigo-800",
    life: "bg-emerald-100 text-emerald-800",
    career: "bg-violet-100 text-violet-800",
    pr: "bg-cyan-100 text-cyan-800",
  };
  const cls = map[v] || "bg-slate-100 text-slate-700";
  if (!text) return null;
  return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{text}</span>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-slate-700">{children}</span>;
}

export default async function OfficeDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const office: OfficeDetail = await getOfficeDetail(slug, locale);

  const addressText = typeof office.address === 'string'
    ? office.address
    : office.address
    ? [
        office.address.zip,
        office.address.pref,
        office.address.city,
        office.address.line1,
        office.address.line2,
        office.address.country,
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{office.name}</h1>
                <Badge text={office.badgeText} variant={office.badgeVariant} />
              </div>
              {office.shortDesc && (
                <p className="text-teal-50 text-lg leading-relaxed max-w-2xl">{office.shortDesc}</p>
              )}
            </div>
            <div className="flex gap-2 sm:flex-col sm:items-end">
              {office.websiteUrl && (
                <a
                  href={office.websiteUrl}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-teal-600 font-medium shadow-lg hover:bg-teal-50 transition-colors"
                  target="_blank" rel="noreferrer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  公式サイト
                </a>
              )}
              <Link 
                href={`/${locale}/questionnaire/contact`} 
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white px-5 py-2.5 text-white font-medium hover:bg-white/10 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                お問い合わせ
              </Link>
            </div>
          </div>

          {(office.languages?.length || office.services?.length) ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {office.languages?.map((lng) => (
                <span key={`lang-${lng}`} className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-sm text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" className="fill-current">
                    <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                  </svg>
                  {lng.toUpperCase?.() || lng}
                </span>
              ))}
              {office.services?.map((s) => (
                <span key={`svc-${s}`} className="inline-flex items-center rounded-full bg-white/20 backdrop-blur px-3 py-1 text-sm text-white">
                  {s}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Description */}
          <div className="lg:col-span-2">
            {/* Cards from partner_office_i18n.cards_json */}
            {office.cards && office.cards.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {office.cards.map((c, idx) => {
                    const title = (c as any).title || (c as any).name || (c as any).heading || (c as any).label;
                    const desc = (c as any).desc || (c as any).description || (c as any).text || (c as any).content;
                    const href = (c as any).url || (c as any).href || (c as any).ctaUrl;
                    const emoji = (c as any).emoji;
                    const defaultCta = locale.startsWith('ja') ? '詳しく見る' : (locale.startsWith('zh') ? '查看详情' : 'Learn more');
                    const ctaLabel = (c as any).ctaLabel || defaultCta;
                    const bullets = Array.isArray((c as any).bullets) ? (c as any).bullets.filter(Boolean).slice(0, 4) : [];
                    return (
                      <div key={idx} className="rounded-xl border border-slate-200 p-4">
                        {(title || emoji) && (
                          <div className="text-[15px] font-semibold text-slate-900 mb-1 flex items-center gap-2">
                            {emoji ? <span className="text-lg leading-none">{String(emoji)}</span> : null}
                            {title ? <span className="clamp-2">{String(title)}</span> : null}
                          </div>
                        )}
                        {desc && <p className="text-slate-700 text-sm clamp-2">{String(desc)}</p>}
                        {bullets.length > 0 && (
                          <ul className="mt-2 space-y-1 text-[13px] text-slate-700">
                            {bullets.map((b: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {href && (
                          <div className="mt-3">
                            <a href={String(href)} className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm hover:border-teal-300 hover:text-teal-700">
                              {String(ctaLabel)}
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {office.descriptionMd && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" className="fill-teal-600">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                  事務所について
                </h2>
                <div className="prose prose-slate max-w-none">
                  <Markdown>{office.descriptionMd}</Markdown>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" className="fill-teal-600">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  連絡先
                </h3>
                <div className="space-y-3 text-sm">
                  {office.phone && (
                    <div className="flex items-start gap-3 group">
                      <svg width="18" height="18" viewBox="0 0 24 24" className="fill-slate-400 group-hover:fill-teal-600 transition-colors mt-0.5 flex-shrink-0">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                      <a href={`tel:${office.phone}`} className="text-slate-700 hover:text-teal-600 transition-colors">{office.phone}</a>
                    </div>
                  )}
                  {office.email && (
                    <div className="flex items-start gap-3 group">
                      <svg width="18" height="18" viewBox="0 0 24 24" className="fill-slate-400 group-hover:fill-teal-600 transition-colors mt-0.5 flex-shrink-0">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      <a href={`mailto:${office.email}`} className="text-slate-700 hover:text-teal-600 transition-colors break-all">{office.email}</a>
                    </div>
                  )}
                  {addressText && (
                    <div className="flex items-start gap-3">
                      <svg width="18" height="18" viewBox="0 0 24 24" className="fill-slate-400 mt-0.5 flex-shrink-0">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span className="text-slate-700">{addressText}</span>
                    </div>
                  )}
                  {office.websiteUrl && (
                    <div className="flex items-start gap-3 group">
                      <svg width="18" height="18" viewBox="0 0 24 24" className="fill-slate-400 group-hover:fill-teal-600 transition-colors mt-0.5 flex-shrink-0">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      <a href={office.websiteUrl} target="_blank" rel="noreferrer" className="text-slate-700 hover:text-teal-600 transition-colors break-all">{office.websiteUrl}</a>
                    </div>
                  )}
                </div>
              </div>
              {/* SNS Card (separate) */}
              {office.sns && Object.keys(office.sns).length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">SNS</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(office.sns).map(([k, url]) => {
                      const key = k.toLowerCase();
                      const icon = (function() {
                        if (key === 'x' || key === 'twitter') return (
                          <svg viewBox="0 0 24 24" width="18" height="18" className="fill-current"><path d="M18.244 2H21l-6.49 7.41L22 22h-6.78l-4.77-6.22L4.74 22H2l7-8.01L2 2h6.78l4.5 5.86L18.244 2Zm-1.187 18h1.902L7.03 4H5.03l12.027 16Z"/></svg>
                        );
                        if (key === 'line') return (
                          <svg viewBox="0 0 24 24" width="18" height="18" className="fill-current"><path d="M20.5 11.2c0-4-4.03-7.2-9-7.2s-9 3.2-9 7.2c0 3 2.45 5.6 5.93 6.65-.27.94-.98 3.37-1.12 3.9-.18.73.27.72.57.52.23-.15 3.63-2.47 5.11-3.48.46.05.93.08 1.41.08 4.97 0 9-3.2 9-7.2Z"/></svg>
                        );
                        if (key === 'facebook') return (
                          <svg viewBox="0 0 24 24" width="18" height="18" className="fill-current"><path d="M22 12.06C22 6.49 17.52 2 11.94 2 6.37 2 1.88 6.49 1.88 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.42v-2.2c0-2.4 1.43-3.72 3.61-3.72 1.05 0 2.15.19 2.15.19v2.37h-1.21c-1.2 0-1.58.75-1.58 1.52v1.84h2.7l-.43 2.9h-2.27V22c4.79-.76 8.45-4.92 8.45-9.94Z"/></svg>
                        );
                        if (key === 'instagram') return (
                          <svg viewBox="0 0 24 24" width="18" height="18" className="fill-current"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7Zm6.5-.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"/></svg>
                        );
                        if (key === 'youtube') return (
                          <svg viewBox="0 0 24 24" width="18" height="18" className="fill-current"><path d="M23 12s0-3.53-.45-5.2a3.56 3.56 0 0 0-2.5-2.5C18.38 3.86 12 3.86 12 3.86s-6.38 0-8.05.44a3.56 3.56 0 0 0-2.5 2.5C1 8.47 1 12 1 12s0 3.53.45 5.2a3.56 3.56 0 0 0 2.5 2.5c1.67.44 8.05.44 8.05.44s6.38 0 8.05-.44a3.56 3.56 0 0 0 2.5-2.5C23 15.53 23 12 23 12ZM10 15.5V8.5l6 3.5-6 3.5Z"/></svg>
                        );
                        if (key === 'linkedin') return (
                          <svg viewBox="0 0 24 24" width="18" height="18" className="fill-current"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11.1 22 14.26V21H18v-6.05c0-1.44-.03-3.3-2-3.3-2 0-2.3 1.56-2.3 3.17V21H10V9Z"/></svg>
                        );
                        if (key === 'wechat' || key === 'weixin') return (
                          <svg viewBox="0 0 24 24" width="18" height="18" className="fill-current"><path d="M9.5 4C5.91 4 3 6.24 3 9c0 1.36.69 2.6 1.81 3.54L4 15l2.72-1.09c.85.28 1.78.43 2.78.43 3.59 0 6.5-2.24 6.5-5S13.09 4 9.5 4Zm-2 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm4 0a1 1 0 1 1-.001 2.001A1 1 0 0 1 11.5 7ZM14.5 10c3.04 0 5.5 1.96 5.5 4.38 0 1.06-.57 2.03-1.49 2.77L20 19l-2.19-.88c-.68.23-1.42.35-2.19.35-3.04 0-5.5-1.96-5.5-4.38S11.46 10 14.5 10Zm-1.25 2a.88.88 0 1 0 0 1.75.88.88 0 0 0 0-1.75Zm2.5 0a.88.88 0 1 0 0 1.75.88.88 0 0 0 0-1.75Z"/></svg>
                        );
                        return null;
                      })();
                      if (!icon) return null;
                      return (
                        <a
                          key={k}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all"
                          title={key.toUpperCase()}
                        >
                          {icon}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
