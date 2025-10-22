"use client";

import VisaDocs, { type VisaDocsMeta, type ColorConfig } from "./components/VisaDocs";
import AdSection from "@/components/ad/AdSection";
import { useMemo } from "react";

// PR ページでは "扶養者" セクションも存在するため、dependents を含める
type CategoryKey = "applicant" | "dependents" | "optional";

const CAT_COLORS: Record<CategoryKey, ColorConfig> = {
  applicant: { titleDot: "bg-teal-500", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-700" },
  dependents: { titleDot: "bg-teal-500", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-700" },
  optional: { titleDot: "bg-amber-400", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-700" },
};

// 入力データの stage キーは pr.json に合わせて多様なため、厳格な型付けは避ける
type Props = { locale?: string; studyDocs?: any; studyDocsMeta?: VisaDocsMeta<CategoryKey> };

export default function PrDocs({ locale, studyDocs, studyDocsMeta }: Props) {
  // PR（永住）ページは "扶養者" セクションを表示する
  const categoryOrder = useMemo(() => ["applicant", "dependents", "optional"] as const, []);
  return (
    <div className="space-y-6">
      <VisaDocs
        locale={locale}
        storageKey="prDocs:checks"
        categoryOrder={categoryOrder}
        colors={CAT_COLORS}
        studyDocs={studyDocs as any}
        meta={studyDocsMeta}
      />
  <AdSection page="category" slot="detail_bottom" categorySlug="pr" locale={locale} />
    </div>
  );
}
