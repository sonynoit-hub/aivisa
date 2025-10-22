"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { visaCatalog } from "@/data/visaCatalog";
import { visaCategories } from "@/data/visaCategories";
import { VisaIconBySlug, VisaCategoryIcon } from "@/features/visa/components/VisaIcon";
import type { Locale } from "@/i18n/locales";
import { toShortPathFromSlug } from "@/features/visa/lib/pathMap";
import AdSlots from "@/components/ad/AdSlots";

export default function HomeClient() {
  const t = useTranslations("home");
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [ph, setPh] = useState("");
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = (params?.locale as Locale) || "ja";

  const ask = (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = q.trim();
    if (!value) return;
    router.push(`/${locale}/ask-ai?q=${encodeURIComponent(value)}`);
  };


  const hintPhrases = useMemo(() => {
    const raw = (t.raw('hero.chips') as string[] | undefined) ?? [];
    const labels = raw.filter((s) => typeof s === 'string' && s.trim());
    return labels;
  }, [t]);

  const timerRef = useRef<number | null>(null);
  const idxRef = useRef(0);
  const chrRef = useRef(0);
  const dirRef = useRef<"typing" | "deleting">("typing");

  // derive a stable key for hintPhrases to avoid complex expression in deps
  const hintKey = useMemo(() => hintPhrases.join("|"), [hintPhrases]);
  // keep a ref of the array so effects don't directly depend on it
  const hintRef = useRef<string[]>([]);
  useEffect(() => {
    hintRef.current = hintPhrases;
  }, [hintPhrases]);

  useEffect(() => {
    idxRef.current = 0;
    chrRef.current = 0;
    dirRef.current = "typing";
    setPh("");
  }, [hintKey]);

  

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (focused || q || hintRef.current.length === 0) {
      setPh("");
      return;
    }
    const run = () => {
      const text = hintRef.current[idxRef.current] || "";
      if (dirRef.current === "typing") {
        chrRef.current += 1;
        setPh(text.slice(0, chrRef.current));
        if (chrRef.current >= text.length) {
          dirRef.current = "deleting";
          timerRef.current = window.setTimeout(run, 1400);
          return;
        }
        timerRef.current = window.setTimeout(run, 120);
      } else {
        chrRef.current -= 1;
        setPh(text.slice(0, chrRef.current));
        if (chrRef.current <= 0) {
          dirRef.current = "typing";
          idxRef.current = (idxRef.current + 1) % hintRef.current.length;
          timerRef.current = window.setTimeout(run, 800);
          return;
        }
        timerRef.current = window.setTimeout(run, 70);
      }
    };
    timerRef.current = window.setTimeout(run, 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [focused, q, hintKey]);

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

  const HSP_LABELS: Record<string, { hsp1: string; hsp2: string }> = {
    ja: { hsp1: "高度専門職1号", hsp2: "高度専門職2号" },
    en: { hsp1: "Highly Skilled Professional Type 1", hsp2: "Highly Skilled Professional Type 2" },
  zh: { hsp1: "高度人材1号", hsp2: "高度人材2号" },
    vi: { hsp1: "Nhân lực chất lượng cao số 1", hsp2: "Nhân lực chất lượng cao số 2" },
    ko: { hsp1: "고도전문직 1호", hsp2: "고도전문직 2호" },
  };

  const getVisaLabel = (item: (typeof ORDERED_ITEMS)[number]) => {
    if (item.type === "slug") {
      const hit = visaCatalog.find((v) => v.slug === item.slug);
      return hit?.names[locale as keyof typeof hit.names] ?? hit?.names.ja ?? item.slug;
    }
    const map = HSP_LABELS[locale] ?? HSP_LABELS.ja;
    return map[item.kind];
  };

  const DESC_MAP: Record<string, Record<string, string>> = {
    ja: {
      student: "在籍証明 + 資金証明。",
      "permanent-resident": "素行・独立生計・納税の総合評価。",
      "engineer-humanities-international": "学歴または実務 + 年収目安。",
      hsp1: "学術/技術/経営の高度専門職1号。",
      hsp2: "高度専門職2号（活動の拡大）。",
      dependent: "家族滞在（配偶・子）。",
      "long-term-resident": "日系・特例等の定住者。",
      "designated-activities": "ワーホリ等の特定活動。",
      "spouse-of-permanent-resident": "永住者の配偶者等。",
      "spouse-of-japanese-national": "日本人の配偶者等。",
      "business-manager": "会社設立・経営管理。",
      "care-worker": "介護分野での就労。",
      "skilled-labor": "技能職での就労。",
      "technical-intern-training": "技能実習制度による滞在。",
      "temporary-visitor": "観光・商用など短期滞在。",
      "specified-skilled-worker": "特定技能での就労。",
      "visiting-relatives": "家族・親族の訪問。",
    },
    en: {
      student: "Enrollment certificate + proof of funds.",
      "permanent-resident": "Good conduct, stable income, and tax compliance.",
      "engineer-humanities-international": "Education or experience + target income.",
      hsp1: "For research/technical/management.",
      hsp2: "Requires 80+ points.",
      dependent: "Dependent (spouse/child).",
      "long-term-resident": "Long-term resident under special cases.",
      "designated-activities": "Designated activities (e.g., Working Holiday).",
      "spouse-of-permanent-resident": "Spouse/child of permanent resident.",
      "spouse-of-japanese-national": "Spouse/child of Japanese national.",
      "business-manager": "Company setup and management.",
      "care-worker": "Work in caregiving field.",
      "skilled-labor": "Work in skilled occupations.",
      "technical-intern-training": "Stay under Technical Intern Training.",
      "temporary-visitor": "Short stay for tourism/business.",
      "specified-skilled-worker": "Work under Specified Skilled Worker.",
      "visiting-relatives": "Visit family members in Japan.",
    },
  zh: {
      student: "在籍证明 + 资金证明。",
      "permanent-resident": "品行、独立生计、纳税的综合评估。",
      "engineer-humanities-international": "学历或经验 + 收入目标。",
  hsp1: "高度人材1号（研究/技术/经营）。",
  hsp2: "高度人材2号（活动范围更广）。",
  dependent: "家属滞留（配偶・子女）。",
      "long-term-resident": "特例等下的定住者。",
      "designated-activities": "特定活动（如打工度假）。",
  "spouse-of-permanent-resident": "永住者的配偶・子女。",
  "spouse-of-japanese-national": "日本人的配偶・子女。",
      "business-manager": "公司设立与经营管理。",
  "care-worker": "介护领域就劳。",
      "skilled-labor": "技能职业就劳。",
      "technical-intern-training": "依技能实习制度滞留。",
      "temporary-visitor": "旅游/商务等短期停留。",
      "specified-skilled-worker": "以特定技能就劳。",
      "visiting-relatives": "探望在日亲属。",
    },
    vi: {
      student: "Cần giấy xác nhận nhập học.",
      "permanent-resident": "Cần thu nhập ổn định và tuân thủ thuế.",
      "engineer-humanities-international": "Cần có bằng cấp hoặc kinh nghiệm",
      hsp1: "Dành cho nghiên cứu/kỹ thuật/quản lý.",
      hsp2: "Cần trên 80 điểm",
      dependent: "Người phụ thuộc (vợ/chồng, con).",
      "long-term-resident": "Cư trú dài hạn theo diện đặc biệt.",
      "designated-activities": "Chờ xin việc hoặc tình nguyện.",
      "spouse-of-permanent-resident": "Cần xác chứng minh nhân thân.",
      "spouse-of-japanese-national": "Cần xác chứng minh nhân thân.",
      "business-manager": "Thành lập và quản lý doanh nghiệp.",
      "care-worker": "Làm việc trong ngành điều dưỡng.",
      "skilled-labor": "Dành cho người có tay nghề.",
      "technical-intern-training": "Lưu trú theo chương trình thực tập kỹ năng.",
      "temporary-visitor": "Du lịch, công tác ngắn hạn.",
      "specified-skilled-worker": "Làm việc theo diện Kỹ năng đặc định.",
      "visiting-relatives": "Học sinh cũng có thể mời qua",
    },
    ko: {
      student: "재학 증명 + 자금 증빙.",
      "permanent-resident": "품행, 안정적 소득, 납세의 종합 평가.",
      "engineer-humanities-international": "학력 또는 경력 + 목표 소득.",
      hsp1: "고도전문직 1호(연구/기술/경영).",
      hsp2: "고도전문직 2호(활동 확대).",
      dependent: "가족체류(배우자/자녀).",
      "long-term-resident": "특례 등에 따른 정주자.",
      "designated-activities": "특정활동(워킹홀리데이 등).",
      "spouse-of-permanent-resident": "영주자의 배우자 등.",
      "spouse-of-japanese-national": "일본인의 배우자 등.",
      "business-manager": "회사 설립·경영 관리.",
      "care-worker": "개호 분야 취업.",
      "skilled-labor": "숙련 직종 취업.",
      "technical-intern-training": "기능실습 제도에 따른 체류.",
      "temporary-visitor": "관광·상용 등 단기체류.",
      "specified-skilled-worker": "특정기능으로 취업.",
    },
  };

  const getVisaDesc = (item: (typeof ORDERED_ITEMS)[number]) => {
    const key = item.type === "slug" ? item.slug : item.kind;
    const map = (DESC_MAP[locale as keyof typeof DESC_MAP] ?? DESC_MAP.ja) as Record<string, string>;
    let text = map[key] ?? "";
    text = text.replace(/[。\.]+$/u, "");
    return text;
  };


  const slugToCat: Record<string, typeof visaCategories[number]["key"]> = useMemo(() => {
    const map = {} as Record<string, typeof visaCategories[number]["key"]>;
    for (const c of visaCategories) {
      for (const s of c.visas) map[s] = c.key;
    }
    return map;
  }, []);

  const badgeClassByItem = (it: (typeof ORDERED_ITEMS)[number]) => {
    const key = it.type === 'slug' ? slugToCat[it.slug] : 'work';
    switch (key) {
      case 'work': return 'icon-badge icon-badge--work';
      case 'status-family': return 'icon-badge icon-badge--family';
      case 'study-training': return 'icon-badge icon-badge--study';
      case 'short-others': return 'icon-badge icon-badge--short';
      default: return 'icon-badge icon-badge--work';
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="mx-auto max-w-screen-sm px-4 pb-24 pt-0">
          <section className="relative -mx-4 px-4 pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 hero-animated overflow-visible">
          <div className="hero-grid" aria-hidden />
          <div className="hero-noise" aria-hidden />
          <div className="hero-fade" aria-hidden />

          <div className="relative z-10">
            <h1 className="text-[30px] sm:text-[34px] font-extrabold leading-tight tracking-tight text-slate-900 text-center">
              {t("hero.title")}
            </h1>

            <p className="mt-3 text-[15px] leading-[1.8] text-slate-700 text-center">
              {t("hero.subtitle")}
            </p>

            <form
              onSubmit={ask}
              className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/85 px-2 py-2 shadow-soft backdrop-blur supports-[backdrop-filter]:backdrop-blur"
            >
              <span className="code-badge hidden sm:inline-block">/ask</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={ph || t("hero.placeholder")}
                className="h-11 w-full rounded-lg border border-slate-200/60 bg-white px-3 text-[15px] outline-none focus:ring-2 focus:ring-slate-400"
              />
              <button
                type="submit"
                className="relative h-11 whitespace-nowrap rounded-lg bg-gradient-to-br from-[#04c4b6] to-[#039991] px-4 text-white shadow-soft transition-all hover:from-[#03a898] hover:to-[#028074] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
              >
                <span className="relative z-[1]">{t("hero.cta")}</span>
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {((t.raw('hero.chips') as string[] | undefined) ?? []).map((label, i) => {
                if (!label || typeof label !== 'string') return null;
                return (
                  <button
                    key={i}
                    onClick={() => setQ(label)}
                    className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-slate-700 backdrop-blur transition-colors hover:bg-white"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-10 sm:mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {t("visas.title")}
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3">
            {ORDERED_ITEMS.map((it, idx) => {
              const label = getVisaLabel(it);
              const desc = getVisaDesc(it);
              const href = it.type === "slug"
                ? `/${locale}/visa/${toShortPathFromSlug(it.slug)}`
                : it.kind === 'hsp1'
                  ? `/${locale}/visa/hsp-i`
                  : `/${locale}/visa/hsp-ii`;
              return (
                <Link key={idx} href={href} className="block group" aria-label={label}>
                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50">
                    <div className="flex h-full items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0">
                          <span className={`${badgeClassByItem(it)} h-10 w-10`}>
                            {it.type === 'slug' ? (
                              <VisaIconBySlug slug={it.slug} className="h-[26px] w-[26px] text-white" />
                            ) : (
                              <VisaCategoryIcon cat="work" className="h-[22px] w-[22px] text-white" />
                            )}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-semibold text-slate-900 truncate">{label}</h3>
                          {desc && (
                            <p className="mt-1 text-[12.5px] leading-5 text-slate-600 max-h-[2.5rem] overflow-hidden line-clamp-2">{desc}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-slate-400 leading-none self-center group-hover:text-slate-600 transition-colors" aria-hidden>
                        <svg className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="relative z-10 mt-10">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t("process.title")}</h2>
          <div className="mt-4 relative rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-soft">
            <ol className="space-y-7">
              {(((t.raw('process.steps') as Array<{title:string; duration?:string; desc?:string}>) ?? [])).map((step, i) => {
                if (!step?.title) return null;
                const {title, duration, desc} = step;
                return (
                  <li
                    key={i}
                    className="relative pl-10 after:content-[''] after:absolute after:left-6 after:top-[0.8125rem] after:-translate-x-1/2 after:w-[2px] after:bg-gradient-to-b after:from-[#22c1b0] after:to-[#0ea5a1] after:opacity-70 last:after:hidden after:bottom-[-1.75rem]"
                  >
                    <span className="pointer-events-none absolute left-6 top-1.5 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-[#2dd4bf] to-[#0ea5a1] ring-2 ring-white shadow-sm" aria-hidden />
                    <div className="flex items-baseline justify-between">
                      <div className="text-[15px] font-semibold text-slate-900">{title}</div>
                      {duration && (
                        <div className="text-xs text-slate-500">{duration}</div>
                      )}
                    </div>
                    {desc && (
                      <p className="mt-1 text-[14px] leading-6 text-slate-700">
                        {desc}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {t("advisors.title")}
            </h2>
            <div className="text-sm text-slate-500">{t("advisors.note")}</div>
          </div>
          <div className="mt-2 h-px bg-slate-200/80" />

          {/* 在此展示来自数据库的广告卡片（2 条） */}
          <div className="mt-4">
            <AdSlots page="top" slot="top_card" locale={locale} limit={2} />
          </div>
        </section>
      </div>
    </main>
  );
}
