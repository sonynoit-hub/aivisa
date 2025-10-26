"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
// Metadata moved to layout.tsx (server) to avoid exporting from client component

type Category = "research" | "tech" | "business";
type Option = { id: number; label: string; value: number };
type Section = { title: string; options?: Option[]; key: string; multiple?: boolean };

export default function HspPointsPage() {
  const t = useTranslations("tools.hspPoints");
  const [category, setCategory] = useState<Category>("research");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number | number[]>>({});

  const sharedAcademicOptions: Option[] = useMemo(() => ([
    { id: 1, label: t("academic.shared.doctoral"), value: 30 },
    { id: 2, label: t("academic.shared.professional"), value: 25 },
    { id: 3, label: t("academic.shared.master"), value: 20 },
    { id: 4, label: t("academic.shared.bachelor"), value: 10 },
  ]), [t]);
  const researchAcademicOptions: Option[] = useMemo(() => ([
    { id: 1, label: t("academic.shared.doctoral"), value: 30 },
    { id: 3, label: t("academic.shared.master"), value: 20 },
    { id: 4, label: t("academic.shared.bachelor"), value: 10 },
  ]), [t]);
  const businessAcademicOptions: Option[] = useMemo(() => ([
    { id: 1, label: t("academic.business.professional"), value: 25 },
    { id: 2, label: t("academic.business.master"), value: 20 },
    { id: 3, label: t("academic.business.bachelor"), value: 10 },
  ]), [t]);
  const academicOptions: Record<Category, Option[]> = useMemo(() => ({
    research: researchAcademicOptions,
    tech: sharedAcademicOptions,
    business: businessAcademicOptions,
  }), [researchAcademicOptions, sharedAcademicOptions, businessAcademicOptions]);

  const workExperienceOptions: Record<Category, Option[]> = useMemo(() => ({
    research: [
      { id: 1, label: t("workExperience.research.moreThan7"), value: 15 },
      { id: 2, label: t("workExperience.research.moreThan5"), value: 10 },
      { id: 3, label: t("workExperience.research.moreThan3"), value: 5 },
    ],
    tech: [
      { id: 1, label: t("workExperience.tech.moreThan10"), value: 20 },
      { id: 2, label: t("workExperience.tech.moreThan7"), value: 15 },
      { id: 3, label: t("workExperience.tech.moreThan5"), value: 10 },
      { id: 4, label: t("workExperience.tech.moreThan3"), value: 5 },
    ],
    business: [
      { id: 1, label: t("workExperience.business.moreThan10"), value: 25 },
      { id: 2, label: t("workExperience.business.moreThan7"), value: 20 },
      { id: 3, label: t("workExperience.business.moreThan5"), value: 15 },
      { id: 4, label: t("workExperience.business.moreThan3"), value: 10 },
    ],
  }), [t]);

  const sharedAgeOptions: Option[] = useMemo(() => ([
    { id: 1, label: t("age.under30"), value: 15 },
    { id: 2, label: t("age.30to34"), value: 10 },
    { id: 3, label: t("age.35to39"), value: 5 },
    { id: 4, label: t("age.over40"), value: 0 },
  ]), [t]);
  const ageOptions: Partial<Record<Category, Option[]>> = useMemo(() => ({
    research: sharedAgeOptions,
    tech: sharedAgeOptions,
  }), [sharedAgeOptions]);

  const sharedSalaryOptions: Option[] = useMemo(() => ([
    { id: 1, label: t("salary.shared.over10M"), value: 40 },
    { id: 2, label: t("salary.shared.over9M"), value: 35 },
    { id: 3, label: t("salary.shared.over8M"), value: 30 },
    { id: 4, label: t("salary.shared.over7M"), value: 25 },
    { id: 5, label: t("salary.shared.over6M"), value: 20 },
    { id: 6, label: t("salary.shared.over5M"), value: 15 },
    { id: 7, label: t("salary.shared.over4M"), value: 10 },
  ]), [t]);
  const businessSalaryOptions: Option[] = useMemo(() => ([
    { id: 1, label: t("salary.business.over30M"), value: 50 },
    { id: 2, label: t("salary.business.over25M"), value: 40 },
    { id: 3, label: t("salary.business.over20M"), value: 30 },
    { id: 4, label: t("salary.business.over15M"), value: 20 },
    { id: 5, label: t("salary.business.over10M"), value: 10 },
  ]), [t]);
  const salaryOptions: Record<Category, Option[]> = useMemo(() => ({
    research: sharedSalaryOptions,
    tech: sharedSalaryOptions,
    business: businessSalaryOptions,
  }), [sharedSalaryOptions, businessSalaryOptions]);

  const positionOptions: Partial<Record<Category, Option[]>> = useMemo(() => ({
    business: [
      { id: 1, label: t("position.business.repDirector"), value: 10 },
      { id: 2, label: t("position.business.director"), value: 5 },
    ],
  }), [t]);

  const researchAchievements: Partial<Record<Category, Option[]>> = useMemo(() => ({
    research: [
      { id: 1, label: t("researchAchievements.research.patented"), value: 20 },
      { id: 2, label: t("researchAchievements.research.fundedProjects"), value: 20 },
      { id: 3, label: t("researchAchievements.research.published3plus"), value: 20 },
      { id: 4, label: t("researchAchievements.research.otherAchievements"), value: 20 },
      { id: 5, label: t("researchAchievements.research.if2Apply"), value: 25 },
    ],
    tech: [
      { id: 1, label: t("researchAchievements.tech.patented"), value: 15 },
      { id: 2, label: t("researchAchievements.tech.fundedProjects"), value: 15 },
      { id: 3, label: t("researchAchievements.tech.published3plus"), value: 15 },
      { id: 4, label: t("researchAchievements.tech.otherAchievements"), value: 15 },
    ],
  }), [t]);

  const licenseOptions: Partial<Record<Category, Option[]>> = useMemo(() => ({
    tech: [
      { id: 1, label: t("license.tech.national"), value: 5 },
      { id: 2, label: t("license.tech.itExam"), value: 5 },
      { id: 3, label: t("license.tech.multiple"), value: 10 },
    ],
  }), [t]);

  const organizationOptions: Option[] = useMemo(() => ([
    { id: 1, label: t("organization.innovation"), value: 10 },
    { id: 3, label: t("organization.localGov"), value: 10 },
    { id: 4, label: t("organization.smeR&D"), value: 5 },
  ]), [t]);

  const japaneseLanguageOptions: Option[] = useMemo(() => ([
    { id: 1, label: t("japaneseLanguage.jlptN1"), value: 15 },
    { id: 2, label: t("japaneseLanguage.jlptN2"), value: 10 },
  ]), [t]);

  const bonusOptions: Record<Category, Option[]> = useMemo(() => ({
    research: [
      { id: 1, label: t("bonus.research.topUnis"), value: 10 },
      { id: 2, label: t("bonus.research.supportedOrg"), value: 10 },
      { id: 5, label: t("japaneseLanguage.graduatedJapan"), value: 10 },
      { id: 3, label: t("bonus.research.foreignQual"), value: 5 },
      { id: 4, label: t("bonus.research.multipleDegrees"), value: 5 },
    ],
    tech: [
      { id: 1, label: t("bonus.tech.topUnis"), value: 10 },
      { id: 2, label: t("bonus.tech.investment"), value: 10 },
      { id: 3, label: t("bonus.tech.supportedOrg"), value: 10 },
      { id: 7, label: t("japaneseLanguage.graduatedJapan"), value: 10 },
      { id: 4, label: t("bonus.tech.foreignQual"), value: 5 },
      { id: 5, label: t("bonus.tech.multipleDegrees"), value: 5 },
      { id: 6, label: t("bonus.tech.jica"), value: 5 },
    ],
    business: [
      { id: 1, label: t("bonus.business.topUnis"), value: 10 },
      { id: 2, label: t("bonus.business.investment"), value: 10 },
      { id: 3, label: t("bonus.business.supportedOrg"), value: 10 },
      { id: 8, label: t("japaneseLanguage.graduatedJapan"), value: 10 },
      { id: 4, label: t("bonus.business.foreignQual"), value: 5 },
      { id: 5, label: t("bonus.business.jica"), value: 5 },
      { id: 6, label: t("bonus.business.multipleDegrees"), value: 5 },
      { id: 7, label: t("position.business.invested100M"), value: 5 },
    ],
  }), [t]);

  const references = {
    heading: t("references.heading"),
    agency: t("references.agency"),
    description: t("references.description"),
    disclaimer: t("references.disclaimer"),
    jpExcel: t("references.jpExcel"),
    enExcel: t("references.enExcel"),
    jpUrl: "https://www.moj.go.jp/isa/content/930001673.xls",
    enUrl: "https://www.moj.go.jp/isa/content/001398888.xls",
  };

  const handleSelect = (section: string, optionId: number, multiple = false) => {
    if (multiple) {
      const current = Array.isArray(selectedOptions[section]) ? (selectedOptions[section] as number[]) : [];
      if (current.includes(optionId)) {
        setSelectedOptions((prev) => ({ ...prev, [section]: current.filter((id) => id !== optionId) }));
      } else {
        setSelectedOptions((prev) => ({ ...prev, [section]: [...current, optionId] }));
      }
    } else {
      setSelectedOptions((prev) => ({ ...prev, [section]: optionId }));
    }
  };

  const getFilteredSalary = useCallback(() => {
    let options = salaryOptions[category];
    const selectedAgeId = selectedOptions["Age"] as number | undefined;
    if (!selectedAgeId) return options;
    if ((category === "research" || category === "tech") && selectedAgeId === 2) {
      options = options.filter((opt) => opt.id !== 7);
    }
    if (selectedAgeId === 3) {
      options = options.filter((opt) => opt.value >= 20);
    } else if (selectedAgeId === 4) {
      options = options.filter((opt) => opt.value >= 30);
    }
    return options;
  }, [salaryOptions, category, selectedOptions]);

  const getSectionValue = (options?: Option[], section?: string, multiple = false) => {
    if (!options || !section) return 0;
    const selected = selectedOptions[section];
    if (!selected) return 0;
    if (multiple && Array.isArray(selected)) {
      return (selected as number[]).reduce((sum, id) => sum + (options.find((opt) => opt.id === id)?.value || 0), 0);
    }
    return options.find((opt) => opt.id === selected)?.value || 0;
  };

  const sections: Section[] = useMemo(
    () => [
      { title: t("sections.academic"), options: academicOptions[category], key: "Academic" },
      { title: t("sections.workExperience"), options: workExperienceOptions[category], key: "Work Experience" },
      { title: t("sections.age"), options: ageOptions[category], key: "Age" },
      { title: t("sections.salary"), options: getFilteredSalary(), key: "Salary" },
      { title: t("sections.position"), options: positionOptions[category], key: "Position" },
      { title: t("sections.researchAchievements"), options: researchAchievements[category], key: "Research Achievements" },
      { title: t("sections.license"), options: licenseOptions[category], key: "License" },
      { title: t("sections.organizations"), options: organizationOptions, key: "Organizations" },
      { title: t("sections.japaneseLanguage"), options: japaneseLanguageOptions, key: "Japanese Language" },
      { title: t("sections.bonusPoints"), options: bonusOptions[category], key: "Bonus Points", multiple: true },
    ],
    [
      category,
      t,
      academicOptions,
      workExperienceOptions,
      ageOptions,
      positionOptions,
      researchAchievements,
      licenseOptions,
      organizationOptions,
      japaneseLanguageOptions,
      bonusOptions,
      getFilteredSalary,
    ]
  );

  const totalPoints =
    getSectionValue(academicOptions[category], "Academic") +
    getSectionValue(workExperienceOptions[category], "Work Experience") +
    getSectionValue(ageOptions[category], "Age") +
    getSectionValue(getFilteredSalary(), "Salary") +
    getSectionValue(positionOptions[category], "Position") +
    getSectionValue(researchAchievements[category], "Research Achievements") +
    getSectionValue(licenseOptions[category], "License") +
    getSectionValue(organizationOptions, "Organizations") +
    getSectionValue(japaneseLanguageOptions, "Japanese Language") +
    getSectionValue(bonusOptions[category], "Bonus Points", true);

  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="mx-auto max-w-screen-sm px-4 pb-20 pt-10">
        <div className="text-center">
          <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-tight tracking-tight text-slate-900">
            {t("title")}
          </h1>
          <p className="mt-2 text-[14px] text-slate-700">{t("subtitle")}</p>
        </div>

        <div className="mb-4 mt-5 flex text-center justify-center gap-2 flex-wrap">
          {([
            { label: `${t("categories.research")}`, value: "research" },
            { label: `${t("categories.tech")}`, value: "tech" },
            { label: `${t("categories.business")}`, value: "business" },
          ] as { label: string; value: Category }[]).map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategory(cat.value);
                setSelectedOptions({});
              }}
              className={`px-3 py-2 rounded-lg text-[14px] font-semibold transition-all ${
                category === cat.value
                  ? "text-white shadow-soft btn-primary"
                  : "bg-white border border-slate-300 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <section className="mt-2">
          {sections.map((section) =>
            (
              <div key={section.key}>
                {(() => {
                  const selected = selectedOptions[section.key];
                  const selectedIds = section.multiple && Array.isArray(selected) ? (selected as number[]) : [selected as number];
                  const options = section.options as Option[] | undefined;
                  if (!options) return null;
                  return (
                    <div className="mb-6 p-4 bg-white shadow-soft rounded-2xl border border-slate-200">
                      <h3 className="font-semibold mb-3 text-[15px] text-slate-900">{section.title}</h3>
                      <ul className="list-none space-y-2">
                        {options.map((opt) => {
                          const isSelected = section.multiple ? selectedIds.includes(opt.id) : selected === opt.id;
                          return (
                            <li key={`${section.key}-${opt.id}`}>
                              <label className={`grid grid-cols-[1fr_80px] items-center cursor-pointer p-2 rounded-lg transition-all ${
                                isSelected ? "bg-teal-50 border border-teal-200" : "hover:bg-slate-50 border border-transparent"
                              }`}>
                                <div className="flex items-start">
                                  <span
                                    className={`flex-none flex items-center justify-center w-6 h-6 min-w-[24px] min-h-[24px] rounded transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-1 focus-visible:ring-offset-white ${
                                      section.multiple
                                        ? isSelected
                                          ? "bg-teal-600 border-teal-600"
                                          : "bg-white border border-slate-300"
                                        : isSelected
                                          ? "rounded-full border-2 border-teal-600 flex items-center justify-center"
                                          : "rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-teal-400"
                                    }`}
                                    onClick={() => handleSelect(section.key, opt.id, section.multiple ?? false)}
                                    tabIndex={0}
                                    role={section.multiple ? "checkbox" : "radio"}
                                    aria-checked={isSelected}
                                  >
                                    {isSelected && (section.multiple ? (
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <span className="block w-3 h-3 bg-teal-600 rounded-full" />
                                    ))}
                                  </span>
                                  <input
                                    type={section.multiple ? "checkbox" : "radio"}
                                    name={section.key}
                                    checked={!!isSelected}
                                    onChange={() => handleSelect(section.key, opt.id, section.multiple ?? false)}
                                    className="absolute w-6 h-6 accent-teal-600"
                                    tabIndex={-1}
                                  />
                                  <span className="ml-3 text-[14px] text-slate-800">{opt.label}</span>
                                </div>
                                <span className="font-bold text-teal-600 text-right text-[14px]">
                                  {opt.value} {t("points")}
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            )
          )}
        </section>

        <div className="mt-4 p-4 bg-white shadow-soft rounded-2xl border border-slate-200">
          <div className="text-sm font-semibold text-slate-900 mb-1">{references.heading}</div>
          <div className="text-xs text-slate-600 mb-2">{references.agency}</div>
          <p className="text-[12px] text-slate-600 mb-3 leading-relaxed">{references.description}</p>
          <div className="flex flex-col gap-2">
            <a href={references.jpUrl} target="_blank" rel="noopener" className="text-indigo-600 hover:underline text-sm">
              {references.jpExcel}
            </a>
            <a href={references.enUrl} target="_blank" rel="noopener" className="text-indigo-600 hover:underline text-sm">
              {references.enExcel}
            </a>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">{references.disclaimer}</p>
        </div>

        <div className="h-16" />
      </div>

      <div className="fixed bottom-5 right-5 z-40">
        <div className="rounded-xl text-white shadow-lg backdrop-blur px-4 py-3 btn-primary">
          <div className="text-xs opacity-90">{t("totalPoints")}</div>
          <div className="text-lg font-extrabold tracking-wide text-white">
            {totalPoints} {t("points")}
          </div>
        </div>
      </div>
    </main>
  );
}

// (no generateMetadata here)
