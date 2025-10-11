import type { Locale } from "@/i18n/locales";

export type VisaCategoryKey = 'work' | 'status-family' | 'study-training' | 'short-others';

export type VisaCategory = {
  key: VisaCategoryKey;
  names: Partial<Record<Locale, string>>;
  visas: string[]; // visa slug list under this category
};

export const visaCategories: readonly VisaCategory[] = [
  {
    key: 'work',
    names: {
      ja: '就労系',
      en: 'Work',
      zh: '就业类',
      vi: 'Lao động',
      ko: '취업',
    },
    visas: [
      'engineer-humanities-international',
      'business-manager',
      'skilled-labor',
      'care-worker',
      'specified-skilled-worker',
      'highly-skilled-professional',
    ],
  },
  {
    key: 'status-family',
    names: {
      ja: '身分・家族',
      en: 'Status / Family',
      zh: '身份・家族',
      vi: 'Tư cách / Gia đình',
      ko: '신분·가족',
    },
    visas: [
      'permanent-resident',
      'spouse-of-japanese-national',
      'spouse-of-permanent-resident',
      'long-term-resident',
      'dependent',
    ],
  },
  {
    key: 'study-training',
    names: {
      ja: '留学・研修',
      en: 'Study / Training',
      zh: '留学・研修',
      vi: 'Du học / Đào tạo',
      ko: '유학·연수',
    },
    visas: [
      'student',
      'trainee',
      'technical-intern-training',
    ],
  },
  {
    key: 'short-others',
    names: {
      ja: '短期・その他',
      en: 'Short stay / Others',
      zh: '短期・其他',
      vi: 'Ngắn hạn / Khác',
      ko: '단기·기타',
    },
    visas: [
      'visiting-relatives',
      'temporary-visitor',
      'designated-activities',
    ],
  },
] as const;

export function getAllCategoryParams(locales: readonly Locale[]) {
  return locales.flatMap((locale) => visaCategories.map((c) => ({ locale, cat: c.key })));
}
