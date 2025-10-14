"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PrintToPdfButton } from "@/components/pdf/PrintToPdfButton";
import Markdown from "@/components/common/Markdown";

type StageKey = "abroad" | "inJapan" | "change" | "extend";

type UIStrings = {
  expand?: string;
  collapse?: string;
  progress?: string;
  none?: string;
  hint?: string;
  noteTitle?: string;
};

type ActionsStrings = { pdf?: string; pdfAria?: string };

export type VisaDocsMeta<C extends string> = {
  stageLabels: Record<StageKey, string>;
  categoryLabels: Record<C, string>;
  title?: string;
  tips?: string;
  note?: string;
  ui?: UIStrings;
  actions?: ActionsStrings;
};

export type ColorConfig = {
  titleDot: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  checkboxAccent: string;
};

function getLocaleFromPath(): string {
  if (typeof window === "undefined") return "ja";
  const segs = window.location.pathname.split("/").filter(Boolean);
  return segs[0] || "ja";
}

// Support group items inside studyDocs arrays: { group: string; options: string[]; pick?: 'one' | 'any' }
type GroupItem = { group: string; options: string[]; pick?: 'one' | 'any' };
type DocItem = string | GroupItem;

function isGroupItem(v: unknown): v is GroupItem {
  return !!v && typeof v === "object" && "group" in (v as any) && Array.isArray((v as any).options);
}

export type VisaDocsProps<C extends string> = {
  locale?: string;
  storageKey: string;
  categoryOrder?: readonly C[];
  colors?: Partial<Record<C, ColorConfig>>;
  studyDocs?: Record<StageKey, Record<C, DocItem[]>>;
  meta?: VisaDocsMeta<C>;
};

