import Link from 'next/link'
import type { Metadata } from 'next'
import { locales, type Locale, ogLocaleMap } from '@/i18n/locales'
import { site } from '@/config/site'

// 避免构建期预渲染触发 CSR bailout 的 Suspense 要求
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ locale: Locale }> }

export default async function ResourcesIndexPage({ params }: Params) {
  const { locale } = await params;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">リソース</h1>
      <ul className="space-y-2">
        <li><Link className="underline" href={`/${locale}/resources/docs-samples`}>書類サンプル</Link></li>
  <li><Link className="underline" href={`/${locale}/tools/hsp-points`}>高度専門職ポイント計算</Link></li>
        <li><Link className="underline" href={`/${locale}/legal/privacy`}>規則・ポリシー（仮）</Link></li>
      </ul>
    </div>
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const base = site.baseUrl.replace(/\/$/, '')
  const url = `${base}/${locale}/resources`
  const languages: Record<string, string> = {}
  for (const l of locales) languages[l] = `${base}/${l}/resources`

  let title = 'Resources'
  let description = 'Guides, samples and helpful visa resources.'
  let keywords: string[] | undefined
  try {
    const mod = await import(`@/i18n/messages/${locale}/resources.json`)
    const data = (mod as any).default?.resources?.index ?? {}
    title = data.seoTitle || title
    description = data.seoDescription || description
    keywords = Array.isArray(data.seoKeywords) ? data.seoKeywords : undefined
  } catch {}

  return {
    title: `${title} | ${site.name}`,
    description,
    keywords,
    robots: { index: false, follow: false },
    alternates: { canonical: url, languages },
    openGraph: { title: `${title} | ${site.name}`, description, url, siteName: site.name, locale: ogLocaleMap[locale], type: 'website' },
    twitter: { card: 'summary_large_image', title: `${title} | ${site.name}`, description },
  }
}
