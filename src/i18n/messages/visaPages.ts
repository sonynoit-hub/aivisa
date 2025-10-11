// Centralized static imports for visa page i18n to satisfy Turbopack HMR
// and reduce per-page duplicate imports.

export type VisaPageSlug =
  | 'bm'
  | 'da'
  | 'hsp-ii'
  | 'care'
  | 'temp'
  | 'hsp-i'
  | 'ltr'
  | 'ssw'
  | 'skilled'
  | 'pr'
  | 'jp-spouse'
  | 'engineer'
  | 'tit'
  | 'dep'
  | 'study'
  | 'pr-spouse'
  | 'vr';

export type StageKey = 'abroad' | 'inJapan' | 'change' | 'extend';
export type UIStrings = { expand?: string; collapse?: string; progress?: string; none?: string; hint?: string };
export type ActionsStrings = { pdf?: string; pdfAria?: string };

// Shape of each visa page JSON
export type VisaPageI18n = {
  title?: string;
  summary?: string;
  html?: string;
  // Different pages store docs in different shapes; keep it flexible.
  studyDocs?: unknown;
  stageLabels?: Record<string, string>;
  categoryLabels?: Record<string, string>;
  docsTitle?: string;
  tips?: string;
  stageTips?: Partial<Record<StageKey, string>>;
  ui?: UIStrings;
  actions?: ActionsStrings;
};

// ja
import bm_ja from '@/i18n/messages/ja/visa-pages/bm.json';
import da_ja from '@/i18n/messages/ja/visa-pages/da.json';
import hsp_ii_ja from '@/i18n/messages/ja/visa-pages/hsp-ii.json';
import care_ja from '@/i18n/messages/ja/visa-pages/care.json';
import temp_ja from '@/i18n/messages/ja/visa-pages/temp.json';
import hsp_i_ja from '@/i18n/messages/ja/visa-pages/hsp-i.json';
import ltr_ja from '@/i18n/messages/ja/visa-pages/ltr.json';
import ssw_ja from '@/i18n/messages/ja/visa-pages/ssw.json';
import skilled_ja from '@/i18n/messages/ja/visa-pages/skilled.json';
import pr_ja from '@/i18n/messages/ja/visa-pages/pr.json';
import jp_spouse_ja from '@/i18n/messages/ja/visa-pages/jp-spouse.json';
import engineer_ja from '@/i18n/messages/ja/visa-pages/engineer.json';
import tit_ja from '@/i18n/messages/ja/visa-pages/tit.json';
import dep_ja from '@/i18n/messages/ja/visa-pages/dep.json';
import study_ja from '@/i18n/messages/ja/visa-pages/study.json';
import pr_spouse_ja from '@/i18n/messages/ja/visa-pages/pr-spouse.json';
import vr_ja from '@/i18n/messages/ja/visa-pages/vr.json';

// en
import bm_en from '@/i18n/messages/en/visa-pages/bm.json';
import da_en from '@/i18n/messages/en/visa-pages/da.json';
import hsp_ii_en from '@/i18n/messages/en/visa-pages/hsp-ii.json';
import care_en from '@/i18n/messages/en/visa-pages/care.json';
import temp_en from '@/i18n/messages/en/visa-pages/temp.json';
import hsp_i_en from '@/i18n/messages/en/visa-pages/hsp-i.json';
import ltr_en from '@/i18n/messages/en/visa-pages/ltr.json';
import ssw_en from '@/i18n/messages/en/visa-pages/ssw.json';
import skilled_en from '@/i18n/messages/en/visa-pages/skilled.json';
import pr_en from '@/i18n/messages/en/visa-pages/pr.json';
import jp_spouse_en from '@/i18n/messages/en/visa-pages/jp-spouse.json';
import engineer_en from '@/i18n/messages/en/visa-pages/engineer.json';
import tit_en from '@/i18n/messages/en/visa-pages/tit.json';
import dep_en from '@/i18n/messages/en/visa-pages/dep.json';
import study_en from '@/i18n/messages/en/visa-pages/study.json';
import pr_spouse_en from '@/i18n/messages/en/visa-pages/pr-spouse.json';
import vr_en from '@/i18n/messages/en/visa-pages/vr.json';

