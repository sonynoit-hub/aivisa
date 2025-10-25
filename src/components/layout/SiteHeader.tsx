"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { locales, defaultLocale, type Locale } from "@/i18n/locales";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getVisaName } from "@/data/visaCatalog";
import { visaCategories as CATEGORY_DATA, type VisaCategoryKey } from "@/data/visaCategories";
import { VisaCategoryIcon, VisaIconBySlug } from "@/features/visa/components/VisaIcon";
import { toShortPathFromSlug } from "@/features/visa/lib/pathMap";

/* ---------- Data ---------- */
type MenuItem = { key: string; label: string };
type VisaCategoryUI = { key: string; label: string; items: { slug: string; label: string }[] };
type MenuData = { main: MenuItem[]; visaCategories: VisaCategoryUI[] };

// 简洁配色建议（Tailwind 默认色，避免重线条）
const BG_HEADER =
  "bg-white/70 backdrop-blur-md border-b border-slate-200/60 text-slate-700";
const BG_DRAWER =
  "bg-white/90 backdrop-blur-xl text-slate-800 shadow-2xl";
const BTN_SOFT =
  "rounded-full border border-slate-200/80 bg-white/60 text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-300";
const CHIP_SOFT =
  "rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200";

// Localized labels for top-level main menu
const MAIN_LABELS: Record<Locale, { home: string; "ask-ai": string; hsp: string; support: string; faq: string; visa: string; "visiting-relatives": string }> = {
  en: { home: "Home", "ask-ai": "AI Assistant", hsp: "High Skilled Professional Points Calculator", support: "Contact", faq: "FAQ", visa: "Categories", "visiting-relatives": "Visiting Relatives" },
  ja: { home: "ホーム", "ask-ai": "AI相談", hsp: "高度専門職ポイント計算", support: "問い合わせ", faq: "FAQ", visa: "カテゴリー", "visiting-relatives": "親族訪問" },
  zh: { home: "首页", "ask-ai": "AI 咨询", hsp: "高度人才积分计算", support: "联系", faq: "常见问题", visa: "类别", "visiting-relatives": "探亲" },
  vi: { home: "Trang chủ", "ask-ai": "Trợ lý AI", hsp: "Tính điểm Nhân lực chất lượng cao", support: "Liên hệ", faq: "Câu hỏi thường gặp", visa: "Danh mục", "visiting-relatives": "Thăm thân nhân" },
  ko: { home: "홈", "ask-ai": "AI 상담", hsp: "고도전문직 포인트 계산", support: "문의", faq: "FAQ", visa: "카테고리", "visiting-relatives": "친족 방문" },
} as const;

const CATEGORY_LABELS: Record<Locale, Record<VisaCategoryKey, string>> = {
  en: {
    work: "Work",
    "status-family": "Status / Family",
    "study-training": "Study / Training",
    "short-others": "Short stay / Others",
  },
  ja: {
    work: "就労系",
    "status-family": "身分・家族",
    "study-training": "留学・研修",
    "short-others": "短期・その他",
  },
  zh: {
    work: "就业类",
    "status-family": "身份・家族",
    "study-training": "留学・研修",
    "short-others": "短期・其他",
  },
  vi: {
    work: "Lao động",
    "status-family": "Tư cách / Gia đình",
    "study-training": "Du học / Đào tạo",
    "short-others": "Ngắn hạn / Khác",
  },
  ko: {
    work: "취업",
    "status-family": "신분·가족",
    "study-training": "유학·연수",
    "short-others": "단기·기타",
  },
} as const;

/* ---------- Helpers ---------- */
const segFor = (key: string) => (
  key === "home" ? "" :
  key === "faq" ? "about/faq" :
  key === "support" ? "questionnaire/contact" :
  key === "hsp" ? "tools/hsp-points" :
  key === "visiting-relatives" ? "visa/vr" :
  key
);

