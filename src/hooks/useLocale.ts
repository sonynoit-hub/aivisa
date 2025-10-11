"use client";
import { usePathname } from "next/navigation";
import { locales, defaultLocale } from "@/i18n/locales";

export function useLocale() {
  const pathname = usePathname() || `/${defaultLocale}`;
  const seg = pathname.split("/").filter(Boolean)[0];
  if (seg && (locales as readonly string[]).includes(seg)) {
    return seg as (typeof locales)[number];
  }
  return defaultLocale;
}
