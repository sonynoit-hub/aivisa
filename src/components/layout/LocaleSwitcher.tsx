"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { locales } from "@/i18n/locales";

export function LocaleSwitcher() {
  const pathname = usePathname() || "/ja";
  const segs = pathname.split("/").filter(Boolean);
  const currentLocale = segs[0] || "ja";

  const FLAGS: Record<string, string> = { ja: "🇯🇵", en: "🇺🇸", zh: "🇨🇳", vi: "🇻🇳", ko: "🇰🇷" };
  const LABELS: Record<string, Record<string, string>> = {
    en: { ja: "Japanese", en: "English", zh: "Chinese", vi: "Vietnamese", ko: "Korean" },
    ja: { ja: "日本語", en: "英語", zh: "中国語", vi: "ベトナム語", ko: "韓国語" },
    zh: { ja: "日语", en: "英语", zh: "中文", vi: "越南语", ko: "韩语" },
    vi: { ja: "Tiếng Nhật", en: "Tiếng Anh", zh: "Tiếng Trung", vi: "Tiếng Việt", ko: "Tiếng Hàn" },
    ko: { ja: "日本어", en: "영어", zh: "중국어", vi: "베트남어", ko: "한국어" },
  };
  const names = LABELS[currentLocale] ?? LABELS.en;

  return (
    <div className="inline-flex items-center gap-2">
      {locales.map(l => {
        const nextPath = "/" + [l, ...segs.slice(1)].join("/");
        const active = l === currentLocale;
        return (
          <Link key={l} href={nextPath} className={`px-2 py-1 rounded inline-flex items-center gap-1.5 ${active ? "bg-gray-200" : "hover:bg-gray-100"}`}>
            <span aria-hidden>{FLAGS[l] ?? ""}</span>
            <span>{names[l] ?? l.toUpperCase()}</span>
          </Link>
        );
      })}
    </div>
  );
}