/* ---------- Component ---------- */
export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname() || `/${defaultLocale}`;
  const segs = pathname.split("/").filter(Boolean);
  const currentLocale = (segs[0] as Locale) || defaultLocale;

  const FLAG: Record<Locale, string> = { ja: "🇯🇵", en: "🇺🇸", zh: "🇨🇳", vi: "🇻🇳", ko: "🇰🇷" } as const;
  const LANG_LABELS: Record<Locale, Record<Locale, string>> = {
    en: { ja: "Japanese", en: "English", zh: "Chinese", vi: "Vietnamese", ko: "Korean" },
    ja: { ja: "日本語", en: "英語", zh: "中国語", vi: "ベトナム語", ko: "韓国語" },
    zh: { ja: "日语", en: "英语", zh: "中文", vi: "越南语", ko: "韩语" },
    vi: { ja: "Tiếng Nhật", en: "Tiếng Anh", zh: "Tiếng Trung", vi: "Tiếng Việt", ko: "Tiếng Hàn" },
    ko: { ja: "일본어", en: "영어", zh: "중국어", vi: "베트남어", ko: "한국어" },
  } as const;
  const langNames = LANG_LABELS[currentLocale] ?? LANG_LABELS.en;

  const data = useMemo<MenuData>(() => {
    const m = MAIN_LABELS[currentLocale] ?? MAIN_LABELS.en;
    // Only keep: Home, AI相談,  HSPポイント計算, 問い合わせ, FAQ, カテゴリー
    const main: MenuItem[] = [
      { key: "home", label: m.home },
      { key: "ask-ai", label: m["ask-ai"] },

      { key: "faq", label: m.faq },
      { key: "support", label: m.support },
      { key: "hsp", label: m.hsp },
    ];
    const catLabels = CATEGORY_LABELS[currentLocale] ?? CATEGORY_LABELS.en;
    const visaCategories: VisaCategoryUI[] = CATEGORY_DATA.map((c) => ({
      key: c.key,
      label: catLabels[c.key] ?? c.names[currentLocale] ?? c.names.ja ?? c.key,
      items: c.visas
        .map((slug) => ({ slug, label: getVisaName(slug, currentLocale) ?? slug }))
        .filter((v) => !!v.label),
    }));
    return { main, visaCategories };
  }, [currentLocale]);

  // slug -> category key mapping for badge color (memoized once)
  const slugToCat = useMemo(() => {
    const map: Record<string, VisaCategoryKey> = {};
    for (const c of CATEGORY_DATA) {
      for (const s of c.visas) map[s] = c.key;
    }
    return map;
  }, []);

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  //
  const [drawerWidth, setDrawerWidth] = useState<number | null>(null);
  // 抽屉入场动效由 CSS 负责
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 语言切换
  const onLocaleChange = (next: Locale) => {
    const nextPath = `/${[next, ...segs.slice(1)].join("/")}`;
    router.push(nextPath);
  };

  // 外击与 ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    const onDown = (e: PointerEvent) => {
      const el = e.target as Node;
      if (drawerRef.current?.contains(el)) return;
      closeDrawer();
    };
    const overlayEl = overlayRef.current;
    window.addEventListener("keydown", onKey);
    overlayEl?.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      overlayEl?.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // 计算滚动条宽度，设置 CSS 变量以预留内边距，避免滚动条出现引发布局变化
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    const probe = document.createElement('div');
    probe.style.width = '100px';
    probe.style.height = '100px';
    probe.style.overflow = 'scroll';
    probe.style.position = 'absolute';
    probe.style.top = '-9999px';
    document.body.appendChild(probe);
    const sbw = probe.offsetWidth - probe.clientWidth; // scrollbar width
    document.body.removeChild(probe);
    // 设置变量，供 CSS 使用；若为 0（如 macOS overlay），也没副作用
    el.style.setProperty('--drawer-sbw', `${sbw}px`);
  }, [open]);

  //

  // 锁定页面滚动，并补偿页面滚动条宽度，避免视口变宽引发布局/抽屉宽度变化
  useEffect(() => {
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      setDrawerWidth(null);
    }
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      setDrawerWidth(null);
    };
  }, [open]);

  // 打开前预计算抽屉宽度，确保不超出屏幕
  const openDrawer = () => {
    // 确保抽屉不超出屏幕：最大92%视口宽度，但不超过420px
    const maxWidth = Math.min(window.innerWidth * 0.92, 420);
    // 给小屏幕留一些边距，最小不少于16px的右边距
    const safeWidth = Math.min(maxWidth, window.innerWidth - 16);
    setDrawerWidth(Math.floor(safeWidth));
    setClosing(false);
    setOpen(true);
  };

  // 带动画的关闭
  const closeDrawer = () => {
    setClosing(true);
    // 等待关闭动画完成后再隐藏
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setDrawerWidth(null);
    }, 250); // 与关闭动画时长一致
  };

  // 抽屉列表改为与首页相同顺序的扁平列表（不再分组）

  return (
    <header className={`sticky top-0 z-50 ${BG_HEADER}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 relative flex items-center justify-between">
          {/* 左：语言下拉（固定宽度，截断不挤压布局） */}
          <div className="flex items-center gap-2 w-[140px] sm:w-[160px] md:w-[180px] shrink-0">
            <span className="sr-only">Language</span>
            <select
              value={currentLocale}
              onChange={(e) => onLocaleChange(e.target.value as Locale)}
              className="h-9 w-full truncate whitespace-nowrap overflow-hidden px-2 text-sm rounded-full bg-transparent hover:bg-transparent focus:bg-transparent text-slate-700 border-0 outline-none focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none active:outline-none appearance-none pr-8"
              aria-label="Select language"
            >
              {locales.map((l) => (
                <option value={l} key={l}>
                  {FLAG[l]} {langNames[l] ?? l.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* 中：Logo */}
          <Link
            href={`/${currentLocale}`}
            className="inline-flex items-center gap-2 font-semibold tracking-wide text-slate-800 absolute left-1/2 -translate-x-1/2"
          >
            <Logo />
          </Link>
          
          {/* 右：菜单触发（轻按钮） */}
          <button
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => (open ? closeDrawer() : openDrawer())}
            className="h-10 w-10 inline-flex items-center justify-center text-slate-700 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300 rounded-none transition-transform duration-150 hover:scale-105"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className=""
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* 抽屉与遮罩（统一右侧抽屉，清新样式） */}
      {open &&
        createPortal(
          <>
            <div
              ref={overlayRef}
              className={`fixed inset-0 z-[60] bg-slate-900/30 backdrop-blur-[2px] ${closing ? 'fade-out-overlay' : 'fade-in-overlay'}`}
              aria-hidden
            />
            {/* 固定顶栏关闭按钮：与 Header 容器对齐 */}
            <div className="fixed inset-x-0 top-0 z-[80] flex justify-end px-4 sm:px-6 lg:px-8 pt-[calc(env(safe-area-inset-top)+8px)] pb-3 pointer-events-none">
              <button
                aria-label="Close"
                onClick={closeDrawer}
                className={`h-9 w-9 inline-flex items-center justify-center ${BTN_SOFT} pointer-events-auto transition-transform duration-150 hover:scale-110`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <aside
              ref={drawerRef}
              className={`fixed right-0 top-0 bottom-0 z-[70] rounded-l-2xl ${BG_DRAWER} ${closing ? 'slide-out-right' : 'slide-in-right'} overflow-hidden flex flex-col`}
              style={{ 
                width: drawerWidth ? `${drawerWidth}px` : `${Math.min(window.innerWidth * 0.92, 420)}px`,
                contain: 'layout paint size' as const 
              }}
            >
              {/* 顶部占位：确保内容在关闭按钮下方一点 */}
              <div className="pt-[calc(env(safe-area-inset-top)+56px)] pb-2" />

              {/* 主入口（更大 Chip） */}
              <div className="px-5">
                <div className="mt-1.5 flex flex-wrap gap-2.5">
                  {data.main.map((m) => {
                    const href = `/${currentLocale}/${segFor(m.key)}`;
                    return (
                      <Link
                        key={m.key}
                        href={href}
                        onClick={closeDrawer}
                        className={`px-4 py-2 text-[15px] ${CHIP_SOFT} transition-transform duration-150 hover:scale-105`}
                      >
                        {m.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* 内容：与首页相同顺序的扁平签证列表 */}
              <div ref={scrollRef} className="mt-4 min-h-0 flex-1 drawer-scroll px-5 pb-[env(safe-area-inset-bottom)]">
                {(() => {
                  const ORDERED_ITEMS: Array<
                    | { type: "slug"; slug: string }
                    | { type: "hsp"; kind: "hsp1" | "hsp2" }
                  > = [
                    { type: "slug", slug: "engineer-humanities-international" },
                    { type: "slug", slug: "student" },
                    { type: "slug", slug: "permanent-resident" },
                    { type: "hsp", kind: "hsp1" },
                    { type: "hsp", kind: "hsp2" },
                    { type: "slug", slug: "dependent" },
                    { type: "slug", slug: "long-term-resident" },
                    { type: "slug", slug: "visiting-relatives" },
                    { type: "slug", slug: "designated-activities" },
                    { type: "slug", slug: "spouse-of-permanent-resident" },
                    { type: "slug", slug: "spouse-of-japanese-national" },
                    { type: "slug", slug: "business-manager" },
                    { type: "slug", slug: "care-worker" },
                    { type: "slug", slug: "skilled-labor" },
                    { type: "slug", slug: "technical-intern-training" },
                    { type: "slug", slug: "temporary-visitor" },
                    { type: "slug", slug: "specified-skilled-worker" },
                  ];
                  const HSP_LABELS: Record<Locale, { hsp1: string; hsp2: string }> = {
                    ja: { hsp1: "高度専門職1号", hsp2: "高度専門職2号" },
                    en: { hsp1: "Highly Skilled Professional Type 1", hsp2: "Highly Skilled Professional Type 2" },
                    zh: { hsp1: "高度人材1号", hsp2: "高度人材2号" },
                    vi: { hsp1: "Nhân lực chất lượng cao số 1", hsp2: "Nhân lực chất lượng cao số 2" },
                    ko: { hsp1: "고도전문직 1호", hsp2: "고도전문직 2호" },
                  } as const;
                  const getLabel = (item: (typeof ORDERED_ITEMS)[number]) => {
                    if (item.type === "slug") return getVisaName(item.slug, currentLocale) ?? item.slug;
                    const map = HSP_LABELS[currentLocale] ?? HSP_LABELS.ja;
                    return map[item.kind];
                  };
                  const getHref = (item: (typeof ORDERED_ITEMS)[number]) =>
                    item.type === "slug"
                      ? `/${currentLocale}/visa/${toShortPathFromSlug(item.slug)}`
                      : item.kind === "hsp1"
                        ? `/${currentLocale}/visa/hsp-i`
                        : `/${currentLocale}/visa/hsp-ii`;
                  // 5-color cyclic badge palette by display order
                  const BADGE_PALETTE = ['icon-badge--p1','icon-badge--p2','icon-badge--p3','icon-badge--p4','icon-badge--p5'] as const;
                  const badgeClassByIndex = (idx: number) => `icon-badge ${BADGE_PALETTE[idx % 5]}`;

                  return (
                    <ul className="space-y-1.5">
                      {ORDERED_ITEMS.map((it, idx) => (
                        <li key={idx}>
                          <Link
                            href={getHref(it)}
                            onClick={closeDrawer}
                            className="block rounded-lg px-2 py-2 text-[15px] text-slate-700 hover:bg-slate-100 transition-colors duration-150"
                            title={getLabel(it)}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className={`${badgeClassByIndex(idx)} h-8 w-8 shrink-0`}>
                                {it.type === "slug" ? (
                                  <VisaIconBySlug slug={it.slug} className="h-[18px] w-[18px] text-white" />
                                ) : (
                                  <VisaCategoryIcon cat="work" className="h-4 w-4 text-white" />
                                )}
                              </span>
                              <span className="min-w-0 break-words whitespace-normal leading-snug">{getLabel(it)}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  );
                })()}

                {/* 二级信息区块 */}
                {(() => {
                  const labels = {
                    title: { en: 'Policies', ja: 'ポリシー', zh: '政策', vi: 'Chính sách', ko: '정책' },
                    privacy: { en: 'Privacy Policy', ja: 'プライバシーポリシー', zh: '隐私政策', vi: 'Chính sách quyền riêng tư', ko: '개인정보 처리방침' },
                    terms: { en: 'Terms of Use', ja: '利用規約', zh: '使用条款', vi: 'Điều khoản sử dụng', ko: '이용약관' }
                  } as const;
                  return (
                    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/70 p-3">
                      <div className="mb-2 px-2 text-sm font-medium text-slate-800">{labels.title[currentLocale] ?? labels.title.en}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">
                        <Link href={`/${currentLocale}/legal/privacy`} onClick={closeDrawer} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 text-slate-700 transition-colors duration-150">{labels.privacy[currentLocale] ?? labels.privacy.en}</Link>
                        <Link href={`/${currentLocale}/legal/terms`} onClick={closeDrawer} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 text-slate-700 transition-colors duration-150">{labels.terms[currentLocale] ?? labels.terms.en}</Link>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </aside>
          </>,
          document.body
        )}
    </header>
  );
}
