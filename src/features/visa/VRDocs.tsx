"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Markdown from "@/components/common/Markdown";
import { PrintToPdfButton } from "@/components/pdf/PrintToPdfButton";
import ja from "@/i18n/messages/ja/visa-pages/vr.json";
import en from "@/i18n/messages/en/visa-pages/vr.json";
import zh from "@/i18n/messages/zh/visa-pages/vr.json";
import vi from "@/i18n/messages/vi/visa-pages/vr.json";
import ko from "@/i18n/messages/ko/visa-pages/vr.json";

// Dynamic stage & category support
type StageKey = string; // e.g., "vietnam", "china"
type CategoryKey = string; // includes applicant, sponsor, guarantee

const CAT_COLORS: Record<string, { titleDot: string; badgeBg: string; badgeText: string; badgeBorder: string; checkboxAccent: string }> = {
  applicant: { titleDot: "bg-teal-500", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-700" },
  sponsor: { titleDot: "bg-amber-400", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-700" },
  guarantee: { titleDot: "bg-indigo-500", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-700" },
};
const FALLBACK_COLOR = { titleDot: "bg-slate-400", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-600" };

function getLocaleFromPath(): string {
  if (typeof window === "undefined") return "ja";
  const segs = window.location.pathname.split("/").filter(Boolean);
  return segs[0] || "ja";
}

type StudyDocsData = Record<string, Record<string, string[]>>;
type StudyDocsMeta = {
  stageLabels: Record<string, string>;
  categoryLabels: Record<string, string>;
  title?: string;
  tips?: string;
  stageTips?: Record<string, string>;
  ui?: { expand?: string; collapse?: string; progress?: string; none?: string; hint?: string };
  actions?: { pdf?: string; pdfAria?: string };
};
type Props = { locale?: string; studyDocs?: StudyDocsData; studyDocsMeta?: StudyDocsMeta };

export default function VRDocs({ locale: propLocale, studyDocs, studyDocsMeta }: Props) {
  const locale = propLocale || getLocaleFromPath();
  const [stage, setStage] = useState<StageKey>(() => {
    const docs = (studyDocs || (ja as any).studyDocs) as StudyDocsData | undefined;
    if (docs) {
      if (docs.vietnam) return "vietnam";
      const keys = Object.keys(docs);
      if (keys.length) return keys[0];
    }
    return "vietnam"; // fallback
  });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const captureRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  type CheckMap = Record<string, boolean>;
  const STORAGE_KEY = "vrDocs:checks";
  const [checks, setChecks] = useState<CheckMap>({});

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setChecks(JSON.parse(raw) as CheckMap);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
    } catch {}
  }, [checks]);

  const META = useMemo<StudyDocsMeta & { studyDocs: StudyDocsData }>(() => {
    if (studyDocsMeta && studyDocs) return { ...studyDocsMeta, studyDocs } as StudyDocsMeta & { studyDocs: StudyDocsData };

    const dataByLocale = { ja, en, zh, vi, ko };
    const data = dataByLocale[locale as keyof typeof dataByLocale] ?? dataByLocale.ja;
    return {
      stageLabels: (data as any).stageLabels,
      categoryLabels: (data as any).categoryLabels,
      title: (data as any).title,
      tips: (data as any).tips,
      stageTips: (data as any).stageTips,
      ui: (data as any).ui,
      actions: (data as any).actions,
      studyDocs: (data as any).studyDocs,
    } as StudyDocsMeta & { studyDocs: StudyDocsData };
  }, [locale, studyDocs, studyDocsMeta]);

  const ACTIVE_DOCS: StudyDocsData | undefined = META?.studyDocs as any;
  useEffect(() => {
    if (ACTIVE_DOCS && !ACTIVE_DOCS[stage]) {
      const first = Object.keys(ACTIVE_DOCS)[0];
      if (first) setStage(first);
    }
  }, [ACTIVE_DOCS, stage]);
  const categories = useMemo(() => (ACTIVE_DOCS ? ACTIVE_DOCS[stage] || {} : {}), [ACTIVE_DOCS, stage]);
  const stageTabs = ACTIVE_DOCS
    ? Object.keys(ACTIVE_DOCS).map((k) => ({
        key: k,
        label: (META?.stageLabels as any)?.[k] ?? k,
        count: Object.values(ACTIVE_DOCS[k]).reduce((acc, arr) => acc + (arr?.length || 0), 0),
      }))
    : [];

  if (!ACTIVE_DOCS) return null;

  return (
    <section ref={sectionRef} className="mt-4" data-export-scope>
      {META?.title ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5" data-hide-print>
              <h3 className="text-xl font-bold tracking-tight text-slate-900">{META.title}</h3>
            </div>
            <div className="flex items-center gap-2" data-hide-print>
              <PrintToPdfButton
                targetRef={sectionRef as React.RefObject<HTMLElement>}
                filename={`${META?.title ?? "VRDocs"}-${(META?.stageLabels as any)?.[stage] ?? stage}`}
                onBeforePrint={async () => {
                  const prev = collapsed;
                  setCollapsed({ applicant: false, sponsor: false });
                  await new Promise((r) => requestAnimationFrame(() => r(null)));
                  (window as any).__vrDocsPrevCollapsed = prev;
                }}
                onAfterPrint={async () => {
                  const prev = (window as any).__vrDocsPrevCollapsed as Record<string, boolean> | undefined;
                  if (prev) setCollapsed(prev);
                  (window as any).__vrDocsPrevCollapsed = undefined;
                }}
                className={
                  "inline-flex h-9 items-center rounded-xl px-3 text-sm transition border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
                }
              >
                {META?.actions?.pdf ?? "PDF"}
              </PrintToPdfButton>
            </div>
          </div>
          <div className="mt-3 h-px bg-gradient-to-r from-slate-200/80 via-slate-200/60 to-transparent" data-hide-print />
          <div aria-hidden className="mb-2 mt-1 hidden print:block">
            <h1 className="text-[18px] font-semibold text-slate-900">
              {META.title}
              <span className="ml-2 text-slate-500">— {(META?.stageLabels as any)?.[stage] ?? stage}</span>
            </h1>
          </div>
        </>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center" data-hide-print>
        <div
          className="-mx-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
          role="tablist"
          aria-label="stages"
        >
          {stageTabs.map((tab) => {
            const active = tab.key === stage;
            return (
              <button
                key={tab.key}
                onClick={() => setStage(tab.key)}
                role="tab"
                aria-selected={active}
                data-analytics="click"
                data-analytics-name={`StageTab:${tab.label}`}
                className={
                  "h-9 shrink-0 rounded-xl border px-3 text-sm whitespace-nowrap snap-start select-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 " +
                  (active
                    ? "border-teal-600 text-white shadow-sm btn-primary"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:shadow-sm")
                }
              >
                <span className="font-medium leading-none">{tab.label}</span>
                <span
                  className={
                    "ml-2 inline-flex h-5 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-[12px] tabular-nums leading-none " +
                    (active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-700")
                  }
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={captureRef} data-export-root className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(categories) as CategoryKey[]).map((cat) => {
          const items = categories[cat];
          const title = ((META?.categoryLabels as any)?.[cat] ?? cat) as string;
          const color = CAT_COLORS[cat];

          const itemKey = (idx: number) => `${locale}:${stage}:${cat}:${idx}`;
          const completedCount = mounted ? items.reduce((acc, _, idx) => (checks[itemKey(idx)] ? acc + 1 : acc), 0) : 0;
          const totalCount = items.length || 1;
          const progress = mounted ? Math.round((completedCount / totalCount) * 100) : 0;
          const isCollapsed = collapsed[cat];

          return (
            <article data-doc-card data-cat={cat} key={cat} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-900/5 transition-shadow hover:shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${color.titleDot}`} />
                  <h4 className="text-[16px] font-semibold text-slate-900" data-card-title>{title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[12px] ${color.badgeBg} ${color.badgeText} ${color.badgeBorder}`}>
                    {items.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCollapsed((s) => ({ ...s, [cat]: !s[cat] }))}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                    data-hide-print
                    aria-expanded={!isCollapsed}
                  >
                    {isCollapsed ? (META?.ui?.expand ?? "展開") : (META?.ui?.collapse ?? "収起")}
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{META?.ui?.progress ?? "完成度"}</span>
                  <span>{completedCount}/{totalCount}（{progress}%）</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100" data-progress-track>
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#04c4b6] via-[#039991] to-[#028074]" data-progress-fill style={{ width: `${progress}%` }} />
                </div>
              </div>

              {!isCollapsed ? (
                <ul className="mt-4 space-y-2">
                  {items.map((name, i) => {
                    const k = itemKey(i);
                    const checked = !!checks[k];
                    return (
                      <li key={k} className="flex items-start gap-3 text-[14px]">
                        <input
                          id={k}
                          type="checkbox"
                          className={`mt-1 h-4 w-4 rounded ${color.checkboxAccent}`}
                          checked={mounted ? checked : false}
                          onChange={(e) => {
                            const v = e.target.checked;
                            setChecks((m) => ({ ...m, [k]: v }));
                          }}
                        />
                        <label htmlFor={k} className={"cursor-pointer leading-6 " + (checked ? "text-slate-400 line-through" : "text-slate-700")}>
                          {name}
                        </label>
                      </li>
                    );
                  })}
                  {items.length === 0 ? (
                    <li className="text-sm text-slate-500">{META?.ui?.none ?? "暂无内容"}</li>
                  ) : null}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>

      {(() => {
        const tipsText = (META?.stageTips && (META.stageTips as any)[stage]) || META?.tips;
        return tipsText ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700">i</span>
            <span className="text-sm font-medium">{META?.ui?.hint ?? "ヒント"}</span>
          </div>
          <Markdown className="prose prose-slate max-w-none text-sm">{tipsText as string}</Markdown>
        </div>
        ) : null;
      })()}
    </section>
  );
}