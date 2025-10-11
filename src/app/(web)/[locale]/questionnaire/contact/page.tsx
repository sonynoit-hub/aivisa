import { ContactForm } from "@/features/questionnaire/ContactForm";
import { getTranslations } from "next-intl/server";
import { defaultLocale } from "@/i18n/locales";

type Params = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Params) {
  // 明确使用路由参数中的 locale，避免服务端误用默认英文
  const { locale: localeFromParams } = await params;
  const effectiveLocale = localeFromParams ?? defaultLocale;
  const t = await getTranslations({ locale: effectiveLocale, namespace: "forms.contact" });
  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="mx-auto max-w-screen-sm px-4 pb-24 pt-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
        <p className="mt-2 text-[14px] leading-6 text-slate-700">
          {t("description")}
        </p>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <ContactForm />
        </section>
      </div>
    </main>
  );
}
