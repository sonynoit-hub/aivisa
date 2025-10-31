"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type QA = { q: string; a?: string };

export default function FaqClient() {
  const t = useTranslations("faq");
  const raw = t.raw("items");
  const items: QA[] = Array.isArray(raw) ? (raw as QA[]) : [];
  const [openSet, setOpenSet] = useState<Set<number>>(new Set());
  const toggle = (idx: number) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-soft">
        <dl className="divide-y divide-slate-200">
          {items.map((item, i) => {
            if (!item || typeof item.q !== "string" || !item.q.trim()) return null;
            const open = openSet.has(i);
            const regionId = `faq-${i}`;
            return (
              <div key={i} className="py-3 sm:py-4">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={regionId}
                  onClick={() => toggle(i)}
                  className="w-full text-left flex items-start justify-between gap-3 group"
                >
                  <span className="text-[15px] font-semibold text-slate-900">{item.q}</span>
                  <span
                    className={`mt-0.5 shrink-0 text-slate-400 transition-transform group-hover:text-slate-600 ${open ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {item.a && (
                  <dd id={regionId} role="region" className={`${open ? "mt-2" : "hidden"}`}>
                    <p className="text-[14px] leading-6 text-slate-700">{item.a}</p>
                  </dd>
                )}
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="py-2 text-slate-500 text-sm">—</div>
          )}
        </dl>
      </div>
    </section>
  );
}
