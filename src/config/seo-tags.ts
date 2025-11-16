import type { Locale } from '@/i18n/locales';

export type SeoMeta = { title?: string; description?: string; keywords?: string[] };

// 写死的描述与关键词（按页面 Key）。
// Key 约定：
// - 详情页：`visa/<slug>`（slug 为短路径：pr, engineer, ...）
// - 首页：`home`
// - 其它示例：`ask-ai`、`questionnaire`、`tools/hsp-points`
export const seoMetaMap: Record<Locale, { default: SeoMeta; pages: Record<string, SeoMeta> }> = {
  zh: {
    default: {
      description:
        'AIVisa：日本签证与在留资格专业信息平台。提供各类签证的申请条件、必备材料、审查基准、补件要点、拒签风险与办理流程分析，覆盖多语言，助您高效完成日本签证申请。',
      keywords: ['日本签证', '在留资格', '申请条件', '审查基准', '补件', '拒签风险', '日本入管', '材料清单', 'aivisa']
    },
    pages: {
      home: {
        title: '日本签证・在留资格｜AI咨询・申请条件・材料清单・办理流程 - AIVisa',
        description:
          '一站掌握日本全部签证与在留资格：详解申请条件、材料要求、审查重点、拒签常见原因、续签要点与办理流程；支持中文、日文、英文、韩文、越南语多语言说明。',
        keywords: ['日本签证', '签证类型', '在留资格', '申请材料', '拒签原因', '续签流程']
      },

      /* 永住（PR） */
      'visa/pr': {
        title: '日本永住签证｜申请条件・材料清单・办理流程 - AIVisa',
        description:
          '日本永住签证（永住者）最终专业指南：涵盖在留年数要求、收入与纳税标准、素行与社会性评价、审查基准、常见补件项目、拒签风险、材料清单与完整申请流程。',
        keywords: ['日本永住', '永住者', '永住条件', '永住审查', '纳税记录', '在留年数', '拒签风险']
      },

      /* 留学 */
      'visa/study': {
        title: '日本留学签证｜申请条件・所需材料・最新办理流程 - AIVisa',
        description:
          '日本留学签证：学校录取条件、COE（在留资格认定证明）申请材料、担保人要求、资金证明标准、审查重点、补件情况、入境后手续与续签要点的完整说明。',
        keywords: ['日本留学', '留学签证', 'COE', '资金证明', '担保人', '入管审查']
      },

      /* 技术/人文/国际业务 */
      'visa/engineer': {
        title: '日本技术・人文・国际业务签证｜申请要求・材料清单・流程指南 - AIVisa',
        description:
          '技术/人文/国际业务（就劳签证）：学历/工作经验要求、雇主条件、合同要件、申请材料示例、换签/转职审查重点、常见拒签原因与全流程说明。',
        keywords: ['技术签证', '技人国签证', '人文知识', '国际业务', '就劳签证', '转职', '换签', '合同要件']
      },

      /* 高度人材 1号 */
      'visa/hsp-i': {
        title: '日本高度人材1号类签证｜分数计算・申请条件・加分项目 - AIVisa',
        description:
          '日本高度人材1号：积分制度与加分项目解析、学历・职历・收入计算方式、认定审查重点、常见补件内容、材料清单与快速审批策略。',
        keywords: ['高度人材', 'HSP', '积分制度', '加分项目', '高技能签证', '日本签证']
      },

      /* 高度人材 2号 */
      'visa/hsp-ii': {
        title: '日本高度人材2号类签证｜永住优势・申请条件・办理流程 - AIVisa',
        description:
          '日本高度人材2号：永住快速通道优势、家属待遇、申请条件、审查基准、补件情况、材料准备与完整办理流程。',
        keywords: ['高度人材2号', 'HSP2', '永住', '高技能签证', '审查基准']
      },

      /* 家属滞在 */
      'visa/dep': {
        title: '日本家族滞在签证｜配偶・子女申请条件・材料清单 - AIVisa',
        description:
          '家族滞在（配偶・子女）签证：收入与生活维持能力要求、材料清单、担保要点、续签审查重点、常见拒签原因与补件说明。',
        keywords: ['家族签证', '家族滞在', '配偶签证', '担保人', '收入要求', '拒签原因']
      },

      /* 特定活动 */
      'visa/da': {
        title: '日本特定活动签证｜28・46・就职类・申请条件与办理流程 - AIVisa',
        description:
          '特定活动签证（28号・46号・就业类）：适用场景、申请条件、材料清单、入管审查基准、常见补件内容与办理流程的专业解析。',
        keywords: ['特定活动签证', '特定活动28号', '特定活动46号', '审查基准', '补件']
      },

      /* 特定技能 SSW */
      'visa/ssw': {
        title: '日本特定技能签证｜14行业要求・考试・申请步骤 - AIVisa',
        description:
          '特定技能（SSW）1号・2号：14行业申请要求、技能考试与日本语考试标准、雇主条件、材料清单、审查重点与办理步骤。',
        keywords: ['特定技能', 'SSW', '技能考试', '14行业', '雇主条件']
      },

      /* 亲族访问 */
      'visa/vr': {
        title: '日本探亲签证｜探亲条件・邀请材料・办理流程 - AIVisa',
        description:
          '亲族访问（探亲）签证：邀请流程、担保文件、往返计划书、材料清单、常见拒签原因、补件情况与通过率提升策略。',
        keywords: ['探亲签证', '亲族访问', '邀请函', '短期滞在', '拒签原因']
      },

      /* 短期滞在签证 */
      'visa/temp': {
        title: '日本短期滞在签证｜旅游・商务・探亲申请指南 - AIVisa',
        description:
          '日本短期滞在签证（旅游/商务/探亲）：材料清单、行程计划、经济能力审查重点、拒签常见原因、补件要求与申请流程说明。',
        keywords: ['短期滞在', '旅游签证', '商务签证', '经济能力', '行程计划']
      },

      /* 永住者配偶 */
      'visa/pr-spouse': {
        title: '日本永住者配偶签证｜申请条件・所需材料・办理流程 - AIVisa',
        description:
          '永住者配偶签证：婚姻真实性审查重点、收入与同居证明要求、材料准备、续签流程、常见拒签原因与补件说明。',
        keywords: ['永住者配偶', '配偶签证', '婚姻真实性', '续签', '拒签']
      },

      /* 日本人配偶 */
      'visa/jp-spouse': {
        title: '日本人配偶签证｜结婚材料・申请流程・变更手续 - AIVisa',
        description:
          '日本人配偶签证：结婚材料、同居证明、担保标准、申请流程、审查要点、拒签因素与资格变更指南。',
        keywords: ['日本人配偶', '配偶签证', '担保人', '结婚签证', '资格变更']
      },

      /* 定住者 */
      'visa/ltr': {
        title: '日本定住者签证｜申请条件・适用情形・材料清单 - AIVisa',
        description:
          '定住者签证：适用类型（离婚定住/日二世/特別許可等）、申请条件、材料清单、审查重点、补件情况与续签要点。',
        keywords: ['定住者', '定住签证', '离婚定住', '特別許可', '续签']
      },

      /* 经营管理 */
      'visa/bm': {
        title: '日本经营管理签证｜公司注册・投资金额・申请流程 - AIVisa',
        description:
          '经营・管理（创业）签证：公司设立条件、资本要求、经营实体证据、办公场所要件、事业计划审查重点、材料清单与申请流程的完整专业指南。',
        keywords: ['经营管理签证', '创业签证', '公司设立', '事业计划', '办公场所']
      },

      /* 介护 */
      'visa/care': {
        title: '日本介护签证｜申请条件・技能考试・材料清单 - AIVisa',
        description:
          '介护（护理）签证：资格要求、介护福祉士相关规定、技能考试内容、雇主条件、材料清单与办理流程。',
        keywords: ['介护签证', '护理', '介护福祉士', '技能考试']
      },

      /* 技能签证 */
      'visa/skilled': {
        title: '日本技能签证｜职业范围・申请要求・材料清单 - AIVisa',
        description:
          '技能签证：可从事职业范围、技能证明要求、雇主条件、材料清单、审查重点与转职注意事项。',
        keywords: ['技能签证', '就劳签证', '职业范围', '雇主条件']
      },

      /* 技能实习 */
      'visa/tit': {
        title: '日本技能实习签证｜实习1号・2号・申请条件・办理步骤 - AIVisa',
        description:
          '技能实习（技术研修）签证1号/2号：监理团体要求、接收企业条件、材料清单、审查重点、常见补件与办理流程。',
        keywords: ['技能实习', '研修', '技术研修', '监理团体', '接收企业']
      },

      /* AI 问答 */
      'ask-ai': {
        title: 'AI日本签证咨询｜快速问答・材料指导・政策解读 - AIVisa',
        description:
          'AI问答助手：即时查询日本各类签证政策、申请条件、材料清单、审查要点、补件与拒签问题，并提供专业级步骤指导。',
        keywords: ['AI签证助手', '日本签证', '签证问题', '审查要点', '材料清单']
      },

      /* 问卷匹配 */
      'questionnaire': {
        title: '签证评估与材料匹配｜智能问诊・适配签证・清单生成 - AIVisa',
        description:
          '填写问卷即可自动匹配最适合的日本签证类型，并生成个性化材料清单、申请条件评估、风险提示与办理建议。',
        keywords: ['签证评估', '材料匹配', '签证推荐', '资格判断']
      },

      /* HSP 规则说明 / 计算 */
      'tools/hsp-points': {
        title: '高度人材积分计算｜在线评分・加分判定・资格评估 - AIVisa',
        description:
          '日本高度人材（HSP）积分制度专业解析：积分构成、加分项、学历/职历/收入计算方式、审查重点与常见问题。',
        keywords: ['高度人材', 'HSP积分', '积分制度', '加分项']
      },

      'questionnaire/contact': {
        title: '联系我们｜日本签证咨询・合作申请 - AIVisa'
      },
      'about/faq': {
        title: '常见问题FAQ｜日本签证指南・流程说明 - AIVisa'
      },
      'legal/privacy': {
        title: '隐私政策｜AIVisa日本签证服务隐私说明'
      },
      'legal/terms': {
        title: '使用条款｜AIVisa日本签证平台服务协议'
      }
    }
  },

  ja: {
    default: {
      description:
        'AIVisa：日本の在留資格・ビザ専門情報プラットフォーム。各種ビザの申請要件、必要書類、審査基準、補正ポイント、不許可リスク、手続き手順を多言語で分かりやすく解説。',
      keywords: ['日本ビザ', '在留資格', '申請要件', '審査基準', '補正', '不許可リスク', '入管', '必要書類', 'AIVisa']
    },
    pages: {
      home: {
        title: '日本ビザ・在留資格｜AI相談・申請要件・必要書類・手続きガイド - AIVisa',
        description:
          '日本の全ての在留資格とビザ情報を一括確認。申請要件、必要書類、審査ポイント、不許可理由、更新手続き、多言語（日本語・中国語・英語・韓国語・ベトナム語）対応。',
        keywords: ['日本ビザ', '在留資格', '必要書類', '審査ポイント', '不許可理由', '更新手続き']
      },

      /* 永住 */
      'visa/pr': {
        title: '日本永住許可｜申請条件・必要書類一覧・手続きの流れ - AIVisa',
        description:
          '日本永住許可（永住者）専門ガイド：在留年数要件、年収・納税状況、素行要件、審査基準、よくある補正事項、不許可リスク、必要書類一覧と手続きの流れを徹底解説。',
        keywords: ['永住許可', '永住者', '永住要件', '審査基準', '納税記録', '在留年数', '不許可リスク']
      },

      /* 留学 */
      'visa/study': {
        title: '日本留学ビザ｜申請条件・必要書類・最新の手続き方法 - AIVisa',
        description:
          '日本の留学ビザ：学校入学要件、COE（在留資格認定証明書）申請書類、資金証明、保証人基準、審査ポイント、補正事例、入国後の手続きや更新要点を詳しく説明。',
        keywords: ['留学ビザ', 'COE', '資金証明', '保証人', '入管審査', '必要書類']
      },

      /* 技术・人文知識・国際業務 */
      'visa/engineer': {
        title: '日本技術・人文知識・国際業務ビザ｜申請要件・必要書類・手続きガイド - AIVisa',
        description:
          '技術・人文知識・国際業務（就労ビザ）：学歴/実務経験要件、企業要件、契約条件、申請書類例、在留変更・転職時の審査ポイント、不許可理由と手続きの流れ。',
        keywords: ['技術人文国際', '就労ビザ', '転職', '在留変更', '契約要件', '審査ポイント']
      },

      /* 高度人材1号 */
      'visa/hsp-i': {
        title: '日本高度専門職1号ビザ｜ポイント計算・申請条件・加点項目 - AIVisa',
        description:
          '高度人材（HSP）1号：ポイント制度と加点項目、学歴・職歴・年収の計算方法、認定審査の基準、補正事項、必要書類、迅速審査のためのポイントを完全解説。',
        keywords: ['高度人材', 'HSP', 'ポイント制度', '加点項目', '高技能', '審査基準']
      },

      /* 高度人材2号 */
      'visa/hsp-ii': {
        title: '日本高度専門職2号ビザ｜永住メリット・申請条件・手続きの流れ - AIVisa',
        description:
          '高度人材（HSP）2号：永住許可への優遇、家族帯同の特典、申請要件、審査基準、補正が多いポイント、必要書類と手続きの流れを詳細に説明。',
        keywords: ['高度人材2号', 'HSP2', '永住', '高技能ビザ', '審査基準']
      },

      /* 家族滞在 */
      'visa/dep': {
        title: '日本家族滞在ビザ｜配偶者・子どもの申請条件・必要書類 - AIVisa',
        description:
          '家族滞在ビザ（配偶者/子）：生計維持能力の基準、必要書類、保証人要件、更新審査のポイント、よくある不許可理由と補正事項を丁寧に解説。',
        keywords: ['家族滞在', '配偶者ビザ', '生計維持能力', '保証人', '不許可理由']
      },

      /* 特定活動 */
      'visa/da': {
        title: '日本特定活動ビザ｜28号・46号・就労系の申請条件と手続き - AIVisa',
        description:
          '特定活動ビザ（28号・46号・就労系）：該当事例、申請要件、必要書類、入管審査基準、補正指示が多いポイント、手続きの流れを専門的に解説。',
        keywords: ['特定活動', '特定活動28号', '特定活動46号', '審査基準', '補正']
      },

      /* 特定技能 SSW */
      'visa/ssw': {
        title: '日本特定技能ビザ｜14分野の要件・試験内容・申請ステップ - AIVisa',
        description:
          '特定技能（SSW）1号・2号：14分野の要件、技能試験・日本語試験の基準、受入企業要件、必要書類、審査ポイント、申請手順を詳しく説明。',
        keywords: ['特定技能', 'SSW', '技能試験', '14分野', '受入企業']
      },

      /* 親族訪問 */
      'visa/vr': {
        title: '日本親族訪問ビザ｜訪問条件・招へい書類・申請手続き - AIVisa',
        description:
          '親族訪問ビザ：招へい手続き、保証書・理由書の書き方、必要書類、不許可の多いケース、補正のポイント、審査通過のための実務的アドバイス。',
        keywords: ['親族訪問', '短期滞在', '招へい理由書', '不許可理由', '保証書']
      },

      /* 短期滞在（観光/商用/親族） */
      'visa/temp': {
        title: '日本短期滞在ビザ｜観光・商用・親族訪問の申請ガイド - AIVisa',
        description:
          '短期滞在ビザ（観光/商用/親族訪問）：必要書類、行程表/滞在計画の書き方、資金証明の審査ポイント、不許可理由、補正事項と申請手続きの解説。',
        keywords: ['短期滞在', '観光ビザ', '商用ビザ', '資金証明', '行程表']
      },

      /* 永住者の配偶者 */
      'visa/pr-spouse': {
        title: '日本永住者の配偶者ビザ｜申請条件・必要書類・手続きの流れ - AIVisa',
        description:
          '永住者の配偶者ビザ：婚姻実態の審査、同居要件、生計維持能力、必要書類、更新時の審査ポイント、不許可リスクと補正対応を詳細に解説。',
        keywords: ['永住者の配偶者', '配偶者ビザ', '婚姻実態', '更新', '不許可']
      },

      /* 日本人の配偶者 */
      'visa/jp-spouse': {
        title: '日本人配偶者ビザ｜結婚書類・申請手続き・在留資格変更 - AIVisa',
        description:
          '日本人の配偶者ビザ：結婚手続き、必要書類、同居証明、保証人基準、申請手順、審査基準、不許可理由、在留資格変更のポイントを網羅的に解説。',
        keywords: ['日本人の配偶者', '配偶者ビザ', '保証人', '在留資格変更', '不許可理由']
      },

      /* 定住者 */
      'visa/ltr': {
        title: '日本定住者ビザ｜申請条件・該当ケース・必要書類一覧 - AIVisa',
        description:
          '定住者ビザ：該当類型（離婚定住・日本人子の定住・特別許可等）、申請要件、必要書類、審査ポイント、補正事例、更新手続きまで完全解説。',
        keywords: ['定住者', '離婚定住', '特別許可', '更新手続き', '必要書類']
      },

      /* 経営管理 */
      'visa/bm': {
        title: '日本経営・管理ビザ｜会社設立・必要資金・申請手続き - AIVisa',
        description:
          '経営・管理ビザ（起業ビザ）：会社設立要件、出資金基準、事業計画書の審査ポイント、事務所要件、必要書類、補正事項、申請手続きの全工程を解説。',
        keywords: ['経営管理ビザ', '起業', '会社設立', '事業計画書', '事務所要件']
      },

      /* 介護 */
      'visa/care': {
        title: '日本介護ビザ｜申請条件・技能試験・必要書類一覧 - AIVisa',
        description:
          '介護ビザ：資格要件、介護福祉士関連制度、技能試験基準、受入事業所の条件、必要書類、申請手続きと審査ポイントを詳細に解説。',
        keywords: ['介護ビザ', '介護福祉士', '技能試験', '受入施設', '必要書類']
      },

      /* 技能ビザ */
      'visa/skilled': {
        title: '日本技能ビザ｜対象職種・申請要件・必要書類 - AIVisa',
        description:
          '技能ビザ：対象職種、技能証明の基準、受入企業要件、必要書類、審査ポイント、転職時の注意点を包括的に説明。',
        keywords: ['技能ビザ', '就労ビザ', '対象職種', '企業要件', '転職']
      },

      /* 技能実習 */
      'visa/tit': {
        title: '日本技能実習ビザ｜技能実習1号・2号の申請条件と手順 - AIVisa',
        description:
          '技能実習（技術研修）ビザ1号/2号：監理団体の基準、受入企業条件、必要書類、審査基準、補正ポイント、手続きの流れを徹底解説。',
        keywords: ['技能実習', '技術研修', '監理団体', '受入企業', '審査基準']
      },

      /* AI アシスタント */
      'ask-ai': {
        title: 'AI日本ビザ相談｜即時回答・必要書類案内・制度解説 - AIVisa',
        description:
          'AIビザアシスタント：日本の各種ビザの申請要件、必要書類、審査基準、補正・不許可ポイントを即時回答。実務的な手続きアドバイスも提供。',
        keywords: ['AIビザ', '在留資格', '審査基準', '必要書類', '不許可理由']
      },

      /* 診断フォーム */
      'questionnaire': {
        title: 'ビザ診断・書類マッチング｜AI質問票で最適在留資格を判定 - AIVisa',
        description:
          '質問に答えるだけで、最適な在留資格を自動判定し、必要書類リスト、申請要件、リスク分析、手続きアドバイスを生成。',
        keywords: ['在留資格診断', '書類マッチング', 'ビザ判定', '申請要件']
      },

      /* HSP ポイント制度説明 / 計算 */
      'tools/hsp-points': {
        title: '高度人材ポイント計算ツール｜オンライン算定・加点判定・適格性評価 - AIVisa',
        description:
          '高度人材（HSP）ポイント制度の専門解説：ポイント構成、加点項目、学歴/職歴/年収の計算方法、審査基準、よくある質問を分かりやすく説明。',
        keywords: ['高度人材', 'HSPポイント', 'ポイント制度', '加点項目']
      },

      'questionnaire/contact': {
        title: 'お問い合わせ｜日本ビザ相談・パートナー提携 - AIVisa'
      },
      'about/faq': {
        title: 'よくある質問FAQ｜日本ビザの基礎知識・手続きガイド - AIVisa'
      },
      'legal/privacy': {
        title: 'プライバシーポリシー｜AIVisa 日本ビザサービスの個人情報保護方針'
      },
      'legal/terms': {
        title: '利用規約｜AIVisa 日本ビザプラットフォーム利用契約'
      }
    }
  },

  en: {
    default: {
      description:
        'AIVisa: A professional platform for Japan visa and residence status information. Provides detailed eligibility requirements, required documents, screening standards, common reasons for refusal, supplemental document guidance, and complete application procedures in multiple languages.',
      keywords: ['Japan visa', 'residence status', 'eligibility requirements', 'screening standards', 'refusal reasons', 'supplemental documents', 'immigration', 'required documents', 'AIVisa']
    },
    pages: {
      home: {
        title: 'Japan Visa & Residence Status｜AI Consultation, Requirements, Documents & Application Guide - AIVisa',
        description:
          'Comprehensive guide to all Japan visa and residence status categories. Covers eligibility requirements, required documents, screening points, common refusal reasons, renewal rules, and multilingual support (EN/JA/ZH/KR/VI).',
        keywords: ['Japan visa', 'residence status', 'visa types', 'required documents', 'screening points', 'refusal reasons', 'renewal process']
      },

      'visa/pr': {
        title: 'Japan Permanent Residency (PR) Visa｜Requirements, Documents, and Application Process - AIVisa',
        description:
          'Japan Permanent Residency (PR) Visa: Detailed explanation of years-of-stay requirements, income and tax standards, good conduct criteria, screening benchmarks, common supplemental documents, refusal risks, required documents, and full application procedures.',
        keywords: ['Japan PR', 'permanent residency', 'PR requirements', 'screening standards', 'tax records', 'years of stay', 'refusal risk']
      },

      'visa/study': {
        title: 'Japan Student Visa｜Eligibility Requirements, Required Documents, and Latest Process - AIVisa',
        description:
          'Japan Student Visa: School admission requirements, COE documents, financial proof standards, guarantor requirements, immigration screening points, supplemental document cases, post-entry procedures, and renewal guidelines.',
        keywords: ['student visa', 'COE', 'financial proof', 'guarantor', 'immigration screening', 'required documents']
      },

      'visa/engineer': {
        title:
          'Japan Engineer / Specialist in Humanities / International Services Visa｜Requirements, Documents, and Application Guide - AIVisa',
        description:
          'Engineer / Specialist in Humanities / International Services Visa: Academic/work experience requirements, employer requirements, contract conditions, sample documents, change of status, job change screening points, refusal reasons, and full procedure guide.',
        keywords: ['engineer visa', 'humanities visa', 'international services', 'work visa Japan', 'job change', 'status change']
      },

      'visa/hsp-i': {
        title: 'Japan Highly Skilled Professional (HSP) Type I Visa｜Points Calculation, Requirements, and Benefits - AIVisa',
        description:
          'Highly Skilled Professional (HSP) Type I Visa: Full explanation of the points system, calculation methods, bonus categories, screening standards, common supplemental documents, required documents, and fast-track tips.',
        keywords: ['HSP', 'highly skilled professional', 'points system', 'bonus points', 'screening standards']
      },

      'visa/hsp-ii': {
        title: 'Japan Highly Skilled Professional (HSP) Type II Visa｜PR Advantages, Eligibility, and Process - AIVisa',
        description:
          'Highly Skilled Professional (HSP) Type II Visa: Advantages for fast-track PR, family benefits, eligibility requirements, screening points, supplemental documents, and step-by-step application procedures.',
        keywords: ['HSP2', 'highly skilled', 'PR advantage', 'family benefits', 'screening standards']
      },

      'visa/dep': {
        title: 'Japan Dependent Visa｜Requirements for Spouse and Children, Required Documents - AIVisa',
        description:
          'Dependent Visa (Spouse/Child): Income and financial ability requirements, required documents, guarantor requirements, renewal screening points, common refusal reasons, and supplemental document instructions.',
        keywords: ['dependent visa', 'family stay', 'spouse visa', 'financial ability', 'guarantor', 'refusal reasons']
      },

      'visa/da': {
        title: 'Japan Designated Activities Visa｜Types 28/46, Work-Related Eligibility and Application Process - AIVisa',
        description:
          'Designated Activities Visa (Types 28/46/Work-related): Eligibility categories, required documents, immigration screening benchmarks, common supplemental documents, and full application process.',
        keywords: ['designated activities', 'Type 28', 'Type 46', 'immigration screening', 'supplemental documents']
      },

      'visa/ssw': {
        title: 'Japan Specified Skilled Worker (SSW) Visa｜14 Industry Requirements, Exams, and Application Steps - AIVisa',
        description:
          'Specified Skilled Worker (SSW) Visa Types 1 & 2: Requirements for 14 fields, skill test/Japanese exam standards, employer requirements, required documents, screening points, and application steps.',
        keywords: ['SSW', 'specified skilled worker', 'skill test', '14 fields', 'employer requirements']
      },

      'visa/vr': {
        title: 'Japan Family Visit Visa｜Visit Requirements, Invitation Documents, and Application Process - AIVisa',
        description:
          'Family Visit Visa: Invitation procedure, guarantor documents, reason letters, required documents, common refusal cases, supplemental document handling, and approval tips.',
        keywords: ['family visit visa', 'short-term stay', 'invitation letter', 'reason letter', 'refusal reasons']
      },

      'visa/temp': {
        title: 'Japan Temporary Visitor Visa｜Tourism, Business, and Family Visit Application Guide - AIVisa',
        description:
          'Temporary Visitor Visa (Tourism/Business/Family): Required documents, itinerary preparation, financial proof, screening points, refusal reasons, supplemental documents, and application procedures.',
        keywords: ['temporary visitor', 'tourist visa', 'business visa', 'financial proof', 'itinerary']
      },

      'visa/pr-spouse': {
        title: 'Japan Permanent Resident Spouse Visa｜Eligibility Requirements, Documents, and Process - AIVisa',
        description:
          'Spouse of Permanent Resident Visa: Screening focus on marriage authenticity, cohabitation proof, income requirements, required documents, renewal screening, refusal risks, and supplemental document guidance.',
        keywords: ['spouse of PR', 'spouse visa', 'marriage authenticity', 'renewal', 'refusal']
      },

      'visa/jp-spouse': {
        title: 'Japan Spouse of Japanese National Visa｜Marriage Documents, Application Process, and Status Change - AIVisa',
        description:
          'Spouse of Japanese National Visa: Marriage documents, cohabitation proof, guarantor requirements, application steps, screening standards, refusal reasons, and status-change points.',
        keywords: ['Japanese spouse', 'spouse visa', 'guarantor', 'status change', 'refusal reasons']
      },

      'visa/ltr': {
        title: 'Japan Long-Term Resident Visa｜Eligibility, Applicable Cases, and Required Documents - AIVisa',
        description:
          'Long-Term Resident Visa: Applicable categories (divorce, Japanese child, special permission), eligibility requirements, required documents, screening points, supplemental cases, and renewal procedures.',
        keywords: ['long-term resident', 'divorce resident', 'special permission', 'renewal']
      },

      'visa/bm': {
        title: 'Japan Business Manager Visa｜Company Setup, Investment Requirements, and Application Process - AIVisa',
        description:
          'Business Manager Visa: Company registration requirements, capital/investment standards, office requirements, business plan screening points, required documents, supplemental items, and full application process.',
        keywords: ['business manager visa', 'startup visa Japan', 'company registration', 'business plan', 'office requirements']
      },

      'visa/care': {
        title: 'Japan Care Worker Visa｜Eligibility Requirements, Skills Exams, and Required Documents - AIVisa',
        description:
          'Care Worker Visa: Qualification requirements, care worker certification system, skill test criteria, employer requirements, required documents, and screening points.',
        keywords: ['care worker visa', 'caregiver', 'skill test', 'employer requirements']
      },

      'visa/skilled': {
        title: 'Japan Skilled Worker Visa｜Eligible Occupations, Requirements, and Required Documents - AIVisa',
        description:
          'Skilled Worker Visa: Eligible occupations, skill certification requirements, employer conditions, required documents, screening focus, and job-change considerations.',
        keywords: ['skilled worker', 'work visa', 'occupations', 'employer requirements', 'job change']
      },

      'visa/tit': {
        title: 'Japan Technical Intern Training Visa｜TITP Type 1 & 2 Requirements and Application Steps - AIVisa',
        description:
          'Technical Intern Training (TIT) Visa Types 1 & 2: Supervising organization requirements, receiving company standards, required documents, screening benchmarks, supplemental points, and full procedure guide.',
        keywords: ['technical intern training', 'TIT', 'supervising organization', 'receiving company', 'screening standards']
      },

      'ask-ai': {
        title: 'AI Visa Assistant｜Instant Answers・Document Guidance・Policy Insights - AIVisa',
        description:
          'AI Visa Assistant: Instantly answers questions about Japan visa requirements, documents, screening standards, supplemental documents, refusal reasons, and provides practical application guidance.',
        keywords: ['AI visa assistant', 'Japan visa', 'screening standards', 'required documents', 'refusal reasons']
      },

      'questionnaire': {
        title: 'Visa Assessment & Document Matching｜AI Questionnaire & Recommendations - AIVisa',
        description:
          'Answer a few questions to automatically identify the most suitable Japan visa, generate tailored document lists, eligibility assessment, risk analysis, and application guidance.',
        keywords: ['visa assessment', 'document matching', 'visa recommendation', 'eligibility']
      },

      'tools/hsp-points': {
        title: 'HSP Points Calculator｜Online Scoring・Bonus Evaluation・Eligibility Check - AIVisa',
        description:
          'Highly Skilled Professional (HSP) Points System: Full explanation of point categories, bonus points, calculation rules, screening standards, and common questions.',
        keywords: ['HSP points', 'highly skilled professional', 'points system', 'bonus points']
      },

      'questionnaire/contact': {
        title: 'Contact Us｜Japan Visa Consultation & Partnership Inquiries - AIVisa'
      },
      'about/faq': {
        title: 'Frequently Asked Questions｜Japan Visa Information & Process Guide - AIVisa'
      },
      'legal/privacy': {
        title: 'Privacy Policy｜AIVisa Japan Visa Service Data Protection'
      },
      'legal/terms': {
        title: 'Terms of Service｜AIVisa Japan Visa Platform User Agreement'
      }
    }
  },

  ko: {
    default: {
      description:
        'AIVisa: 일본 비자·재류자격 전문 정보 플랫폼. 각 비자의 신청 요건, 필요 서류, 심사 기준, 보정 요구, 불허 사유, 절차 설명을 다국어로 제공하여 보다 정확한 비자 준비를 지원합니다.',
      keywords: ['일본 비자', '재류자격', '신청 요건', '심사 기준', '보정', '불허 사유', '입관', '필요 서류', 'AIVisa']
    },
    pages: {
      home: {
        title: '일본 비자・재류자격｜AI 상담・신청 요건・필요 서류・절차 가이드 - AIVisa',
        description:
          '일본의 모든 비자·재류자격을 한눈에 확인. 신청 요건, 필요 서류, 심사 포인트, 불허 사유, 갱신 절차를 한국어·일본어·중국어·영어·베트남어로 제공.',
        keywords: ['일본 비자', '재류자격', '비자 종류', '필요 서류', '심사 포인트', '불허 사유', '갱신 절차']
      },

      'visa/pr': {
        title: '일본 영주권 비자｜신청 요건·필요 서류·신청 절차 - AIVisa',
        description:
          '일본 영주권 비자(PR): 재류 기간 요건, 소득·납세 기준, 선행 요건, 심사 기준, 보정 요구 사례, 불허 리스크, 필요 서류 및 신청 절차를 전문적으로 안내.',
        keywords: ['영주권', '영주 비자', '영주 요건', '심사 기준', '납세 기록', '재류 기간', '불허 리스크']
      },

      'visa/study': {
        title: '일본 유학 비자｜신청 요건·필요 서류·최신 신청 절차 - AIVisa',
        description:
          '일본 유학 비자: 학교 입학 요건, COE 발급 서류, 재정보증 기준, 보증인 요건, 심사 포인트, 보정 사례, 입국 후 절차 및 갱신 요점을 자세히 설명.',
        keywords: ['유학 비자', 'COE', '재정보증', '보증인', '입관 심사', '필요 서류']
      },

      'visa/engineer': {
        title: '일본 기술·인문·국제업무 비자｜신청 요건·필요 서류·절차 안내 - AIVisa',
        description:
          '기술·인문지식·국제업무 비자(취업 비자): 학력/경력 요건, 고용주 조건, 계약 요건, 서류 예시, 재류 변경·이직 시 심사 포인트, 불허 사유, 전체 절차를 안내.',
        keywords: ['기술 인문 국제', '취업 비자', '이직', '재류 변경', '계약 요건']
      },

      'visa/hsp-i': {
        title: '일본 고도인재 1호 비자｜포인트 계산·신청 요건·가점 항목 - AIVisa',
        description:
          '일본 고도인재(HSP) 1호: 포인트 제도와 가점 항목, 학력/경력/연수 계산 방식, 심사 기준, 보정 요건, 필요 서류, 빠른 심사 팁을 종합적으로 해설.',
        keywords: ['고도인재', 'HSP', '포인트 제도', '가점 항목', '고숙련자']
      },

      'visa/hsp-ii': {
        title: '일본 고도인재 2호 비자｜영주권 혜택·신청 요건·신청 절차 - AIVisa',
        description:
          '고도인재(HSP) 2호: 영주권 우대, 가족 동반 혜택, 신청 요건, 심사 포인트, 보정 요구, 필요 서류 및 전체 신청 절차를 상세히 설명.',
        keywords: ['고도인재2호', 'HSP2', '영주', '고숙련 비자', '심사 기준']
      },

      'visa/dep': {
        title: '일본 가족체재 비자｜배우자·자녀 신청 요건·필요 서류 - AIVisa',
        description:
          '가족체재(배우자/자녀) 비자: 생계 유지 능력 기준, 필요 서류, 보증인 조건, 갱신 심사 포인트, 불허 사유, 보정 요구 사례를 전문적으로 정리.',
        keywords: ['가족체재', '배우자 비자', '보증인', '생계 유지 능력', '불허 사유']
      },

      'visa/da': {
        title: '일본 특정활동 비자｜28호·46호·취업형 신청 요건 및 절차 - AIVisa',
        description:
          '특정활동 비자(28호·46호·취업형): 대상 유형, 신청 요건, 필요 서류, 입관 심사 기준, 보정 요구가 많은 항목, 전체 절차를 전문적으로 해설.',
        keywords: ['특정활동', '28호', '46호', '심사 기준', '보정']
      },

      'visa/ssw': {
        title: '일본 특정기능(SSW) 비자｜14개 분야 요건·시험·신청 단계 - AIVisa',
        description:
          '특정기능(SSW) 1호/2호: 14개 업종 요건, 기능시험·일본어시험 기준, 고용주 요건, 필요 서류, 심사 포인트와 신청 절차를 자세히 안내.',
        keywords: ['특정기능', 'SSW', '기능시험', '14개 업종', '고용주 요건']
      },

      'visa/vr': {
        title: '일본 가족방문 비자｜방문 요건·초청 서류·신청 절차 - AIVisa',
        description:
          '가족방문 비자: 초청 절차, 보증 서류, 사유서 작성, 필요 서류, 불허 사례, 보정 요점, 승인 가능성을 높이는 실무 가이드.',
        keywords: ['가족방문', '단기 체류', '초청장', '사유서', '불허 사유']
      },

      'visa/temp': {
        title: '일본 단기체류 비자｜관광·상용·가족 방문 신청 가이드 - AIVisa',
        description:
          '단기체류 비자(관광/상용/가족방문): 필요 서류, 일정표 작성, 재정 능력 증명, 심사 포인트, 불허 이유, 보정 사항 및 신청 절차 안내.',
        keywords: ['단기체류', '관광 비자', '상용 비자', '재정 증명', '일정표']
      },

      'visa/pr-spouse': {
        title: '일본 영주자 배우자 비자｜신청 요건·필요 서류·신청 절차 - AIVisa',
        description:
          '영주자의 배우자 비자: 혼인 실태 심사, 동거 요건, 소득 기준, 필요 서류, 갱신 심사 포인트, 불허 리스크 및 보정 설명。',
        keywords: ['영주자 배우자', '배우자 비자', '혼인 실태', '갱신', '불허']
      },

      'visa/jp-spouse': {
        title: '일본인 배우자 비자｜결혼 서류·신청 절차·자격 변경 - AIVisa',
        description:
          '일본인 배우자 비자: 결혼 서류, 동거 증명, 보증인 요건, 신청 절차, 심사 기준, 불허 사유, 재류자격 변경 포인트.',
        keywords: ['일본인 배우자', '배우자 비자', '보증인', '재류자격 변경', '불허 사유']
      },

      'visa/ltr': {
        title: '일본 정주자 비자｜신청 요건·해당 사례·필요 서류 - AIVisa',
        description:
          '정주자 비자: 유형별 요건(이혼 정주·일본인 자녀·특별허가 등), 신청 요건, 필요 서류, 심사 포인트, 보정 사례, 갱신 절차를 상세히 설명。',
        keywords: ['정주자', '이혼 정주', '특별허가', '갱신', '필요 서류']
      },

      'visa/bm': {
        title: '일본 경영·관리 비자｜회사 설립·필요 자본·신청 절차 - AIVisa',
        description:
          '경영·관리(창업) 비자: 회사 설립 요건, 자본 요건, 사무실 기준, 사업계획서 심사 포인트, 필요 서류, 보정 사항, 신청 절차를 종합적으로 해설。',
        keywords: ['경영관리 비자', '창업', '회사 설립', '사업 계획서', '사무실 요건']
      },

      'visa/care': {
        title: '일본 개호 비자｜신청 요건·기능 시험·필요 서류 - AIVisa',
        description:
          '개호 비자: 자격 요건, 개호복지사 제도, 기능시험 기준, 수용 시설 요건, 필요 서류 및 심사 포인트를 전문적으로 설명。',
        keywords: ['개호 비자', '개호복지사', '기능시험', '수용 시설']
      },

      'visa/skilled': {
        title: '일본 기능 비자｜대상 직종·신청 요건·필요 서류 - AIVisa',
        description:
          '기능 비자: 대상 직종, 기능 인증 기준, 고용주 조건, 필요 서류, 심사 포인트, 이직 시 주의 사항을 종합적으로 정리。',
        keywords: ['기능 비자', '취업 비자', '직종', '고용주 요건', '이직']
      },

      'visa/tit': {
        title: '일본 기술연수 비자｜기술연수 1호·2호 신청 요건·절차 - AIVisa',
        description:
          '기능실습(기술연수) 비자 1호/2호: 감독단체 기준, 수용 회사 요건, 필요 서류, 심사 기준, 보정 요점, 절차 전반을 정리。',
        keywords: ['기능실습', '기술연수', '감독단체', '수용 회사', '심사 기준']
      },

      'ask-ai': {
        title: 'AI 일본 비자 상담｜즉시 답변・서류 안내・정책 해설 - AIVisa',
        description:
          'AI 비자 어시스턴트: 일본 비자의 신청 요건, 필요 서류, 심사 기준, 보정 사항, 불허 사유를 즉시 안내하며 실무 절차 팁을 제공합니다。',
        keywords: ['AI 비자', '재류자격', '심사 기준', '필요 서류', '불허 사유']
      },

      'questionnaire': {
        title: '비자 진단・서류 매칭｜AI 설문 기반 최적 비자 추천 - AIVisa',
        description:
          '간단한 설문 작성으로 적합한 일본 비자를 자동 판정하고, 맞춤형 서류 목록, 신청 요건 분석, 리스크 안내 및 절차 조언을 제공합니다。',
        keywords: ['비자 판정', '서류 매칭', '비자 추천', '자격 판단']
      },

      'tools/hsp-points': {
        title: '고도인재 포인트 계산기｜온라인 점수 산정・가점 평가・자격 확인 - AIVisa',
        description:
          '고도인재(HSP) 포인트 제도 해설: 포인트 구성, 가점 항목, 학력/경력/연봉 계산, 심사 기준, 자주 묻는 질문을 정리。',
        keywords: ['고도인재', 'HSP 포인트', '포인트 제도', '가점']
      },

      'questionnaire/contact': {
        title: '문의하기｜일본 비자 상담・파트너 제휴 문의 - AIVisa'
      },
      'about/faq': {
        title: '자주 묻는 질문 FAQ｜일본 비자 기본 안내・절차 가이드 - AIVisa'
      },
      'legal/privacy': {
        title: '개인정보 처리방침｜AIVisa 일본 비자 서비스 개인정보 보호'
      },
      'legal/terms': {
        title: '이용약관｜AIVisa 일본 비자 플랫폼 이용 계약'
      }
    }
  },

  vi: {
    default: {
      description:
        'AIVisa: Nền tảng chuyên nghiệp về thông tin thị thực và tư cách lưu trú Nhật Bản. Cung cấp yêu cầu điều kiện, hồ sơ cần thiết, tiêu chí xét duyệt, lý do bị từ chối, yêu cầu bổ sung hồ sơ và quy trình nộp đơn chi tiết với nhiều ngôn ngữ hỗ trợ.',
      keywords: ['visa Nhật Bản', 'tư cách lưu trú', 'điều kiện visa', 'tiêu chí xét duyệt', 'từ chối visa', 'bổ sung hồ sơ', 'nhập cư Nhật Bản', 'hồ sơ visa', 'AIVisa']
    },
    pages: {
      home: {
        title: 'Visa & Tư cách lưu trú Nhật Bản｜AI tư vấn・Điều kiện・Hồ sơ・Hướng dẫn thủ tục - AIVisa',
        description:
          'Tra cứu toàn bộ thị thực và tư cách lưu trú của Nhật Bản: điều kiện xét duyệt, hồ sơ cần thiết, điểm xét duyệt quan trọng, lý do từ chối, hướng dẫn gia hạn và hỗ trợ nhiều ngôn ngữ (VI/EN/JA/ZH/KR).',
        keywords: ['visa Nhật', 'tư cách lưu trú', 'hồ sơ visa', 'điều kiện xin visa', 'lý do từ chối', 'gia hạn visa']
      },

      'visa/pr': {
        title: 'Visa Định cư Nhật Bản (PR)｜Điều kiện, Hồ sơ cần thiết và Quy trình nộp đơn - AIVisa',
        description:
          'Visa Định cư Nhật Bản (PR): Yêu cầu số năm lưu trú, tiêu chuẩn thu nhập – thuế, tiêu chí đánh giá nhân thân, điểm xét duyệt trọng yếu, hồ sơ cần chuẩn bị, các yêu cầu bổ sung thường gặp và rủi ro bị từ chối.',
        keywords: ['visa định cư', 'PR Nhật Bản', 'điều kiện định cư', 'xét duyệt PR', 'thuế', 'năm lưu trú', 'rủi ro từ chối']
      },

      'visa/study': {
        title: 'Visa Du học Nhật Bản｜Điều kiện, Hồ sơ và Quy trình mới nhất - AIVisa',
        description:
          'Visa Du học Nhật: Điều kiện nhập học, hồ sơ COE, chứng minh tài chính, yêu cầu người bảo lãnh, điểm xét duyệt của cục xuất nhập cảnh, các trường hợp yêu cầu bổ sung và hướng dẫn gia hạn。',
        keywords: ['visa du học', 'COE', 'chứng minh tài chính', 'người bảo lãnh', 'cục xuất nhập cảnh']
      },

      'visa/engineer': {
        title:
          'Visa Kỹ sư / Nhân văn / Nghiệp vụ quốc tế Nhật Bản｜Yêu cầu, Hồ sơ và Hướng dẫn thủ tục - AIVisa',
        description:
          'Visa Kỹ sư / Nhân văn / Nghiệp vụ quốc tế: Điều kiện học vấn/kinh nghiệm, yêu cầu đối với công ty tuyển dụng, điều kiện hợp đồng, mẫu hồ sơ, điểm xét duyệt khi chuyển việc/thay đổi tư cách lưu trú và lý do bị từ chối。',
        keywords: ['visa kỹ sư', 'nhân văn', 'nghiệp vụ quốc tế', 'visa lao động Nhật', 'chuyển việc', 'thay đổi tư cách']
      },

      'visa/hsp-i': {
        title: 'Visa Kỹ năng cao Nhật Bản loại I (HSP-I)｜Tính điểm, Điều kiện và Hạng mục cộng điểm - AIVisa',
        description:
          'Visa Kỹ năng cao Nhật Bản (HSP) loại I: Giải thích chi tiết hệ thống tính điểm, cách tính và hạng mục cộng điểm, tiêu chí xét duyệt, hồ sơ bổ sung thường gặp và mẹo rút ngắn thời gian xét duyệt。',
        keywords: ['HSP', 'kỹ năng cao', 'tính điểm HSP', 'cộng điểm', 'xét duyệt HSP']
      },

      'visa/hsp-ii': {
        title: 'Visa Kỹ năng cao Nhật Bản loại II (HSP-II)｜Lợi thế xin định cư, Điều kiện và Quy trình - AIVisa',
        description:
          'Visa Kỹ năng cao loại II (HSP-II): Lợi thế xin định cư nhanh, ưu đãi cho gia đình, điều kiện xét duyệt, điểm cần lưu ý, hồ sơ cần thiết và toàn bộ quy trình nộp đơn。',
        keywords: ['HSP2', 'kỹ năng cao', 'định cư nhanh', 'ưu đãi gia đình']
      },

      'visa/dep': {
        title: 'Visa Phụ thuộc Nhật Bản｜Điều kiện cho vợ/chồng, con cái và Hồ sơ cần thiết - AIVisa',
        description:
          'Visa Phụ thuộc (vợ/chồng – con cái): Yêu cầu chứng minh tài chính, hồ sơ cần thiết, điều kiện người bảo lãnh, tiêu chí xét duyệt khi gia hạn, lý do bị từ chối và cách xử lý yêu cầu bổ sung。',
        keywords: ['visa phụ thuộc', 'family stay', 'bảo lãnh', 'chứng minh tài chính', 'từ chối visa']
      },

      'visa/da': {
        title: 'Visa Hoạt động đặc định Nhật Bản｜Loại 28・46・Lao động, Điều kiện và Quy trình - AIVisa',
        description:
          'Visa Hoạt động đặc định (No.28/46 – loại lao động): Đối tượng áp dụng, điều kiện xét duyệt, hồ sơ cần thiết, tiêu chí đánh giá của cục xuất nhập cảnh và các yêu cầu bổ sung phổ biến。',
        keywords: ['hoạt động đặc định', 'visa 28', 'visa 46', 'xét duyệt visa', 'bổ sung hồ sơ']
      },

      'visa/ssw': {
        title: 'Visa Kỹ năng đặc định (SSW) Nhật Bản｜Yêu cầu 14 ngành, Kỳ thi và Các bước nộp đơn - AIVisa',
        description:
          'Visa Kỹ năng đặc định (SSW) loại 1 & 2: Điều kiện 14 ngành nghề, tiêu chuẩn kỳ thi kỹ năng – tiếng Nhật, yêu cầu đối với doanh nghiệp tiếp nhận, hồ sơ cần thiết và quy trình nộp đơn。',
        keywords: ['SSW', 'kỹ năng đặc định', 'kỳ thi kỹ năng', '14 ngành', 'doanh nghiệp tiếp nhận']
      },

      'visa/vr': {
        title: 'Visa Thăm thân Nhật Bản｜Điều kiện thăm thân, Hồ sơ mời và Quy trình nộp đơn - AIVisa',
        description:
          'Visa Thăm thân: Quy trình mời/ bảo lãnh, các loại giấy tờ cần thiết, cách viết thư mời – thư giải trình, nguyên nhân từ chối phổ biến, yêu cầu bổ sung và cách tăng tỷ lệ đậu visa。',
        keywords: ['visa thăm thân', 'ngắn hạn', 'thư mời', 'giải trình', 'từ chối visa']
      },

      'visa/temp': {
        title: 'Visa Lưu trú ngắn hạn Nhật Bản｜Hướng dẫn xin du lịch・công tác・thăm thân - AIVisa',
        description:
          'Visa Lưu trú ngắn hạn (du lịch / công tác / thăm thân): Hồ sơ cần thiết, cách làm lịch trình, chứng minh tài chính, điểm xét duyệt quan trọng, lý do từ chối và quy trình nộp đơn。',
        keywords: ['visa ngắn hạn', 'visa du lịch', 'visa công tác', 'chứng minh tài chính', 'lịch trình']
      },

      'visa/pr-spouse': {
        title: 'Visa Vợ/chồng của Người định cư vĩnh viễn Nhật Bản｜Điều kiện, Hồ sơ và Quy trình - AIVisa',
        description:
          'Visa Vợ/chồng của Người định cư vĩnh viễn: Xét duyệt tính xác thực hôn nhân, yêu cầu thu nhập, bằng chứng sống chung, hồ sơ cần thiết, điểm xét duyệt khi gia hạn và rủi ro bị từ chối。',
        keywords: ['visa vợ chồng PR', 'xác thực hôn nhân', 'sống chung', 'gia hạn visa']
      },

      'visa/jp-spouse': {
        title: 'Visa Vợ/chồng người Nhật｜Hồ sơ kết hôn, Quy trình nộp đơn và Thay đổi tư cách lưu trú - AIVisa',
        description:
          'Visa Vợ/chồng người Nhật: Hồ sơ kết hôn, bằng chứng sống chung, yêu cầu người bảo lãnh, tiêu chí xét duyệt, lý do từ chối và hướng dẫn thay đổi tư cách lưu trú。',
        keywords: ['visa vợ chồng Nhật', 'bảo lãnh', 'kết hôn', 'thay đổi tư cách', 'từ chối visa']
      },

      'visa/ltr': {
        title: 'Visa Định cư dài hạn Nhật Bản｜Điều kiện, Trường hợp áp dụng và Hồ sơ cần thiết - AIVisa',
        description:
          'Visa Định cư dài hạn: Các trường hợp áp dụng (định cư sau ly hôn, con của người Nhật, tư cách đặc biệt), điều kiện xét duyệt, hồ sơ cần thiết, yêu cầu bổ sung và hướng dẫn gia hạn。',
        keywords: ['định cư dài hạn', 'định cư sau ly hôn', 'đặc biệt', 'hồ sơ visa', 'gia hạn']
      },

      'visa/bm': {
        title:
          'Visa Kinh doanh – Quản lý Nhật Bản｜Thành lập công ty, Vốn yêu cầu và Quy trình nộp đơn - AIVisa',
        description:
          'Visa Kinh doanh – Quản lý: Điều kiện thành lập công ty, vốn đầu tư, yêu cầu văn phòng, điểm xét duyệt của kế hoạch kinh doanh, hồ sơ cần thiết, yêu cầu bổ sung và toàn bộ quy trình xin visa。',
        keywords: ['visa kinh doanh', 'startup visa Nhật', 'thành lập công ty', 'kế hoạch kinh doanh', 'văn phòng']
      },

      'visa/care': {
        title: 'Visa Điều dưỡng Nhật Bản｜Điều kiện, Kỳ thi kỹ năng và Hồ sơ cần thiết - AIVisa',
        description:
          'Visa Điều dưỡng (Care Worker): Điều kiện bằng cấp, hệ thống chứng chỉ điều dưỡng, tiêu chuẩn kỳ thi kỹ năng, yêu cầu của cơ sở tiếp nhận, hồ sơ cần thiết và điểm xét duyệt。',
        keywords: ['visa điều dưỡng', 'care worker', 'kỳ thi kỹ năng', 'cơ sở tiếp nhận']
      },

      'visa/skilled': {
        title: 'Visa Lao động kỹ năng Nhật Bản｜Ngành nghề áp dụng, Điều kiện và Hồ sơ - AIVisa',
        description:
          'Visa Lao động kỹ năng: Danh mục nghề nghiệp, yêu cầu chứng chỉ kỹ năng, điều kiện doanh nghiệp tiếp nhận, hồ sơ cần thiết, điểm xét duyệt và lưu ý khi chuyển việc。',
        keywords: ['visa kỹ năng', 'visa lao động Nhật', 'nghề nghiệp', 'chứng chỉ kỹ năng', 'chuyển việc']
      },

      'visa/tit': {
        title:
          'Visa Thực tập sinh kỹ năng Nhật Bản｜Điều kiện và Quy trình cho Thực tập sinh số 1・số 2 - AIVisa',
        description:
          'Visa Thực tập sinh kỹ năng (TIT) loại 1 & 2: Yêu cầu đối với tổ chức giám sát, điều kiện doanh nghiệp tiếp nhận, hồ sơ cần thiết, tiêu chí xét duyệt, yêu cầu bổ sung và quy trình nộp đơn。',
        keywords: ['thực tập sinh kỹ năng', 'TIT', 'tổ chức giám sát', 'doanh nghiệp tiếp nhận', 'xét duyệt visa']
      },

      'ask-ai': {
        title: 'Tư vấn Visa Nhật bằng AI｜Trả lời nhanh・Hướng dẫn hồ sơ・Giải thích chính sách - AIVisa',
        description:
          'AI Trợ lý Visa: Giải đáp ngay các câu hỏi về điều kiện xin visa Nhật, hồ sơ cần thiết, tiêu chí xét duyệt, yêu cầu bổ sung, lý do bị từ chối và hướng dẫn thủ tục thực tế。',
        keywords: ['AI visa', 'visa Nhật', 'tiêu chí xét duyệt', 'hồ sơ visa', 'từ chối visa']
      },

      'questionnaire': {
        title: 'Đánh giá & Gợi ý Visa｜AI phân tích hồ sơ & đề xuất tư cách phù hợp - AIVisa',
        description:
          'Trả lời vài câu hỏi để hệ thống tự động đề xuất loại visa phù hợp nhất, tạo danh sách hồ sơ cá nhân hóa, đánh giá điều kiện và hướng dẫn nộp đơn。',
        keywords: ['đánh giá visa', 'gợi ý visa', 'hồ sơ visa', 'tư cách lưu trú']
      },

      'tools/hsp-points': {
        title: 'Công cụ tính điểm HSP｜Tính trực tuyến・Xác định cộng điểm・Đánh giá điều kiện - AIVisa',
        description:
          'Giải thích hệ thống tính điểm HSP: cấu trúc điểm, hạng mục cộng điểm, cách tính học vấn/kinh nghiệm/thu nhập, tiêu chí xét duyệt và các câu hỏi thường gặp。',
        keywords: ['HSP điểm', 'kỹ năng cao', 'hệ thống tính điểm', 'cộng điểm']
      },

      'questionnaire/contact': {
        title: 'Liên hệ｜Tư vấn Visa Nhật・Hợp tác đối tác - AIVisa'
      },
      'about/faq': {
        title: 'Câu hỏi thường gặp FAQ｜Thông tin & Hướng dẫn visa Nhật Bản - AIVisa'
      },
      'legal/privacy': {
        title: 'Chính sách quyền riêng tư｜Bảo mật dữ liệu dịch vụ visa Nhật của AIVisa'
      },
      'legal/terms': {
        title: 'Điều khoản sử dụng｜Thỏa thuận dịch vụ nền tảng Visa Nhật AIVisa'
      }
    }
  }
};

export function getSeoMeta(locale: Locale, key?: string): SeoMeta {
  const conf = seoMetaMap[locale] || seoMetaMap.ja;
  if (key && conf.pages[key]) return conf.pages[key];
  return conf.default;
}
