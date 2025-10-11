"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { locales, defaultLocale, type Locale } from "@/i18n/locales";

export default function HtmlLangSync() {
  const pathname = usePathname() || `/${defaultLocale}`;
  const seg = pathname.split("/").filter(Boolean)[0];
  const locale: Locale = (locales as readonly string[]).includes(seg as string)
    ? (seg as Locale)
    : defaultLocale;

  useEffect(() => {
    const html = document.documentElement;
    if (html.lang !== locale) {
      html.lang = locale;
    }
  }, [locale]);

  return null;
}
