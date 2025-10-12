import { getCompanyAdContext } from "@/lib/api/services/companyAd.service";
import type { CompanyAdContext } from "@/types/ad";
import Markdown from "@/components/common/Markdown";

export const dynamic = "force-dynamic";

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

export default async function CompanyAdPage({ params }: { params: Promise<{ locale: string; officeSlug: string; adSlug: string }> }) {
  const { locale, officeSlug, adSlug } = await params;
  const ctx: CompanyAdContext = await getCompanyAdContext(officeSlug, adSlug, locale);
  const { company, ad } = ctx;

  const title = (company as any).displayName || company.name || company.slug;
  const addr = company.address as any;
  const addressText = typeof addr === 'string'
    ? addr
    : addr && (addr.pref || addr.city || addr.zip || addr.line1 || addr.line2 || addr.country)
      ? [addr.zip, addr.pref, addr.city, addr.line1, addr.line2, addr.country].filter(Boolean).join(' ')
      : undefined;
  const topServices = Array.isArray(company.services) ? company.services.slice(0, 4) : [];
  const topLanguages = Array.isArray(company.languages) ? company.languages.slice(0, 4) : [];
  const adBullets = (ad?.bullets || []).filter(Boolean).slice(0, 5);
  // 描述标题多语言映射（按主语言代码）
  const primaryLang = (locale || '').toLowerCase().split(/[-_]/)[0];
  const descTitleMap: Record<string, string> = {
    zh: '描述',
    ja: '説明',
    en: 'Description',
    ko: '설명',
    vi: 'Mô tả',
    th: 'คำอธิบาย',
    id: 'Deskripsi',
    fr: 'Description',
    de: 'Beschreibung',
    es: 'Descripción',
    ru: 'Описание',
    ar: 'الوصف',
    hi: 'विवरण',
    pt: 'Descrição',
    tr: 'Açıklama',
  };
  const descTitle = descTitleMap[primaryLang] || 'Description';

  // 彩色标签样式：依据字符串做简单哈希映射到配色
  const tagPalette = [
    { bg: 'bg-teal-100', text: 'text-teal-800', ring: 'ring-teal-200' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', ring: 'ring-indigo-200' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-200' },
    { bg: 'bg-violet-100', text: 'text-violet-800', ring: 'ring-violet-200' },
    { bg: 'bg-amber-100', text: 'text-amber-900', ring: 'ring-amber-200' },
    { bg: 'bg-sky-100', text: 'text-sky-800', ring: 'ring-sky-200' },
    { bg: 'bg-rose-100', text: 'text-rose-800', ring: 'ring-rose-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-800', ring: 'ring-cyan-200' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', ring: 'ring-fuchsia-200' },
    { bg: 'bg-lime-100', text: 'text-lime-800', ring: 'ring-lime-200' },
  ];
  const colorFor = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return tagPalette[h % tagPalette.length];
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h1>
                {ad?.badgeText && <Badge text={ad.badgeText} variant={ad.badgeVariant} />}
              </div>
              {company.shortDesc && (
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">{company.shortDesc}</p>
              )}
              {(topServices.length || topLanguages.length) ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {topLanguages.map((lng) => {
                    const c = colorFor(lng || 'lang');
                    return (
                      <span key={`lang-${lng}`} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${c.bg} ${c.text} ring-1 ${c.ring}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" className="fill-current">
                          <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                        </svg>
                        {lng.toUpperCase?.() || lng}
                      </span>
                    );
                  })}
                  {topServices.map((s) => {
                    const c = colorFor(s || 'svc');
                    return (
                      <span key={`svc-${s}`} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${c.bg} ${c.text} ring-1 ${c.ring}`}>
                        {s}
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </div>
            {/* Header Right: 预留位（去除官网按钮） */}
            <div className="flex items-start gap-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ad Section */}
            {(ad?.title || ad?.leadMd || adBullets.length > 0) && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] sm:text-lg font-bold text-slate-900">{ad?.title || '広告の内容'}</h3>
                </div>
                {ad?.leadMd && (
                  <p className="text-slate-700 whitespace-pre-wrap mt-2">{ad.leadMd}</p>
                )}
                {adBullets.length > 0 && (
                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {adBullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-800">
                        <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.15)]" />
                        <span className="leading-6">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Company Description */}
            {company.descriptionMd && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <h3 className="text-[18px] sm:text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">{descTitle}</h3>
                <div className="prose prose-slate max-w-none">
                  <Markdown>{company.descriptionMd}</Markdown>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h4 className="font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-200">
                  お問い合わせ
                </h4>
                <div className="space-y-4 text-sm">
                  {company.phone && (
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" className="fill-teal-600 mt-0.5 flex-shrink-0">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 mb-1">電話</div>
                        <a href={`tel:${company.phone}`} className="text-slate-900 hover:text-teal-600 font-medium transition-colors">
                          {company.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" className="fill-teal-600 mt-0.5 flex-shrink-0">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 mb-1">メール</div>
                        <a href={`mailto:${company.email}`} className="text-slate-900 hover:text-teal-600 font-medium transition-colors break-all">
                          {company.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {addressText && (
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" className="fill-teal-600 mt-0.5 flex-shrink-0">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <div className="flex-1">
                        <div className="text-xs text-slate-500 mb-1">住所</div>
                        <span className="text-slate-700 leading-relaxed">{addressText}</span>
                      </div>
                    </div>
                  )}
                  {company.websiteUrl && (
                    <div className="flex items-start gap-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" className="fill-teal-600 mt-0.5 flex-shrink-0">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                      <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="text-slate-900 hover:text-teal-600 font-medium transition-colors break-all">
                        {company.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* SNS Card (separate) */}
              {company.sns && Object.keys(company.sns).length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h5 className="text-sm font-semibold text-slate-900 mb-3">SNS</h5>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(company.sns).map(([k, url]) => {
                      const key = k.toLowerCase();
                      const style = (function() {
                        if (key === 'x' || key === 'twitter') return { cls: 'bg-black hover:bg-neutral-800', gradient: false };
                        if (key === 'line') return { cls: 'bg-[#06C755] hover:brightness-95', gradient: false };
                        if (key === 'facebook') return { cls: 'bg-[#1877F2] hover:brightness-95', gradient: false };
                        if (key === 'instagram') return { cls: 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 hover:opacity-90', gradient: true };
                        if (key === 'youtube') return { cls: 'bg-[#FF0000] hover:brightness-95', gradient: false };
                        if (key === 'linkedin') return { cls: 'bg-[#0A66C2] hover:brightness-95', gradient: false };
                        if (key === 'wechat' || key === 'weixin') return { cls: 'bg-[#07C160] hover:brightness-95', gradient: false };
                        return { cls: 'bg-slate-800 hover:bg-slate-700', gradient: false };
                      })();
                      return (
                        <a
                          key={k}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-lg shadow-sm text-white transition-all ${style.cls}`}
                          title={key.toUpperCase()}
                        >
                          {(function() {
                            if (key === 'x' || key === 'twitter') return (
                              <svg viewBox="0 0 24 24" width="18" height="18" className="fill-white"><path d="M18.244 2H21l-6.49 7.41L22 22h-6.78l-4.77-6.22L4.74 22H2l7-8.01L2 2h6.78l4.5 5.86L18.244 2Zm-1.187 18h1.902L7.03 4H5.03l12.027 16Z"/></svg>
                            );
                            if (key === 'line') return (
                              <svg viewBox="0 0 24 24" width="18" height="18" className="fill-white"><path d="M20.5 11.2c0-4-4.03-7.2-9-7.2s-9 3.2-9 7.2c0 3 2.45 5.6 5.93 6.65-.27.94-.98 3.37-1.12 3.9-.18.73.27.72.57.52.23-.15 3.63-2.47 5.11-3.48.46.05.93.08 1.41.08 4.97 0 9-3.2 9-7.2Z"/></svg>
                            );
                            if (key === 'facebook') return (
                              <svg viewBox="0 0 24 24" width="18" height="18" className="fill-white"><path d="M22 12.06C22 6.49 17.52 2 11.94 2 6.37 2 1.88 6.49 1.88 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.42v-2.2c0-2.4 1.43-3.72 3.61-3.72 1.05 0 2.15.19 2.15.19v2.37h-1.21c-1.2 0-1.58.75-1.58 1.52v1.84h2.7l-.43 2.9h-2.27V22c4.79-.76 8.45-4.92 8.45-9.94Z"/></svg>
                            );
                            if (key === 'instagram') return (
                              <svg viewBox="0 0 24 24" width="18" height="18" className="fill-white"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7Zm6.5-.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"/></svg>
                            );
                            if (key === 'youtube') return (
                              <svg viewBox="0 0 24 24" width="18" height="18" className="fill-white"><path d="M23 12s0-3.53-.45-5.2a3.56 3.56 0 0 0-2.5-2.5C18.38 3.86 12 3.86 12 3.86s-6.38 0-8.05.44a3.56 3.56 0 0 0-2.5 2.5C1 8.47 1 12 1 12s0 3.53.45 5.2a3.56 3.56 0 0 0 2.5 2.5c1.67.44 8.05.44 8.05.44s6.38 0 8.05-.44a3.56 3.56 0 0 0 2.5-2.5C23 15.53 23 12 23 12ZM10 15.5V8.5l6 3.5-6 3.5Z"/></svg>
                            );
                            if (key === 'linkedin') return (
                              <svg viewBox="0 0 24 24" width="18" height="18" className="fill-white"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11.1 22 14.26V21H18v-6.05c0-1.44-.03-3.3-2-3.3-2 0-2.3 1.56-2.3 3.17V21H10V9Z"/></svg>
                            );
                            if (key === 'wechat' || key === 'weixin') return (
                              <svg viewBox="0 0 24 24" width="18" height="18" className="fill-white"><path d="M9.5 4C5.91 4 3 6.24 3 9c0 1.36.69 2.6 1.81 3.54L4 15l2.72-1.09c.85.28 1.78.43 2.78.43 3.59 0 6.5-2.24 6.5-5S13.09 4 9.5 4Zm-2 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm4 0a1 1 0 1 1-.001 2.001A1 1 0 0 1 11.5 7ZM14.5 10c3.04 0 5.5 1.96 5.5 4.38 0 1.06-.57 2.03-1.49 2.77L20 19l-2.19-.88c-.68.23-1.42.35-2.19.35-3.04 0-5.5-1.96-5.5-4.38S11.46 10 14.5 10Zm-1.25 2a.88.88 0 1 0 0 1.75.88.88 0 0 0 0-1.75Zm2.5 0a.88.88 0 1 0 0 1.75.88.88 0 0 0 0-1.75Z"/></svg>
                            );
                            return null;
                          })()}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
