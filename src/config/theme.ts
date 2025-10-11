import type { VisaCategoryKey } from "@/data/visaCategories";

export const THEME = {
  cat: {
    work: {
      base: "text-indigo-600",
      ring: "ring-indigo-100",
      tileBg: "bg-indigo-500",
      chipBg: "bg-indigo-50",
      chipText: "text-indigo-700",
      chipHoverBg: "hover:bg-indigo-100",
      border: "border-indigo-100",
    },
    "status-family": {
      base: "text-emerald-600",
      ring: "ring-emerald-100",
      tileBg: "bg-emerald-500",
      chipBg: "bg-emerald-50",
      chipText: "text-emerald-700",
      chipHoverBg: "hover:bg-emerald-100",
      border: "border-emerald-100",
    },
    "study-training": {
      base: "text-violet-600",
      ring: "ring-violet-100",
      tileBg: "bg-violet-500",
      chipBg: "bg-violet-50",
      chipText: "text-violet-700",
      chipHoverBg: "hover:bg-violet-100",
      border: "border-violet-100",
    },
    "short-others": {
      base: "text-sky-600",
      ring: "ring-sky-100",
      tileBg: "bg-sky-500",
      chipBg: "bg-sky-50",
      chipText: "text-sky-700",
      chipHoverBg: "hover:bg-sky-100",
      border: "border-sky-100",
    },
  } as Record<VisaCategoryKey, { base: string; ring: string; tileBg: string; chipBg: string; chipText: string; chipHoverBg: string; border: string }>,
  // 每个 slug 的默认明暗，仅在所属类别色相内调整
  slug: {
    // Work
    "engineer-humanities-international": "text-indigo-600",
    "business-manager": "text-indigo-700",
    "skilled-labor": "text-indigo-500",
    "care-worker": "text-indigo-600",
    "specified-skilled-worker": "text-indigo-500",
    "highly-skilled-professional": "text-indigo-700",

    // Status / Family
    "permanent-resident": "text-emerald-700",
    "spouse-of-japanese-national": "text-emerald-600",
    "spouse-of-permanent-resident": "text-emerald-500",
    "long-term-resident": "text-emerald-600",
    dependent: "text-emerald-500",

    // Study / Training
    student: "text-violet-600",
    trainee: "text-violet-500",
    "technical-intern-training": "text-violet-700",

    // Short / Others
    "temporary-visitor": "text-sky-600",
    "designated-activities": "text-sky-500",
  } as Record<string, string>,
};
