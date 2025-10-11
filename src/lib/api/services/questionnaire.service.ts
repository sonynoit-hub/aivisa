import { http } from "../client";
import { EP } from "../endpoints";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

export type QuestionnaireValues = Record<string, string | number | boolean | null>;

export async function submitQuestionnaire(values: QuestionnaireValues, locale: string) {
  if (USE_MOCK) {
    console.log("submitQuestionnaire mock:", values, locale);
    return { ok: true };
  }
  return http(EP.questionnaire.submit, { method: "POST", body: { ...values, locale } });
}

export async function submitContact(values: QuestionnaireValues, locale: string) {
  if (USE_MOCK) {
    console.log("submitContact mock:", values, locale);
    return { ok: true };
  }
  return http(EP.questionnaire.contact, { method: "POST", body: { ...values, locale } });
}
