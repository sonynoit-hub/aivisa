import { QuestionnaireForm } from "@/features/questionnaire/QuestionnaireForm";
import type { Metadata } from 'next';
import { getSeoMeta } from '@/config/seo-tags';
import { locales, defaultLocale, type Locale } from '@/i18n/locales';

type Props = { params: Promise<{ locale: string }> };

export default async function QuestionnairePage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h2 className="text-2xl font-semibold mb-4">ビザ質問票</h2>
      <QuestionnaireForm locale={locale} />
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale: candidate } = await params;
  const locale: Locale = candidate && (locales as readonly string[]).includes(candidate) ? (candidate as Locale) : defaultLocale;
  const m = getSeoMeta(locale, 'questionnaire');
  return { description: m.description, keywords: m.keywords };
}
