"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const pathname = usePathname() || '/ja';
  const segs = pathname.split('/').filter(Boolean);
  const locale = segs[0] || 'ja';
  const t = useTranslations('footer');
    return (
      <footer className="">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600 flex items-center justify-between">
        <span>© {new Date().getFullYear()} aivisa</span>
        <nav className="flex gap-4">
          <Link className="hover:underline" href={`/${locale}/legal/privacy`}>{t('privacy')}</Link>
          <Link className="hover:underline" href={`/${locale}/legal/terms`}>{t('terms')}</Link>
        </nav>
      </div>
    </footer>
  );
}