// zh
import bm_zh from '@/i18n/messages/zh/visa-pages/bm.json';
import da_zh from '@/i18n/messages/zh/visa-pages/da.json';
import hsp_ii_zh from '@/i18n/messages/zh/visa-pages/hsp-ii.json';
import care_zh from '@/i18n/messages/zh/visa-pages/care.json';
import temp_zh from '@/i18n/messages/zh/visa-pages/temp.json';
import hsp_i_zh from '@/i18n/messages/zh/visa-pages/hsp-i.json';
import ltr_zh from '@/i18n/messages/zh/visa-pages/ltr.json';
import ssw_zh from '@/i18n/messages/zh/visa-pages/ssw.json';
import skilled_zh from '@/i18n/messages/zh/visa-pages/skilled.json';
import pr_zh from '@/i18n/messages/zh/visa-pages/pr.json';
import jp_spouse_zh from '@/i18n/messages/zh/visa-pages/jp-spouse.json';
import engineer_zh from '@/i18n/messages/zh/visa-pages/engineer.json';
import tit_zh from '@/i18n/messages/zh/visa-pages/tit.json';
import dep_zh from '@/i18n/messages/zh/visa-pages/dep.json';
import study_zh from '@/i18n/messages/zh/visa-pages/study.json';
import pr_spouse_zh from '@/i18n/messages/zh/visa-pages/pr-spouse.json';
import vr_zh from '@/i18n/messages/zh/visa-pages/vr.json';

// vi
import bm_vi from '@/i18n/messages/vi/visa-pages/bm.json';
import da_vi from '@/i18n/messages/vi/visa-pages/da.json';
import hsp_ii_vi from '@/i18n/messages/vi/visa-pages/hsp-ii.json';
import care_vi from '@/i18n/messages/vi/visa-pages/care.json';
import temp_vi from '@/i18n/messages/vi/visa-pages/temp.json';
import hsp_i_vi from '@/i18n/messages/vi/visa-pages/hsp-i.json';
import ltr_vi from '@/i18n/messages/vi/visa-pages/ltr.json';
import ssw_vi from '@/i18n/messages/vi/visa-pages/ssw.json';
import skilled_vi from '@/i18n/messages/vi/visa-pages/skilled.json';
import pr_vi from '@/i18n/messages/vi/visa-pages/pr.json';
import jp_spouse_vi from '@/i18n/messages/vi/visa-pages/jp-spouse.json';
import engineer_vi from '@/i18n/messages/vi/visa-pages/engineer.json';
import tit_vi from '@/i18n/messages/vi/visa-pages/tit.json';
import dep_vi from '@/i18n/messages/vi/visa-pages/dep.json';
import study_vi from '@/i18n/messages/vi/visa-pages/study.json';
import pr_spouse_vi from '@/i18n/messages/vi/visa-pages/pr-spouse.json';
import vr_vi from '@/i18n/messages/vi/visa-pages/vr.json';

