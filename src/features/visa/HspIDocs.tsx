"use client";

import VisaDocs, { type VisaDocsMeta, type ColorConfig } from "./components/VisaDocs";
import AdSection from "@/components/ad/AdSection";
import { useMemo } from "react";

type CategoryKey = "applicant" | "company" | "optional";

const CAT_COLORS: Record<CategoryKey, ColorConfig> = {
  applicant: { titleDot: "bg-teal-500", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-700" },
  company: { titleDot: "bg-teal-500", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-700" },
  optional: { titleDot: "bg-amber-400", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-700" },
};

type StudyDocsData = Record<"abroad" | "inJapan" | "change" | "extend", Record<CategoryKey, string[]>>;
type Props = { locale?: string; studyDocs?: StudyDocsData; studyDocsMeta?: VisaDocsMeta<CategoryKey> };

export default function HspIDocs({ locale, studyDocs, studyDocsMeta }: Props) {
  const categoryOrder = useMemo(() => ["applicant", "company", "optional"] as const, []);
  return (
    <div className="space-y-6">
      <VisaDocs
        locale={locale}
        storageKey="hspIDocs:checks"
        categoryOrder={categoryOrder}
        colors={CAT_COLORS}
        studyDocs={studyDocs}
        meta={studyDocsMeta}
      />
  {/* 分类详情底部广告：高度人材1号（返回几条显示几条） */}
  <AdSection page="detail" slot="detail_bottom" categorySlug="hsp-i" locale={locale} />
    </div>
  );
}
