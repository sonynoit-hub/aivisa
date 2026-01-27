"use client";

import VisaDocs, { type VisaDocsMeta, type ColorConfig } from "./components/VisaDocs";
import AdSection from "@/components/ad/AdSection";
import { useMemo } from "react";

type CategoryKey = "applicant" | "optional" | "company";

const CAT_COLORS: Record<CategoryKey, ColorConfig> = {
  applicant: { titleDot: "bg-teal-500", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-700" },
  optional: { titleDot: "bg-amber-400", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-700" },
  company: { titleDot: "bg-teal-500", badgeBg: "bg-slate-50", badgeText: "text-slate-600", badgeBorder: "border-slate-200", checkboxAccent: "accent-slate-700" },
};

type StudyDocsData = Record<"inJapan" | "change" | "extend", Record<CategoryKey, string[]>>;
type Props = { locale?: string; studyDocs?: StudyDocsData; studyDocsMeta?: VisaDocsMeta<CategoryKey> };

export default function TempDocs({ locale, studyDocs, studyDocsMeta }: Props) {
  const categoryOrder = useMemo(() => ["applicant", "optional", "company"] as const, []);
  return (
    <div className="space-y-6">
      <VisaDocs
        locale={locale}
        storageKey="tempDocs:checks"
        categoryOrder={categoryOrder}
        colors={CAT_COLORS}
        studyDocs={studyDocs}
        meta={studyDocsMeta}
      />
  <AdSection page="detail" slot="detail_bottom" categorySlug="temp" locale={locale} />
    </div>
  );
}