// ko
import bm_ko from '@/i18n/messages/ko/visa-pages/bm.json';
import da_ko from '@/i18n/messages/ko/visa-pages/da.json';
import hsp_ii_ko from '@/i18n/messages/ko/visa-pages/hsp-ii.json';
import care_ko from '@/i18n/messages/ko/visa-pages/care.json';
import temp_ko from '@/i18n/messages/ko/visa-pages/temp.json';
import hsp_i_ko from '@/i18n/messages/ko/visa-pages/hsp-i.json';
import ltr_ko from '@/i18n/messages/ko/visa-pages/ltr.json';
import ssw_ko from '@/i18n/messages/ko/visa-pages/ssw.json';
import skilled_ko from '@/i18n/messages/ko/visa-pages/skilled.json';
import pr_ko from '@/i18n/messages/ko/visa-pages/pr.json';
import jp_spouse_ko from '@/i18n/messages/ko/visa-pages/jp-spouse.json';
import engineer_ko from '@/i18n/messages/ko/visa-pages/engineer.json';
import tit_ko from '@/i18n/messages/ko/visa-pages/tit.json';
import dep_ko from '@/i18n/messages/ko/visa-pages/dep.json';
import study_ko from '@/i18n/messages/ko/visa-pages/study.json';
import pr_spouse_ko from '@/i18n/messages/ko/visa-pages/pr-spouse.json';
import vr_ko from '@/i18n/messages/ko/visa-pages/vr.json';

const bySlug: Record<VisaPageSlug, { ja: VisaPageI18n; en: VisaPageI18n; zh: VisaPageI18n; vi: VisaPageI18n; ko: VisaPageI18n }> = {
  bm: { ja: bm_ja as VisaPageI18n, en: bm_en as VisaPageI18n, zh: bm_zh as VisaPageI18n, vi: bm_vi as VisaPageI18n, ko: bm_ko as VisaPageI18n },
  da: { ja: da_ja, en: da_en, zh: da_zh, vi: da_vi, ko: da_ko },
  'hsp-ii': { ja: hsp_ii_ja, en: hsp_ii_en, zh: hsp_ii_zh, vi: hsp_ii_vi, ko: hsp_ii_ko },
  care: { ja: care_ja, en: care_en, zh: care_zh, vi: care_vi, ko: care_ko },
  temp: { ja: temp_ja, en: temp_en, zh: temp_zh, vi: temp_vi, ko: temp_ko },
  'hsp-i': { ja: hsp_i_ja, en: hsp_i_en, zh: hsp_i_zh, vi: hsp_i_vi, ko: hsp_i_ko },
  ltr: { ja: ltr_ja, en: ltr_en, zh: ltr_zh, vi: ltr_vi, ko: ltr_ko },
  ssw: { ja: ssw_ja, en: ssw_en, zh: ssw_zh, vi: ssw_vi, ko: ssw_ko },
  skilled: { ja: skilled_ja, en: skilled_en, zh: skilled_zh, vi: skilled_vi, ko: skilled_ko },
  pr: { ja: pr_ja, en: pr_en, zh: pr_zh, vi: pr_vi, ko: pr_ko },
  'jp-spouse': { ja: jp_spouse_ja, en: jp_spouse_en, zh: jp_spouse_zh, vi: jp_spouse_vi, ko: jp_spouse_ko },
  engineer: { ja: engineer_ja, en: engineer_en, zh: engineer_zh, vi: engineer_vi, ko: engineer_ko },
  tit: { ja: tit_ja, en: tit_en, zh: tit_zh, vi: tit_vi, ko: tit_ko },
  dep: { ja: dep_ja, en: dep_en, zh: dep_zh, vi: dep_vi, ko: dep_ko },
  study: { ja: study_ja, en: study_en, zh: study_zh, vi: study_vi, ko: study_ko },
  'pr-spouse': { ja: pr_spouse_ja as VisaPageI18n, en: pr_spouse_en as VisaPageI18n, zh: pr_spouse_zh as VisaPageI18n, vi: pr_spouse_vi as VisaPageI18n, ko: pr_spouse_ko as VisaPageI18n },
  vr: { ja: vr_ja as VisaPageI18n, en: vr_en as VisaPageI18n, zh: vr_zh as VisaPageI18n, vi: vr_vi as VisaPageI18n, ko: vr_ko as VisaPageI18n },
};

export function staticVisaPageMessages(slug: VisaPageSlug) {
  return bySlug[slug];
}

export const visaPagesI18n = bySlug;