export default function VisaDocs<C extends string>({
  locale: propLocale,
  storageKey,
  categoryOrder,
  colors,
  studyDocs,
  meta,
}: VisaDocsProps<C>) {
  const locale = propLocale || getLocaleFromPath();
  const DEFAULT_NOTE_MAP: Record<string, string> = {
    ja: "本ページの内容は一般的な参考情報としてご利用ください。最新かつ正確な申請要件・必要書類については、必ず[出入国在留管理庁](https://www.moj.go.jp/isa/)の情報をご確認ください。",
    en: "The content on this page is provided as general reference. For the latest and most accurate application requirements and required documents, please refer to the information from the [Immigration Services Agency of Japan](https://www.moj.go.jp/isa/).",
    zh: "本页面内容仅供一般性参考。关于最新且准确的申请要件与所需材料，请务必查阅[出入国在留管理厅](https://www.moj.go.jp/isa/)的官方信息。",
    vi: "Nội dung trên trang này chỉ mang tính tham khảo chung. Để biết yêu cầu mới nhất và chính xác nhất về điều kiện và giấy tờ cần thiết, vui lòng tham khảo thông tin từ [Cơ quan Dịch vụ Xuất nhập cảnh Nhật Bản](https://www.moj.go.jp/isa/).",
    ko: "본 페이지의 내용은 일반적인 참고용입니다. 최신이며 정확한 신청 요건 및 구비서류는 반드시 [출입국재류관리청](https://www.moj.go.jp/isa/)의 공식 정보를 확인해 주세요.",
  };
  const DEFAULT_NOTE_TITLE_MAP: Record<string, string> = {
    ja: "ご注意",
    en: "Notice",
    zh: "注意",
    vi: "Lưu ý",
    ko: "주의",
  };
  // Default to 'abroad' for backward compatibility; we'll set to the first available stage once docs load
  const [stage, setStage] = useState<StageKey>("abroad");
  const initializedDefaultStage = useRef(false);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  type CheckMap = Record<string, boolean>;
  const [checks, setChecks] = useState<CheckMap>({});
  type ChoiceMap = Record<string, number | null>;
  const [choices, setChoices] = useState<ChoiceMap>({});
  const [collapsed, setCollapsed] = useState<Record<C, boolean>>({} as Record<C, boolean>);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setChecks(JSON.parse(raw) as CheckMap);
      const rawChoices = window.localStorage.getItem(storageKey + ":choices");
      if (rawChoices) setChoices(JSON.parse(rawChoices) as ChoiceMap);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(checks));
    } catch {}
  }, [checks, storageKey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey + ":choices", JSON.stringify(choices));
    } catch {}
  }, [choices, storageKey]);

  const ACTIVE_DOCS = studyDocs;
  const META = meta;

  const categories = useMemo(() => {
    // ACTIVE_DOCS 可能存在但当前 stage 尚未提供（如组件默认 stage 为 'abroad'，而数据仅含 'change'/'extend'）
    // 初次渲染会在下面的 useEffect 中修正 stage，这里需保证有安全的空对象回退以避免读取 undefined 抛错。
    if (!ACTIVE_DOCS) return {} as Record<C, DocItem[]>;
    const byStage = (ACTIVE_DOCS as any)[stage] as Record<C, DocItem[]> | undefined;
    return (byStage ?? ({} as Record<C, DocItem[]>));
  }, [stage, ACTIVE_DOCS]);

  const effectiveCatOrder = useMemo(() => {
    const keys = Object.keys(categories) as C[];
    return (categoryOrder && categoryOrder.length ? categoryOrder : keys);
  }, [categoryOrder, categories]);

  const resolveColor = (cat: C): ColorConfig => {
    const fallback: ColorConfig = {
      titleDot: String(cat).toLowerCase().includes("optional") ? "bg-amber-400" : "bg-teal-500",
      badgeBg: "bg-slate-50",
      badgeText: "text-slate-600",
      badgeBorder: "border-slate-200",
      checkboxAccent: "accent-slate-700",
    };
    const fromMap = colors?.[cat as keyof typeof colors] as ColorConfig | undefined;
    return fromMap ?? fallback;
  };

  const stageTabs: { key: StageKey; label: string; count: number }[] = ACTIVE_DOCS
    ? (Object.keys(ACTIVE_DOCS) as StageKey[]).map((k) => {
        const groups = Object.values(
          ACTIVE_DOCS[k] as unknown as Record<string, string[]>
        );
        const count = groups.reduce((acc: number, arr: string[]) => acc + arr.length, 0);
        return {
          key: k,
          label: META?.stageLabels?.[k] ?? k,
          count,
        };
      })
    : [];

  // On first load of docs, set default to the first available stage (so the first tab is active by default).
  // Afterwards, if the current stage becomes unavailable (data shape changes), fall back to the first.
  useEffect(() => {
    if (!ACTIVE_DOCS) return;
    const first = (Object.keys(ACTIVE_DOCS) as StageKey[])[0];
    if (!initializedDefaultStage.current) {
      if (first && first !== stage) setStage(first);
      initializedDefaultStage.current = true;
      return;
    }
    if (!(stage in ACTIVE_DOCS) && first && first !== stage) {
      setStage(first);
    }
  }, [ACTIVE_DOCS]);

  if (!ACTIVE_DOCS) {
    return (
      <section className="mt-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-700">
          <div className="text-sm">{META?.title || "Documents"}</div>
          <div className="mt-1 text-[13px] text-slate-500">{META?.ui?.none || "暂无内容"}</div>
        </div>
      </section>
    );
  }

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
                filename={`${META?.title ?? "VisaDocs"}-${META?.stageLabels?.[stage] ?? stage}`}
                onBeforePrint={async () => {
                  const prev = collapsed;
                  const expandedAll = effectiveCatOrder.reduce((acc, k) => {
                    (acc as any)[k] = false;
                    return acc;
                  }, {} as Record<C, boolean>);
                  setCollapsed(expandedAll);
                  await new Promise((r) => requestAnimationFrame(() => r(null)));
                  (window as any).__visaDocsPrevCollapsed = prev;
                }}
                onAfterPrint={async () => {
                  const prev = (window as any).__visaDocsPrevCollapsed as Record<C, boolean> | undefined;
                  if (prev) setCollapsed(prev);
                  (window as any).__visaDocsPrevCollapsed = undefined;
                }}
                className={"inline-flex h-9 items-center rounded-xl px-3 text-sm transition border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 shadow-sm"}
              >
                {META?.actions?.pdf ?? "PDF"}
              </PrintToPdfButton>
            </div>
          </div>
          <div className="mt-3 h-px bg-gradient-to-r from-slate-200/80 via-slate-200/60 to-transparent" data-hide-print />
          <div aria-hidden className="mb-2 mt-1 hidden print:block">
            <h1 className="text-[18px] font-semibold text-slate-900">
              {META.title}
              <span className="ml-2 text-slate-500">— {META?.stageLabels?.[stage] ?? stage}</span>
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

      <div data-export-root className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {effectiveCatOrder.map((cat) => {
          const items = (categories as Record<string, DocItem[]>)[cat as string] || [];
          const title = (META?.categoryLabels?.[cat as keyof typeof META.categoryLabels] ?? (cat as string)) as string;
          const color = resolveColor(cat);

          const itemKey = (idx: number) => `${locale}:${stage}:${String(cat)}:${idx}`;
          const completedCount = mounted
            ? items.reduce((acc, itm, idx) => {
                const baseKey = itemKey(idx);
                if (isGroupItem(itm)) {
                  // group considered completed if any choice selected
                  return checks[baseKey] ? acc + 1 : acc;
                }
                return checks[baseKey] ? acc + 1 : acc;
              }, 0)
            : 0;
          const totalCount = items.length || 1;
          const progress = mounted ? Math.round((completedCount / totalCount) * 100) : 0;
          const isCollapsed = collapsed[cat as keyof typeof collapsed] as boolean;

          return (
            <article
              data-doc-card
              data-cat={String(cat)}
              key={String(cat)}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-900/5 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${color.titleDot}`} />
                  <h4 className="text-[16px] font-semibold text-slate-900" data-card-title>
                    {title}
                  </h4>
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
                    {isCollapsed ? META?.ui?.expand ?? "展开" : META?.ui?.collapse ?? "收起"}
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{META?.ui?.progress ?? "完成度"}</span>
                  <span>
                    {completedCount}/{totalCount}（{progress}%）
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100" data-progress-track>
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#04c4b6] via-[#039991] to-[#028074]"
                    data-progress-fill
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {!isCollapsed ? (
                <ul className="mt-4 space-y-2">
                  {items.map((rawItem, i) => {
                    const baseKey = itemKey(i);
                    const group = isGroupItem(rawItem) ? rawItem : null;
                    if (group) {
                      const parentChecked = !!checks[baseKey];
                      const pick = group.pick === "any" ? "any" : "one"; // default 'one'
                      return (
                        <li key={baseKey} className="flex flex-col gap-2 text-[14px]">
                          <div className="flex items-start gap-3">
                            <input
                              id={baseKey}
                              type="checkbox"
                              className={`mt-1 h-4 w-4 rounded ${color.checkboxAccent}`}
                              checked={mounted ? parentChecked : false}
                              onChange={(e) => {
                                const v = e.target.checked;
                                setChecks((m) => ({ ...m, [baseKey]: v }));
                                if (!v) {
                                  setChoices((m) => ({ ...m, [baseKey]: null }));
                                } else if (v && pick === "one" && choices[baseKey] == null) {
                                  setChoices((m) => ({ ...m, [baseKey]: 0 }));
                                }
                              }}
                            />
                            <label
                              htmlFor={baseKey}
                              className={"cursor-pointer leading-6 block flex-1 " + (parentChecked ? "text-slate-700" : "text-slate-700")}
                            >
                              {group.group}
                              {pick === "one" && <span className="ml-2 text-[14px] text-slate-600 align-baseline">（以下いずれか1点）</span>}
                            </label>
                          </div>
                          <div className="ml-7 space-y-1">
                            {group.options.map((opt, idx) => {
                              const radioId = `${baseKey}:opt:${idx}`;
                              const selectedIdx = choices[baseKey] ?? null;
                              const selected = selectedIdx === idx;
                              return (
                                <label key={radioId} htmlFor={radioId} className="flex items-center gap-2 text-[14px]">
                                  <input
                                    id={radioId}
                                    type={pick === "one" ? "radio" : "checkbox"}
                                    name={pick === "one" ? baseKey + ":group" : radioId}
                                    className={`h-3.5 w-3.5 ${pick === "one" ? color.checkboxAccent : color.checkboxAccent}`}
                                    checked={mounted ? (pick === "one" ? selected : !!checks[`${baseKey}:child:${idx}`]) : false}
                                    onChange={() => {
                                      if (pick === "one") {
                                        setChoices((m) => ({ ...m, [baseKey]: idx }));
                                        setChecks((m) => ({ ...m, [baseKey]: true }));
                                      } else {
                                        setChecks((m) => ({ ...m, [baseKey]: true, [`${baseKey}:child:${idx}`]: !checks[`${baseKey}:child:${idx}`] }));
                                      }
                                    }}
                                  />
                                  <span className={
                                    pick === "one"
                                      ? (selected ? "line-through text-slate-400" : "text-slate-700")
                                      : (!!checks[`${baseKey}:child:${idx}`] ? "line-through text-slate-400" : "text-slate-700")
                                  }>{opt}</span>
                                </label>
                              );
                            })}
                          </div>
                        </li>
                      );
                    }
                    // simple string item
                    const checked = !!checks[baseKey];
                    return (
                      <li key={baseKey} className="flex items-start gap-3 text-[14px]">
                        <input
                          id={baseKey}
                          type="checkbox"
                          className={`mt-1 h-4 w-4 rounded ${color.checkboxAccent}`}
                          checked={mounted ? checked : false}
                          onChange={(e) => {
                            const v = e.target.checked;
                            setChecks((m) => ({ ...m, [baseKey]: v }));
                          }}
                        />
                        <label
                          htmlFor={baseKey}
                          className={"cursor-pointer leading-6 block flex-1 " + (checked ? "text-slate-400 line-through" : "text-slate-700")}
                        >
                          {String(rawItem)}
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
        const noteText = META?.note ?? DEFAULT_NOTE_MAP[locale] ?? DEFAULT_NOTE_MAP.ja;
        const noteTitle = META?.ui?.noteTitle ?? DEFAULT_NOTE_TITLE_MAP[locale] ?? DEFAULT_NOTE_TITLE_MAP.ja;
        return noteText ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-2 flex items-center gap-2 text-slate-700">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-200 text-red-800">!</span>
              <span className="text-sm font-medium">{noteTitle}</span>
            </div>
            <Markdown className="prose prose-slate max-w-none text-sm">{noteText}</Markdown>
          </div>
        ) : null;
      })()}

      {META?.tips ? (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700">i</span>
            <span className="text-sm font-medium">{META?.ui?.hint ?? "ヒント"}</span>
          </div>
          <Markdown className="prose prose-slate max-w-none text-sm">{META.tips}</Markdown>
        </div>
      ) : null}
    </section>
  );
}
