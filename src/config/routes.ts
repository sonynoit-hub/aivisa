import { defaultLocale } from "@/i18n/locales";
export function withLocale(path: string, locale?: string) {
  const l = locale || defaultLocale;
  return `/${l}${path.startsWith("/") ? path : "/" + path}`;
}
