import type { Locale } from "@/i18n/locales";

export type VisaCatalogItem = {
  slug: string; // URL stable slug
  names: Partial<Record<Locale, string>>; // localized display name (ja as source of truth)
  subItems?: Partial<Record<Locale, string[]>>; // optional child labels for menu display
};

export const visaCatalog: readonly VisaCatalogItem[] = [
  // Work
  {
    slug: "engineer-humanities-international",
    names: {
      ja: "技術・人文知識・国際業務",
  en: "Engineer・Specialist in Humanities・International Services",
  zh: "技术・人文知识・国际业务",
  vi: "Kỹ sư・nhân văn・quốc tế",
      ko: "기술·인문지식·국제업무",
    },
  },
  {
    slug: "business-manager",
    names: {
      ja: "経営・管理",
      en: "Business Manager",
  zh: "经营・管理",
      vi: "Kinh doanh",
      ko: "경영·관리",
    },
  },
  {
    slug: "skilled-labor",
    names: {
      ja: "技能",
      en: "Skilled Labor",
      zh: "技能",
      vi: "Lao động kỹ năng",
      ko: "기능",
    },
  },
  {
    slug: "technical-intern-training",
    names: {
      ja: "技能実習",
      en: "Technical Intern Training",
      zh: "技能实习",
      vi: "Thực tập sinh kỹ năng",
      ko: "기능실습",
    },
  },
  {
    slug: "care-worker",
    names: {
      ja: "介護",
      en: "Care Worker",
      zh: "介护",
      vi: "Hộ lý",
      ko: "개호",
    },
  },
  {
    slug: "specified-skilled-worker",
    names: {
      ja: "特定技能",
      en: "Specified Skilled Worker",
      zh: "特定技能",
      vi: "Lao động kỹ năng đặc định",
      ko: "특정기능",
    },
  },
  {
    slug: "highly-skilled-professional",
    names: {
      ja: "高度専門職",
      en: "Highly Skilled Professional",
      zh: "高度人材",
      vi: "Nhân lực chất lượng cao",
      ko: "고도전문직",
    },
    subItems: {
      ja: [
        "高度専門職1号（イ）学術研究系",
        "高度専門職1号（ロ）技術・専門系",
        "高度専門職1号（ハ）経営・管理系",
        "高度専門職2号",
      ],
      en: [
        "HSP Type 1 (i) Academic research",
  "HSP Type 1 (ro) Technical・Specialist",
        "HSP Type 1 (ha) Business・Management",
        "HSP Type 2",
      ],
      zh: [
        "高度人材1号（イ）学术研究类",
  "高度人材1号（ロ）技术・专业类",
        "高度人材1号（ハ）经营・管理类",
        "高度人材2号",
      ],
      vi: [
        "HSP loại 1 (i) Nghiên cứu học thuật",
  "HSP loại 1 (ro) Kỹ thuật・Chuyên môn",
        "HSP loại 1 (ha) Kinh doanh・Quản lý",
        "HSP loại 2",
      ],
      ko: [
        "고도전문직 1호 (이) 학술연구계",
        "고도전문직 1호 (로) 기술·전문계",
        "고도전문직 1호 (하) 경영·관리계",
        "고도전문직 2호",
      ],
    },
  },

  // Status/Family
  {
    slug: "permanent-resident",
    names: {
      ja: "永住者",
      en: "Permanent Resident",
      zh: "永住者",
      vi: "Vĩnh trú",
      ko: "영주자",
    },
  },
  {
    slug: "spouse-of-japanese-national",
    names: {
      ja: "日本人の配偶者等",
      en: "Spouse or Child of Japanese National",
  zh: "日本人的配偶・子女",
      vi: "Vợ/chồng/con của người Nhật",
      ko: "일본인의 배우자 등",
    },
  },
  {
    slug: "spouse-of-permanent-resident",
    names: {
      ja: "永住者の配偶者等",
      en: "Spouse or Child of Permanent Resident",
  zh: "永住者的配偶・子女",
      vi: "Vợ/chồng/con của người có vĩnh trú",
      ko: "영주자의 배우자 등",
    },
  },
  {
    slug: "long-term-resident",
    names: {
      ja: "定住者",
      en: "Long-term Resident",
      zh: "定住者",
      vi: "Định trú",
      ko: "정주자",
    },
  },
  {
    slug: "dependent",
    names: {
      ja: "家族滞在",
      en: "Dependent",
      zh: "家属滞在",
      vi: "Đoàn tụ gia đình",
      ko: "가족체류",
    },
  },

  // Study/Training
  {
    slug: "student",
    names: {
      ja: "留学",
      en: "Study Abroad",
      zh: "留学",
      vi: "Du học",
      ko: "유학",
    },
  },
  {
    slug: "trainee",
    names: {
      ja: "研修",
      en: "Trainee",
      zh: "研修",
      vi: "Thực tập sinh",
      ko: "연수",
    },
  },

  // Short Stay / Others
  {
    slug: "visiting-relatives",
    names: {
      ja: "親族訪問",
      en: "Visiting Relatives",
      zh: "探亲",
      vi: "Thăm thân nhân",
      ko: "친족 방문",
    },
  },
  {
    slug: "temporary-visitor",
    names: {
      ja: "短期滞在",
      en: "Temporary Visitor",
      zh: "短期滞在",
      vi: "Lưu trú ngắn hạn",
      ko: "단기체류",
    },
  },
  {
    slug: "designated-activities",
    names: {
      ja: "特定活動",
      en: "Designated Activities",
      zh: "特定活动",
      vi: "Hoạt động được chỉ định",
      ko: "특정활동",
    },
    subItems: {
      ja: ["ワーキングホリデー", "留学生の就職活動"],
      en: ["Working Holiday", "Job hunting for international students"],
      zh: ["打工度假", "留学生的就职活动"],
      vi: ["Kỳ nghỉ làm việc", "Tìm việc cho du học sinh"],
      ko: ["워킹홀리데이", "유학생 구직활동"],
    },
  },
] as const;

export function getVisaName(slug: string, locale: Locale): string | undefined {
  const item = visaCatalog.find((v) => v.slug === slug);
  return item?.names[locale] ?? item?.names.ja;
}

export function getAllVisaParams(locales: readonly Locale[]) {
  return locales.flatMap((locale) => visaCatalog.map((v) => ({ locale, slug: v.slug })));
}
