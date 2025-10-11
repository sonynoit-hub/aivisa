import { QuestionnaireForm } from "@/features/questionnaire/QuestionnaireForm";

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
