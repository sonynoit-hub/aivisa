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
      ? [addr.pref, addr.city, addr.line1, addr.line2, addr.zip, addr.country].filter(Boolean).join(' ')
      : undefined;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Company Header */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {company.shortDesc && (
            <p className="mt-1 text-[15px] leading-7 text-slate-700">{company.shortDesc}</p>
          )}
        </div>
        <Badge text={ad.badgeText} variant={ad.badgeVariant} />
      </header>

      {/* Ad Hero Section */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4">
          {ad.imageUrl && (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <img src={ad.imageUrl} alt={ad.title || ''} className="block w-full h-auto object-cover" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{ad.title}</h2>
            {ad.leadMd && (
              <div className="mt-2 text-[14px] leading-6 text-slate-700">
                <Markdown>{ad.leadMd}</Markdown>
              </div>
            )}
            {ad.bullets?.length ? (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-[13px] text-slate-700">
                {ad.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" className="mt-[2px] fill-teal-600"><path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.5-1.5z"/></svg>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

      {/* Main + Sidebar */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          {company.descriptionMd ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="text-lg font-semibold text-slate-900">会社概要</h3>
              <div className="mt-2">
                <Markdown>{company.descriptionMd}</Markdown>
              </div>
            </div>
          ) : null}

          {(company.services?.length || company.languages?.length) ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {company.services?.length ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                  <h4 className="font-semibold text-slate-900">提供サービス</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {company.services.map((s) => (
                      <span key={s} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-slate-700">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {company.languages?.length ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                  <h4 className="font-semibold text-slate-900">対応言語</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {company.languages.map((lng) => (
                      <span key={lng} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-slate-700">{lng.toUpperCase?.() || lng}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h4 className="font-semibold text-slate-900">会社情報</h4>
            <div className="mt-3 grid gap-2 text-[14px] text-slate-700">
              {company.websiteUrl && (
                <div>
                  <span className="text-slate-500">Website: </span>
                  <a href={company.websiteUrl} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noreferrer">{company.websiteUrl}</a>
                </div>
              )}
              {company.email && (
                <div>
                  <span className="text-slate-500">Email: </span>
                  <a className="text-blue-600 hover:text-blue-800 underline" href={`mailto:${company.email}`}>{company.email}</a>
                </div>
              )}
              {company.phone && (
                <div>
                  <span className="text-slate-500">Phone: </span>
                  <a className="text-blue-600 hover:text-blue-800 underline" href={`tel:${company.phone}`}>{company.phone}</a>
                </div>
              )}
              {addressText && <div><span className="text-slate-500">Address: </span>{addressText}</div>}
              {company.sns && (
                <div className="pt-1">
                  <div className="text-slate-500 mb-1">SNS:</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(company.sns).map(([k, url]) => {
                      const key = k.toLowerCase();
                      const label = key.toUpperCase();
                      const icon = (function() {
                        if (key === 'x' || key === 'twitter') return (
                          <svg viewBox="0 0 24 24" width="16" height="16" className="fill-slate-700"><path d="M18.244 2H21l-6.49 7.41L22 22h-6.78l-4.77-6.22L4.74 22H2l7-8.01L2 2h6.78l4.5 5.86L18.244 2Zm-1.187 18h1.902L7.03 4H5.03l12.027 16Z"/></svg>
                        );
                        if (key === 'line') return (
                          <svg viewBox="0 0 24 24" width="16" height="16" className="fill-green-600"><path d="M20.5 11.2c0-4-4.03-7.2-9-7.2s-9 3.2-9 7.2c0 3 2.45 5.6 5.93 6.65-.27.94-.98 3.37-1.12 3.9-.18.73.27.72.57.52.23-.15 3.63-2.47 5.11-3.48.46.05.93.08 1.41.08 4.97 0 9-3.2 9-7.2Z"/></svg>
                        );
                        if (key === 'facebook') return (
                          <svg viewBox="0 0 24 24" width="16" height="16" className="fill-blue-600"><path d="M22 12.06C22 6.49 17.52 2 11.94 2 6.37 2 1.88 6.49 1.88 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.42v-2.2c0-2.4 1.43-3.72 3.61-3.72 1.05 0 2.15.19 2.15.19v2.37h-1.21c-1.2 0-1.58.75-1.58 1.52v1.84h2.7l-.43 2.9h-2.27V22c4.79-.76 8.45-4.92 8.45-9.94Z"/></svg>
                        );
                        if (key === 'instagram') return (
                          <svg viewBox="0 0 24 24" width="16" height="16" className="fill-pink-600"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7Zm6.5-.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"/></svg>
                        );
                        if (key === 'youtube') return (
                          <svg viewBox="0 0 24 24" width="16" height="16" className="fill-red-600"><path d="M23 12s0-3.53-.45-5.2a3.56 3.56 0 0 0-2.5-2.5C18.38 3.86 12 3.86 12 3.86s-6.38 0-8.05.44a3.56 3.56 0 0 0-2.5 2.5C1 8.47 1 12 1 12s0 3.53.45 5.2a3.56 3.56 0 0 0 2.5 2.5c1.67.44 8.05.44 8.05.44s6.38 0 8.05-.44a3.56 3.56 0 0 0 2.5-2.5C23 15.53 23 12 23 12ZM10 15.5V8.5l6 3.5-6 3.5Z"/></svg>
                        );
                        if (key === 'linkedin') return (
                          <svg viewBox="0 0 24 24" width="16" height="16" className="fill-blue-700"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11.1 22 14.26V21H18v-6.05c0-1.44-.03-3.3-2-3.3-2 0-2.3 1.56-2.3 3.17V21H10V9Z"/></svg>
                        );
                        return null;
                      })();
                      return (
                        <a key={k} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[12px] hover:bg-slate-50">
                          {icon}
                          <span className="text-slate-700">{label}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
