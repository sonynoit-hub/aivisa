"use client";

import { useTranslations } from "next-intl";
import AdSlots from "./AdSlots";
import type { AdSlotsProps } from "./AdSlots";

type Props = AdSlotsProps & {
  className?: string;
};

export default function AdSection({ className, ...props }: Props) {
  const t = useTranslations("home");
  return (
    <section className={className ?? "mt-6"}>
      <div className="flex items-end justify-between">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          {t("advisors.title")}
        </h2>
        <div className="text-sm text-slate-500">{t("advisors.note")}</div>
      </div>
      <div className="mt-2 h-px bg-slate-200/80" />
      <div className="mt-4">
        <AdSlots {...props} />
      </div>
    </section>
  );
}
