import Link from 'next/link'
import { locales, defaultLocale } from '@/i18n/locales'

export default function RootPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
  <h1 className="text-2xl font-semibold mb-4">AiVisa</h1>
      <p className="text-gray-600 mb-6">Choose a language to continue:</p>
      <ul className="flex flex-wrap gap-2">
        {locales.map(l => (
          <li key={l}>
            <Link className={`inline-block rounded border px-3 py-1 ${l===defaultLocale? 'bg-gray-100' : ''}`} href={`/${l}`}>{l.toUpperCase()}</Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
