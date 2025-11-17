import type { Locale } from '@/i18n/locales';

export type SeoMeta = { title?: string; description?: string };

// 写死的标题与描述（按页面 Key）。
// Key 约定：
// - 详情页：`visa/<slug>`（slug 为短路径：pr, engineer, ...）
// - 首页：`home`
// - 其它示例：`ask-ai`、`questionnaire`、`tools/hsp-points`
export const seoMetaMap: Record<Locale, { default: SeoMeta; pages: Record<string, SeoMeta> }> = {
  zh: {
  default: {
    description:
      "AIVisa：面向在日与准备赴日人群的日本签证信息平台。围绕真实申请场景系统整理每类在留资格的申请条件、材料清单、审查关注点、拒签原因、补件策略与续签要点，让你无需翻阅多个来源，也能一次看懂日本签证如何准备、如何提交、如何提升通过率。"
  },

  pages: {
    home: {
      title: "日本签证・在留资格全指南｜申请条件・材料清单・流程图解・拒签要点 - AIVisa",
      description:
        "全面覆盖日本主要签证：留学、工作、配偶、家族滞在、短期滞在、经营管理、高度人材到永住。按搜索意图拆分办理条件、材料要求、行程与说明书写法、审查重点、常见拒签原因、补件方式与续签要点。解决“日本签证怎么办”“签证被拒后能再申请吗”“材料怎么准备”这类高频问题，用一页看懂日本签证的完整路径与风险提示。"
    },

    /* 永住 */
    "visa/pr": {
      title: "日本永住申请指南｜永住条件・收入纳税标准・拒签原因・材料清单 - AIVisa",
      description:
        "日本永住怎么申请？需要几年在留？收入与纳税要达到多少？本页按申请人最关心的问题拆解永住条件（年限・收入线・纳税记录・素行要求）、材料清单、审查重点、常见拒签原因与补件策略。适合搜索“日本永住条件”“永住收入标准”“永住被拒怎么办”的用户，用一页完整理解永住的判断逻辑与提交流程。"
    },

    /* 留学 */
    "visa/study": {
      title: "日本留学签证申请全流程｜COE材料・资金证明・拒签原因・审查要点 - AIVisa",
      description:
        "留学签证需要准备哪些材料？COE 为什么会被拒？本页详细整理学校录取要求、COE（在留资格认定证明）材料清单、资金证明与担保人条件、入管审查重点、补件案例、拒签原因与避免办法，并结合入境后手续与续签要点。适合搜索“日本留学签证材料”“COE被拒怎么办”的同学按步骤准备。"
    },

    /* 技术/人文/国际业务 */
    "visa/engineer": {
      title: "日本工作签证（技人国）指南｜学历经验要求・雇主条件・转职影响・审查重点 - AIVisa",
      description:
        "日本工作签证怎么申请？学历或实际工作经验需要什么标准？转职会不会影响审查？本页系统讲解技术/人文/国际业务（技人国）的学历/经验要求、雇主条件、材料清单、审查重点、拒签原因与在留变更的注意事项，适合搜索“日本工作签证条件”“技人国转职影响”的用户。"
    },

    /* HSP-I */
    "visa/hsp-i": {
      title: "日本高度人材1号（HSP-I）｜积分计算・加分项目・材料清单・审查重点 - AIVisa",
      description:
        "高度人材积分怎么计算？多少分才能申请？本页按学历・职历・收入拆解积分构成与计算方法，整理加分项目、材料清单、常见补件内容、审查关注点与加速审批的关键提示。覆盖“高度人材几点能申请”“HSP积分怎么算”“HSP能不能快拿永住”等常见问题。"
    },

    /* HSP-II */
    "visa/hsp-ii": {
      title: "日本高度人材2号（HSP-II）｜永住优势・申请条件・材料与流程 - AIVisa",
      description:
        "高度人材2号有什么优势？是否能快速申请永住？本页整理HSP-II的适用条件、家属待遇、永住加速路径、材料清单、审查重点与常见补件说明。回答“高度人材2号和永住的关系”“HSP-II比1号好在哪里”，帮助理解从HSP到永住的实际路线图。"
    },

    /* 家属滞在 */
    "visa/dep": {
      title: "日本家族滞在签证｜配偶与子女申请条件・收入标准・材料清单・拒签要点 - AIVisa",
      description:
        "家族滞在签证怎么申请？收入要多少？需要哪些材料？本页讲解生计维持能力标准、担保条件、材料清单、续签审查重点与常见拒签原因，包括“收入不足怎么办”“家庭关系怎么证明”等关键点，帮助你降低拒签风险并提高通过率。"
    },

    /* 特定活动 */
    "visa/da": {
      title: "日本特定活动签证｜28号・46号・就业类条件・材料清单・审查重点 - AIVisa",
      description:
        "特定活动适用于哪些情况？28号、46号、就业类之间有什么区别？本页整理适用场景、申请条件、材料清单、入管审查重点、常见补件要求与拒签原因，帮助判断自己是否符合特定活动路线并按流程准备。"
    },

    /* SSW 特定技能 */
    "visa/ssw": {
      title: "日本特定技能（SSW）签证｜14行业要求・技能考试・申请步骤 - AIVisa",
      description:
        "特定技能怎么考？14个行业各有什么要求？本页整理SSW 1号/2号的行业标准、技能考试与日语考试基准、雇主条件、材料清单、审查重点与申请步骤。适合搜索“特定技能怎么申请”“SSW能不能转永住”的用户。"
    },

    /* 探亲 VR */
    "visa/vr": {
      title: "日本探亲签证｜邀请条件・担保材料・行程写法・拒签原因 - AIVisa",
      description:
        "探亲签证邀请函怎么写？被拒后能不能再申请？本页整理探亲条件、邀请流程、担保材料、往返计划书写法、常见拒签原因与补件说明，帮助你提高探亲签证的通过率。"
    },

    /* 短期滞在 */
    "visa/temp": {
      title: "日本短期滞在签证｜旅游・商务・探亲材料・行程写法・审查重点 - AIVisa",
      description:
        "日本旅游签证怎么准备？行程单怎么写？本页整理短期滞在（旅游/商务/探亲）的材料清单、行程计划书写法、经济能力证明、审查重点、拒签原因与补件要求，适合搜索“日本旅游签证材料”“短期滞在被拒怎么办”的用户。"
    },

    /* 永住者配偶 */
    "visa/pr-spouse": {
      title: "日本永住者配偶签证｜申请条件・婚姻真实性・材料清单・拒签要点 - AIVisa",
      description:
        "永住者配偶签证怎么证明婚姻真实性？本页整理收入要求、同居证明、婚姻实态审查重点、材料清单、续签流程、常见拒签原因与补件说明，帮助搜索“永住者配偶签证被拒怎么办”的用户做完整准备。"
    },

    /* 日本人配偶 */
    "visa/jp-spouse": {
      title: "日本人配偶签证｜结婚材料・同居证明・申请流程・拒签重点 - AIVisa",
      description:
        "日本结婚签证需要哪些材料？多久能下签？本页整理结婚登记材料、同居证明、担保标准、申请流程、审查重点、拒签原因与资格变更说明，适合搜索“日本人配偶签证怎么申请”的用户。"
    },

    /* 定住者 */
    "visa/ltr": {
      title: "日本定住者签证｜适用情形・申请条件・材料清单・审查重点 - AIVisa",
      description:
        "离婚后还能留在日本吗？本页整理定住者签证（离婚定住、日本人子女、特別许可）的适用情形、申请条件、材料清单、常见补件、续签审查重点，帮助你判断是否符合定住路线并做好准备。"
    },

    /* 经营管理 */
    "visa/bm": {
      title: "日本经营管理签证｜公司注册・投资金额・办公要件・申请流程 - AIVisa",
      description:
        "日本创业签证怎么申请？需要多少资本？本页整理公司设立条件、投资金额标准、办公场所要件、事业计划审查重点、材料清单、补件要点与完整申请流程，适合搜索“经营管理签证条件”“创业签证怎么准备”的用户。"
    },

    /* 介护 */
    "visa/care": {
      title: "日本介护签证｜资格要求・技能考试・材料清单・流程说明 - AIVisa",
      description:
        "介护签证需要什么资格？技能考试难吗？本页整理介护福祉士制度、技能考试内容、雇主条件、材料清单、审查重点与办理流程，帮助从事护理工作的申请人准备签证材料。"
    },

    /* 技能签证 */
    "visa/skilled": {
      title: "日本技能签证｜可从事职业范围・申请条件・材料清单・转职注意事项 - AIVisa",
      description:
        "技能签证可以做哪些工作？换公司会影响在留吗？本页整理可从事职业范围、技能证明要求、雇主条件、材料清单、审查重点与转职注意事项，适合搜索“技能签证职业范围”的用户。"
    },

    /* 技能实习 */
    "visa/tit": {
      title: "日本技能实习签证｜实习1号・2号条件・材料清单・流程 - AIVisa",
      description:
        "技能实习签证怎么申请？需要哪些文件？本页整理技能实习1号/2号的监理团体要求、接收企业条件、材料清单、审查重点、补件案例与办理流程，适合搜索“技能实习签证材料”的用户系统准备。"
    },

    /* AI 问答 */
    "ask-ai": {
      title: "AI日本签证咨询｜即时解答・材料指导・制度说明 - AIVisa",
      description:
        "不知道该办哪种日本签证？材料是否准备齐？被拒后怎么办？AI助手结合各类签证的申请条件、材料清单、审查要点、补件要求与拒签解析，提供即时可执行的办理建议。"
    },

    /* HSP 积分计算 */
    "tools/hsp-points": {
      title: "高度人材积分计算｜在线评分・加分判定・资格评估 - AIVisa",
      description:
        "日本高度人材（HSP）积分制度解析：积分构成、加分项、学历/职历/收入的计算方式，并提供在线自我评分思路与资格评估要点，帮助判断是否走高度人材路线。"
    },

    /* 联系 */
    "questionnaire/contact": {
      title: "联系我们｜日本签证咨询・合作申请 - AIVisa",
      description:
        "如需日本签证个案咨询、系统开发合作或与行政书士事务所、教育机构、不动产业者等建立合作关系，可通过本页面联系 AIVisa。"
    },

    /* FAQ */
    "about/faq": {
      title: "常见问题FAQ｜日本签证基础知识・流程说明 - AIVisa",
      description:
        "整理日本签证最常见问题：类型怎么选、材料怎么准备、审查多久、被拒能否再申请等，用问答形式快速扫盲，适合作为入门页面。"
    },

    /* 隐私 */
    "legal/privacy": {
      title: "隐私政策｜AIVisa日本签证服务隐私说明",
      description:
        "AIVisa 关于日本签证服务中个人信息的收集、使用与保护方针说明，明确数据管理方式与用户权利。"
    },

    /* 条款 */
    "legal/terms": {
      title: "使用条款｜AIVisa日本签证平台服务协议",
      description:
        "AIVisa 日本签证平台的使用条件、用户责任、禁止事项与免责声明说明，请在使用本服务前仔细阅读。"
    }
  }
},

  ja: {
  default: {
    description:
      "AIVisa は、日本の在留資格・ビザ情報を分かりやすく整理した情報プラットフォームです。各ビザの申請条件、必要書類、審査時の確認ポイント、よくある不許可理由、追加資料のポイント、更新時の注意点を実務視点でまとめ、日本での手続きが初めての方でも流れを把握できるように構成しています。"
  },

  pages: {
    home: {
      title: "日本のビザ・在留資格総合ガイド｜申請条件・必要書類・手続きの流れ・不許可ポイント - AIVisa",
      description:
        "留学、就労、配偶者、家族滞在、短期滞在、経営管理、高度人材、永住など主要な在留資格を網羅。申請条件、必要書類、審査で確認されるポイント、よくある不許可理由、追加資料の求められやすい項目、手続きの流れを検索意図ごとに分かりやすく整理。「日本のビザは何を準備すればいい？」「不許可になったら再申請できる？」等の疑問に1ページで対応。"
    },

    /* 永住 */
    "visa/pr": {
      title: "日本の永住申請ガイド｜要件・収入/納税基準・不許可理由・必要書類 - AIVisa",
      description:
        "永住は何年必要？収入と納税状況はどの程度求められる？本ページでは永住要件（在留年数・収入基準・納税・素行要件）、必要書類、審査の確認ポイント、よくある不許可理由、追加資料の方向性を実務視点で整理。「永住の収入基準」「永住が不許可だった場合の対応」を調べている方に最適。"
    },

    /* 留学 */
    "visa/study": {
      title: "日本の留学ビザ申請｜COE必要書類・資金証明・不許可理由・審査ポイント - AIVisa",
      description:
        "留学ビザの必要書類は？なぜ COE が不許可になる？学校の入学要件、COE 申請書類、資金証明と支弁者条件、審査ポイント、追加資料の例、不許可理由、入国後の手続きや更新の注意点をまとめています。「留学ビザの書類」「COE 不許可の原因」を知りたい方に。"
    },

    /* 技人国 */
    "visa/engineer": {
      title: "技術・人文知識・国際業務ビザ｜学歴/実務経験要件・雇用条件・転職時の注意・審査ポイント - AIVisa",
      description:
        "学歴や実務経験はどこまで必要？転職で不許可になる？本ページでは技術/人文知識/国際業務（いわゆる就労ビザ）の要件、雇用契約の確認事項、必要書類、審査で見られるポイント、よくある不許可理由、転職・在留資格変更時の注意点を整理。「就労ビザ 条件」「技人国 転職」の検索意図に対応。"
    },

    /* HSP-I */
    "visa/hsp-i": {
      title: "高度専門職1号（HSP-I）｜ポイント計算・加点項目・必要書類・審査の確認点 - AIVisa",
      description:
        "高度専門職のポイントはどう計算する？必要な点数は？本ページでは学歴・職歴・年収のポイント計算、加点項目、必要書類、よくある追加資料、審査の確認ポイントを具体的に整理。「HSP 計算方法」「高度専門職の要件」を探している方に。"
    },

    /* HSP-II */
    "visa/hsp-ii": {
      title: "高度専門職2号（HSP-II）｜要件・家族待遇・永住へのメリット・必要書類 - AIVisa",
      description:
        "高度専門職2号のメリットは？永住申請に有利？本ページでは HSP-II の適用条件、家族の待遇、永住への移行の仕組み、必要書類、審査の確認ポイント、よくある追加資料を整理し、「高度専門職2号 永住」「HSP 1号との違い」の検索意図に対応。"
    },

    /* 家族滞在 */
    "visa/dep": {
      title: "家族滞在ビザ｜配偶者・子の要件・収入基準・必要書類・不許可ポイント - AIVisa",
      description:
        "家族滞在の収入基準は？扶養が認められる条件は？本ページでは配偶者・子の家族滞在要件、生活維持能力の基準、必要書類、審査でよく確認されるポイント、不許可理由、更新時の注意点を整理。「家族滞在 収入」「家族滞在 不許可」の疑問に対応。"
    },

    /* 特定活動（28・46・就職） */
    "visa/da": {
      title: "特定活動ビザ｜28号・46号・就労類型の要件・書類・審査ポイント - AIVisa",
      description:
        "特定活動28号・46号の違いは？どのケースが対象？本ページでは類型ごとの適用ケース、申請要件、必要書類、審査の着眼点、追加資料の求められやすい項目、不許可理由を整理。自分が特定活動に該当するか判断したい方に。"
    },

    /* 特定技能 SSW */
    "visa/ssw": {
      title: "特定技能（SSW）｜14分野の要件・技能試験・日本語試験・申請手順 - AIVisa",
      description:
        "特定技能の試験は難しい？どの分野が対象？本ページでは SSW 1号/2号の14分野要件、技能試験・日本語試験基準、雇用契約のポイント、必要書類、審査項目、申請ステップを整理。「特定技能 申請方法」「SSW 永住」の検索意図にも対応。"
    },

    /* 探親（短期滞在 親族訪問） */
    "visa/vr": {
      title: "親族訪問（探親）ビザ｜招へい手続き・保証書・行程表・不許可理由 - AIVisa",
      description:
        "招へい理由書や行程表はどう書く？不許可の原因は？本ページでは招へい手続き、必要書類、保証人の条件、行程表の書き方、よくある不許可理由、追加資料を整理し、「親族訪問ビザ 書類」「探親 不許可」の疑問に対応。"
    },

    /* 短期滞在（観光・商用・親族訪問） */
    "visa/temp": {
      title: "短期滞在ビザ｜観光・商用・親族訪問の必要書類・行程表・審査ポイント - AIVisa",
      description:
        "観光ビザの行程表はどう作る？経済能力はどこまで必要？本ページでは短期滞在（観光/商用/親族訪問）の必要書類、行程表の作り方、審査ポイント、よくある不許可理由、追加資料の注意点を整理。「日本 観光ビザ 書類」「短期滞在 不許可」を調べる方に最適。"
    },

    /* 永住者配偶者 */
    "visa/pr-spouse": {
      title: "永住者の配偶者ビザ｜婚姻実態の確認ポイント・必要書類・不許可理由 - AIVisa",
      description:
        "婚姻実態はどう証明する？本ページでは永住者の配偶者ビザの要件、収入・同居状況の確認ポイント、必要書類、審査でよく見られる点、不許可理由、追加資料を整理。「永住者 配偶者ビザ 不許可」を調べる方に。"
    },

    /* 日本人配偶者 */
    "visa/jp-spouse": {
      title: "日本人の配偶者ビザ｜結婚手続き・同居証明・申請手順・不許可理由 - AIVisa",
      description:
        "日本人配偶者ビザは何を準備すればいい？本ページでは結婚手続きに必要な書類、同居実態の確認項目、申請手順、審査ポイント、よくある不許可理由、在留資格変更の注意点を整理。「日本人 配偶者ビザ 申請」の検索意図に最適。"
    },

    /* 定住者 */
    "visa/ltr": {
      title: "定住者ビザ｜該当事例（離婚・日本人子・特別許可）・要件・必要書類・審査 - AIVisa",
      description:
        "離婚後でも在留できる？本ページでは定住者ビザの代表的な該当例（離婚定住、日本人の子、特別許可）、要件、必要書類、追加資料、審査の確認ポイント、更新時の注意点を整理。「定住者ビザ 条件」を知りたい方に。"
    },

    /* 経営管理 */
    "visa/bm": {
      title: "経営管理ビザ｜会社設立・投資額・事業計画・オフィス要件・申請手順 - AIVisa",
      description:
        "経営管理ビザに必要な資本金は？オフィスは必須？本ページでは会社設立手続き、投資額基準、オフィス要件、事業計画の確認ポイント、必要書類、追加資料、申請の流れを整理。「経営管理ビザ 条件」「日本で起業 ビザ」を探す方に最適。"
    },

    /* 介護 */
    "visa/care": {
      title: "介護ビザ｜資格要件・介護福祉士制度・技能試験・必要書類 - AIVisa",
      description:
        "介護ビザの資格は？技能試験内容は？本ページでは介護福祉士制度、技能試験の概要、雇用条件、必要書類、審査のポイント、手続きの流れを整理し、「介護ビザ 申請」の検索意図に対応。"
    },

    /* 技能 */
    "visa/skilled": {
      title: "技能ビザ｜対象職種・技能証明・雇用条件・書類・転職時の注意点 - AIVisa",
      description:
        "どの職種が技能ビザの対象？転職は可能？本ページでは対象職種、技能証明の方法、雇用条件、必要書類、審査のポイント、転職時の注意点を整理。「技能ビザ 職種」などの検索意図に対応。"
    },

    /* 技能実習 */
    "visa/tit": {
      title: "技能実習ビザ｜1号・2号の要件・受入企業条件・必要書類・手続き - AIVisa",
      description:
        "技能実習ビザは何を準備する？本ページでは技能実習1号/2号の監理団体の要件、受入企業の条件、必要書類、審査ポイント、追加資料、申請手順を整理。"
    },

    /* AI問答 */
    "ask-ai": {
      title: "AIビザ相談｜即時回答・書類確認ポイント・制度の基礎解説 - AIVisa",
      description:
        "どのビザを選べばいい？必要書類が足りている？不許可後はどうすべき？AIが申請条件、必要書類、審査ポイント、追加資料、不許可理由の整理など、疑問に即時回答。"
    },

    /* HSPポイント計算 */
    "tools/hsp-points": {
      title: "高度専門職ポイント計算｜スコア算出・加点項目・自己診断ガイド - AIVisa",
      description:
        "高度専門職（HSP）のポイント制度を分かりやすく解説。学歴/職歴/年収の計算方法、加点項目、スコアの目安、自己診断のポイントを整理。"
    },

    /* 問い合わせ */
    "questionnaire/contact": {
      title: "お問い合わせ｜ビザ相談・業務連携のご依頼 - AIVisa",
      description:
        "個別のビザ相談、業務提携、システム開発などのご相談はこちらからお問い合わせいただけます。"
    },

    /* FAQ */
    "about/faq": {
      title: "よくある質問（FAQ）｜在留資格の基本・準備・手続きの流れ - AIVisa",
      description:
        "在留資格の種類の違い、必要書類、審査期間、不許可時の対応など、よくある疑問をQ&A形式で整理。"
    },

    /* プライバシー */
    "legal/privacy": {
      title: "プライバシーポリシー｜AIVisa 個人情報の取り扱いについて",
      description:
        "AIVisa における個人情報の取得・利用・管理方法および利用者の権利について説明します。"
    },

    /* 利用規約 */
    "legal/terms": {
      title: "利用規約｜AIVisa サービス利用に関する基本ルール",
      description:
        "AIVisa のサービス利用条件、禁止事項、免責事項など、利用者に遵守いただく内容を記載しています。"
    }
  }
},

  en: {
  default: {
    description:
      "AIVisa is a practical information platform that breaks down Japan’s visa and residency procedures in clear, step-by-step detail. Each visa type is explained with eligibility requirements, document checklists, key screening points, common reasons for denial, how to prepare supplemental documents, and renewal tips—helping you understand what to prepare and how to improve your approval chances."
  },

  pages: {
    home: {
      title: "Japan Visa & Residence Guide｜Requirements, Documents, Application Steps, Screening Points - AIVisa",
      description:
        "A complete overview of Japan’s major visa categories—study, work, spouse, family stay, short-term stay, business manager, highly skilled professional (HSP), permanent residency, and more. Covers eligibility requirements, document checklists, itinerary preparation, screening points, common denial reasons, and supplemental document strategies. Answers key questions like “How do I apply for a Japan visa?”, “Why was my visa denied?”, and “What documents do I need?” in one page."
    },

    /* Permanent Residency */
    "visa/pr": {
      title: "Japan Permanent Residency (PR) Guide｜Eligibility, Income/Tax Standards, Denial Reasons, Required Documents - AIVisa",
      description:
        "How do you qualify for PR in Japan? How many years of residence are required? What income and tax records are expected? This page explains PR requirements (years of residence, income standard, tax compliance, conduct), required documents, key screening points, common denial reasons, and how to prepare supplemental evidence. Ideal for searches like “Japan PR requirements” or “PR denied what to do”."
    },

    /* Study Visa */
    "visa/study": {
      title: "Japan Student Visa Guide｜COE Documents, Financial Proof, Denial Reasons, Screening Points - AIVisa",
      description:
        "What documents are needed for a student visa? Why do COE applications get denied? This guide covers school admission requirements, COE document checklist, financial proof and guarantor conditions, immigration screening points, common supplemental requests, denial reasons, and post-arrival/renewal procedures. Ideal for “Japan student visa documents” and “COE denied reasons”."
    },

    /* Engineer/Specialist in Humanities/International Services */
    "visa/engineer": {
      title: "Japan Work Visa (Engineer / Humanities / International Services)｜Education/Experience Requirements, Employer Conditions, Job Change Rules - AIVisa",
      description:
        "Do you qualify for a Japan work visa? Does changing jobs affect your visa status? This page explains education/experience requirements, employer and contract conditions, required documents, key screening points, common denial reasons, and what to consider when changing jobs or applying for a status change. Matches search intents like “Japan work visa requirements” and “Changing jobs on Engineer/Humanities visa”."
    },

    /* HSP-I */
    "visa/hsp-i": {
      title: "Highly Skilled Professional (HSP) Type I｜Point Calculation, Bonus Categories, Documents, Screening Points - AIVisa",
      description:
        "How are HSP points calculated? What score is needed? This guide explains the HSP point system based on education, professional experience, and annual income; bonus point categories; required documents; common supplemental evidence; and key screening points. Covers queries like “HSP point calculation” and “HSP requirements Japan”."
    },

    /* HSP-II */
    "visa/hsp-ii": {
      title: "Highly Skilled Professional (HSP) Type II｜Advantages, Eligibility, PR Fast-Track, Required Documents - AIVisa",
      description:
        "What are the benefits of HSP Type II? Does it help with permanent residency? This page explains HSP-II eligibility, family benefits, the PR fast-track pathway, required documents, screening priorities, and typical supplemental requests. Ideal for searches like “HSP II benefits” or “HSP to PR Japan”."
    },

    /* Dependent Visa */
    "visa/dep": {
      title: "Japan Dependent Visa｜Spouse/Child Eligibility, Income Standard, Required Documents, Screening Points - AIVisa",
      description:
        "How much income is required to sponsor dependents? What documents are needed to prove family ties? This page covers eligibility for spouse/child dependents, financial requirements, required documents, screening points, common denial reasons, and renewal considerations. Ideal for “Japan dependent visa income requirement” or “Dependent visa denied reasons”."
    },

    /* Designated Activities */
    "visa/da": {
      title: "Japan Designated Activities Visa｜Types (28, 46, Employment), Eligibility, Documents, Screening Points - AIVisa",
      description:
        "Unsure whether your situation fits a Designated Activities category? This guide explains major types (28, 46, employment-related), eligibility criteria, required documents, screening points, common supplemental requests, and denial reasons—helping you determine whether this route applies to your case."
    },

    /* SSW */
    "visa/ssw": {
      title: "Specified Skilled Worker (SSW)｜14 Sectors, Skills Exams, Language Tests, Application Steps - AIVisa",
      description:
        "How difficult are SSW exams? Which industries are eligible? This page explains SSW Type 1/2 requirements, skills exams, Japanese language tests, employer conditions, required documents, screening points, and application steps. Ideal for searches like “SSW Japan apply” or “Specified Skilled Worker requirements”."
    },

    /* Visiting Relatives / Kinship Visa */
    "visa/vr": {
      title: "Japan Visiting Relatives (Kinship) Visa｜Invitation Letter, Sponsor Documents, Itinerary, Denial Reasons - AIVisa",
      description:
        "How do you write a proper invitation letter or itinerary? Why are kinship visas denied? This page explains invitation procedures, sponsor requirements, document checklists, itinerary preparation, common denial reasons, and supplemental document strategies."
    },

    /* Short-Term Stay Visa */
    "visa/temp": {
      title: "Japan Short-Term Stay Visa｜Tourism, Business, Visiting Relatives｜Documents, Itinerary, Screening Points - AIVisa",
      description:
        "What documents are needed for a Japan tourist visa? How detailed should the itinerary be? This guide covers document checklists for tourism/business/relative visits, itinerary writing tips, financial proof, screening points, common denial reasons, and supplemental requests. Ideal for “Japan tourist visa documents” and “short-term stay denied reasons”."
    },

    /* PR Spouse */
    "visa/pr-spouse": {
      title: "Spouse of Permanent Resident Visa｜Eligibility, Proof of Marriage, Documents, Denial Reasons - AIVisa",
      description:
        "How do you prove a genuine marriage? This page explains eligibility, financial requirements, cohabitation evidence, required documents, screening points, common denial reasons, and supplemental documentation tips. Useful for “Spouse of PR visa denied Japan”."
    },

    /* Japanese Spouse */
    "visa/jp-spouse": {
      title: "Spouse of Japanese National Visa｜Marriage Documents, Cohabitation Proof, Application Steps - AIVisa",
      description:
        "What documents are required for a spouse visa? How long does approval take? This guide explains marriage documentation, cohabitation proof, guarantor requirements, application procedures, screening points, and denial reasons. Matches queries like “Japan spouse visa requirements” and “How to apply for Japanese spouse visa”."
    },

    /* Long-Term Resident */
    "visa/ltr": {
      title: "Japan Long-Term Resident (LTR) Visa｜Eligible Cases (Divorce, Child of Japanese, Special Permission) - AIVisa",
      description:
        "Can you stay in Japan after divorce? This page explains major LTR categories—divorce, child of Japanese national, special permission—along with eligibility, required documents, supplemental evidence, screening points, and renewal considerations. Ideal for “Japan LTR visa requirements”."
    },

    /* Business Manager */
    "visa/bm": {
      title: "Japan Business Manager Visa｜Company Setup, Investment Requirements, Office Rules, Application Process - AIVisa",
      description:
        "How much capital is required for a business manager visa? Is a physical office mandatory? This page covers company establishment steps, investment standards, office requirements, business plan screening points, required documents, supplemental evidence, and application procedures. Useful for “Japan startup visa requirements”."
    },

    /* Caregiver */
    "visa/care": {
      title: "Japan Caregiver Visa｜Qualification Requirements, Skills Exams, Required Documents - AIVisa",
      description:
        "What qualifications are needed for a caregiver visa? What does the skills exam cover? This page explains caregiver certification rules, skills exam content, employer conditions, document checklist, screening priorities, and application flow."
    },

    /* Skilled */
    "visa/skilled": {
      title: "Japan Skilled Labor Visa｜Eligible Occupations, Skill Proof, Employer Conditions, Job Change Rules - AIVisa",
      description:
        "Which jobs qualify for a Skilled Labor visa? Can you change employers? This page summarizes eligible occupations, skill proof requirements, employer conditions, required documents, screening points, and job-change considerations."
    },

    /* Technical Intern Training */
    "visa/tit": {
      title: "Japan Technical Intern Training Visa｜Type 1/2 Requirements, Host Company Conditions, Documents - AIVisa",
      description:
        "What documents are needed for the Technical Intern Training visa? This page covers Type 1/2 requirements, supervising organization conditions, host company rules, document checklists, screening points, and common supplemental requests."
    },

    /* Ask AI */
    "ask-ai": {
      title: "AI Visa Assistant｜Instant Answers, Document Guidance, Policy Explanations - AIVisa",
      description:
        "Not sure which visa to apply for? Missing documents? Worried about a previous denial? The AI Assistant provides instant guidance on eligibility, document preparation, screening points, supplemental evidence, and denial reasons across all major visa types."
    },

    /* HSP Points Tool */
    "tools/hsp-points": {
      title: "HSP Point Calculator｜Scoring Guide, Bonus Points, Self-Assessment Tips - AIVisa",
      description:
        "A clear breakdown of Japan’s Highly Skilled Professional point system: point structure, bonus categories, calculation examples, and how to self-assess eligibility."
    },

    /* Contact */
    "questionnaire/contact": {
      title: "Contact Us｜Visa Consultation & Business Cooperation - AIVisa",
      description:
        "For individual visa consultations, business cooperation, or system development inquiries, please contact the AIVisa team through this page."
    },

    /* FAQ */
    "about/faq": {
      title: "FAQ｜Japan Visa Basics, Document Preparation, Application Flow - AIVisa",
      description:
        "A collection of frequently asked questions covering visa types, required documents, screening periods, renewal notes, and what to do if your visa is denied."
    },

    /* Privacy */
    "legal/privacy": {
      title: "Privacy Policy｜Handling of Personal Information - AIVisa",
      description:
        "Details on how AIVisa collects, uses, and manages personal information related to visa services, along with user rights and data protection guidelines."
    },

    /* Terms */
    "legal/terms": {
      title: "Terms of Use｜AIVisa Service Usage Rules",
      description:
        "The terms, user responsibilities, prohibited actions, and disclaimers for using AIVisa’s services. Please read carefully before using the platform."
    }
  }
},

  ko: {
  default: {
    description:
      "AIVisa는 일본 비자·재류자격 신청에 필요한 정보를 실제 사례 기반으로 정리한 플랫폼입니다. 각 비자 종류의 신청 요건, 필요 서류, 심사 포인트, 불허 사유, 추가 서류 준비 방법, 갱신 시 주의사항을 단계별로 안내하여 처음 신청하는 분도 전체 흐름을 이해할 수 있도록 구성했습니다."
  },

  pages: {
    home: {
      title: "일본 비자·재류자격 종합 가이드｜신청 요건·필요 서류·절차·심사 포인트 - AIVisa",
      description:
        "유학, 취업, 일본인/영주자 배우자, 가족체류, 단기체류, 경영관리, 고도인재(HSP), 영주 등 주요 비자를 한눈에 정리했습니다. 신청 요건, 서류 체크리스트, 심사 포인트, 불허 사유, 추가 서류, 절차 흐름까지 상세 설명. “일본 비자 어떻게 신청?” “비자 불허 이유?” “어떤 서류가 필요한가?” 같은 질문에 한 페이지로 답합니다."
    },

    /* 영주 비자 */
    "visa/pr": {
      title: "일본 영주 비자 가이드｜요건·소득/납세 기준·불허 사유·필요 서류 - AIVisa",
      description:
        "영주 비자는 몇 년이 필요할까? 소득·납세 기준은? 이 페이지에서는 영주 요건(재류 기간, 소득 기준, 납세 기록, 품행), 필요 서류, 심사 포인트, 자주 발생하는 불허 사유, 추가 자료 준비 방법을 정리했습니다. “일본 영주 요건” “영주 불허 시 대처법”을 찾는 분에게 적합합니다."
    },

    /* 유학 비자 */
    "visa/study": {
      title: "일본 유학 비자｜COE 서류, 자금 증명, 불허 사유, 심사 포인트 - AIVisa",
      description:
        "유학 비자에는 어떤 서류가 필요할까? COE가 왜 불허될까? 본 페이지에서는 학교 입학 요건, COE 준비 서류, 자금 증명/보증인 요건, 심사 포인트, 추가 자료 요청 사례, 불허 사유, 입국 후 절차와 갱신 요점까지 정리합니다. “일본 유학 비자 서류” “COE 불허 이유” 검색 의도에 대응합니다."
    },

    /* 취업 비자 (기술·인문지식·국제업무) */
    "visa/engineer": {
      title: "일본 취업 비자(기술·인문지식·국제업무)｜학력/경력 요건·고용 조건·이직 영향 - AIVisa",
      description:
        "일본 취업 비자 요건은? 학력·경력 기준은? 이직하면 비자에 영향이 있을까? 본 페이지는 기술·인문지식·국제업무 비자의 요건, 고용계약 조건, 필요 서류, 심사 포인트, 불허 사유, 이직·재류자격 변경 시 주의사항을 상세히 안내합니다."
    },

    /* 고도인재 1호 */
    "visa/hsp-i": {
      title: "고도인재(HSP) 1호｜포인트 계산·가점 항목·필요 서류·심사 포인트 - AIVisa",
      description:
        "고도인재 포인트는 어떻게 계산할까? 몇 점이면 신청 가능할까? 학력·경력·연수입을 기준으로 한 포인트 계산 구조, 가점 항목, 필요 서류, 자주 요구되는 추가 자료, 심사 포인트를 명확히 정리했습니다. “HSP 점수 계산” 검색 의도에 대응합니다."
    },

    /* 고도인재 2호 */
    "visa/hsp-ii": {
      title: "고도인재(HSP) 2호｜요건·가족 혜택·영주 신청 이점·필요 서류 - AIVisa",
      description:
        "고도인재 2호의 장점은 무엇일까? 영주 취득에 유리할까? 본 페이지는 HSP-II 요건, 가족 혜택, 영주 신청과의 관계, 필요 서류, 심사 포인트, 추가 자료 방향성을 정리합니다."
    },

    /* 가족체류 */
    "visa/dep": {
      title: "일본 가족체류 비자｜배우자/자녀 요건·소득 기준·필요 서류·불허 포인트 - AIVisa",
      description:
        "가족체류 비자의 소득 기준은? 가족관계는 어떻게 증명할까? 본 페이지에서는 배우자·자녀의 체류 요건, 생계 유지 능력 기준, 필요 서류, 심사 포인트, 불허 사유 및 갱신 시 주의사항을 안내합니다."
    },

    /* 특정활동 */
    "visa/da": {
      title: "일본 특정활동 비자｜28호·46호·취업형 요건·필요 서류·심사 포인트 - AIVisa",
      description:
        "특정활동 28호·46호는 어떤 경우에 해당할까? 본 페이지는 유형별 적용 사례, 신청 요건, 필요 서류, 심사 포인트, 추가 자료 요청이 많은 항목, 불허 사유를 정리합니다."
    },

    /* 특정기능 SSW */
    "visa/ssw": {
      title: "일본 특정기능(SSW)｜14개 분야 요건·기술시험·신청 절차 - AIVisa",
      description:
        "SSW 시험은 어렵나? 어떤 업종이 대상인가? 본 페이지는 SSW 1호/2호의 업종 요건, 기술시험/일본어 시험 기준, 고용 조건, 필요 서류, 심사 포인트, 신청 절차를 정리합니다."
    },

    /* 친족방문 */
    "visa/vr": {
      title: "일본 친족방문 비자｜초청 절차·보증 서류·일정표 작성·불허 사유 - AIVisa",
      description:
        "초청 이유서는 어떻게 작성할까? 친족방문 비자가 불허되는 이유는? 본 페이지는 초청 절차, 보증 서류, 일정표 작성 요령, 불허 사유, 추가 자료 포인트를 정리합니다."
    },

    /* 단기체류 */
    "visa/temp": {
      title: "일본 단기체류 비자｜관광·상용·친족방문 서류·일정표·심사 포인트 - AIVisa",
      description:
        "관광 비자에 필요한 서류는? 일정표는 얼마나 상세해야 할까? 본 페이지는 단기체류(관광/상용/친족) 서류 목록, 일정표 작성 팁, 재정 능력 증명, 심사 포인트, 불허 사유 및 추가 자료 요청 예시를 제공합니다."
    },

    /* 영주자 배우자 */
    "visa/pr-spouse": {
      title: "영주자 배우자 비자｜혼인 실체 확인·필요 서류·불허 사유 - AIVisa",
      description:
        "혼인의 실체는 어떻게 증명할까? 본 페이지는 영주자 배우자 비자의 요건, 소득·동거 상황 확인 포인트, 필요 서류, 심사 포인트, 불허 사유, 추가 자료 방향성을 설명합니다."
    },

    /* 일본인 배우자 */
    "visa/jp-spouse": {
      title: "일본인 배우자 비자｜결혼 서류·동거 증명·신청 절차·불허 사유 - AIVisa",
      description:
        "일본인 배우자 비자 신청 시 어떤 서류가 필요할까? 본 페이지는 결혼 관련 서류, 동거 실태 확인, 신청 절차, 심사 포인트, 불허 사유, 재류자격 변경 시 주의점을 정리합니다."
    },

    /* 정주자 */
    "visa/ltr": {
      title: "정주자 비자｜해당 사례(이혼·일본인 자녀·특별허가)·요건·필요 서류 - AIVisa",
      description:
        "이혼 후 일본에서 계속 체류할 수 있을까? 본 페이지는 정주자 비자 적용 사례, 요건, 필요 서류, 추가 자료, 심사 포인트, 갱신 시 주의사항을 정리합니다."
    },

    /* 경영관리 */
    "visa/bm": {
      title: "경영관리 비자｜회사 설립·투자금·오피스 요건·신청 절차 - AIVisa",
      description:
        "경영관리 비자에는 자본금이 얼마나 필요할까? 오피스는 필수일까? 본 페이지는 회사 설립 단계, 투자 기준, 오피스 요건, 사업계획 심사 포인트, 필요 서류, 추가 자료, 절차 흐름을 상세히 설명합니다."
    },

    /* 개호 */
    "visa/care": {
      title: "일본 개호 비자｜자격 요건·기술시험·필요 서류·절차 안내 - AIVisa",
      description:
        "개호 비자에 필요한 자격은? 기술시험은 어떤 내용일까? 본 페이지는 개호 복지사 제도, 기술시험 개요, 고용 조건, 필요 서류, 심사 포인트를 정리했습니다."
    },

    /* 기능 비자 */
    "visa/skilled": {
      title: "일본 기능 비자｜대상 직종·기능 증명·고용 조건·이직 시 주의점 - AIVisa",
      description:
        "어떤 직종이 기능 비자 대상일까? 이직은 가능한가? 대상 직종, 기능 증명 방법, 고용 조건, 필요 서류, 심사 포인트, 이직 시 주의점을 정리했습니다."
    },

    /* 기능실습 */
    "visa/tit": {
      title: "기능실습 비자｜1호/2호 요건·수용 기업 조건·필요 서류·절차 - AIVisa",
      description:
        "기능실습 비자 준비는 어떻게 해야 할까? 본 페이지는 기능실습 1호·2호 요건, 감독단체/수용 기업 조건, 필요 서류, 심사 포인트, 추가 자료 예시를 제공합니다."
    },

    /* AI 상담 */
    "ask-ai": {
      title: "AI 일본 비자 상담｜즉시 답변·서류 체크·기본 제도 설명 - AIVisa",
      description:
        "어떤 비자를 신청해야 할지 모르겠나요? 서류가 충분한지 걱정되나요? AI 상담이 비자 요건, 필요한 서류, 심사 포인트, 추가 자료, 불허 사유 등을 즉시 안내합니다."
    },

    /* HSP 포인트 도구 */
    "tools/hsp-points": {
      title: "고도인재 포인트 계산기｜점수 계산·가점 기준·자기 진단 - AIVisa",
      description:
        "일본 고도인재(HSP) 포인트 제도를 구조적으로 설명합니다. 점수 구성, 가점 항목, 계산 방법, 자기 진단 포인트를 정리했습니다."
    },

    /* 문의 */
    "questionnaire/contact": {
      title: "문의하기｜비자 상담·업무 협력 - AIVisa",
      description:
        "비자 개별 상담, 협업 요청, 시스템 개발 관련 문의는 이 페이지를 통해 연락해 주세요."
    },

    /* FAQ */
    "about/faq": {
      title: "자주 묻는 질문(FAQ)｜비자 기본·준비 서류·절차 - AIVisa",
      description:
        "비자 종류, 필요 서류, 심사 기간, 불허 시 대응 등 자주 묻는 질문을 Q&A 형식으로 정리했습니다."
    },

    /* 개인정보처리방침 */
    "legal/privacy": {
      title: "개인정보 처리방침｜AIVisa 개인정보 보호 정책",
      description:
        "AIVisa에서 수집하는 개인정보, 이용 목적, 관리 방법과 이용자의 권리에 대해 설명합니다."
    },

    /* 이용약관 */
    "legal/terms": {
      title: "이용약관｜AIVisa 서비스 이용 규정",
      description:
        "AIVisa 서비스 이용 조건, 사용자 의무, 금지 사항, 면책 조항 등을 안내합니다."
    }
  }
},

  vi: {
  default: {
    description:
      "AIVisa là nền tảng thông tin thực tế về thị thực và tư cách lưu trú Nhật Bản, giúp bạn hiểu rõ điều kiện, hồ sơ, điểm trọng tâm khi xét duyệt, lý do bị từ chối, cách bổ sung giấy tờ và lưu ý khi gia hạn. Nội dung được trình bày theo từng tình huống cụ thể để người mới cũng có thể nắm được toàn bộ quy trình."
  },

  pages: {
    home: {
      title:
        "Visa & Tư cách lưu trú Nhật Bản｜Điều kiện, Hồ sơ, Quy trình, Điểm xét duyệt quan trọng - AIVisa",
      description:
        "Tổng hợp các loại visa chính của Nhật Bản: du học, lao động, vợ/chồng, phụ thuộc, lưu trú ngắn hạn, kinh doanh – quản lý, kỹ năng cao (HSP), định cư dài hạn, PR… Mỗi loại đều được giải thích rõ điều kiện, hồ sơ cần chuẩn bị, cách viết lịch trình/giải trình, điểm dễ bị soi khi xét duyệt, lý do từ chối thường gặp và cách xử lý. Giải đáp các câu hỏi như “Xin visa Nhật cần gì?”, “Vì sao visa bị từ chối?”, “Có xin lại được không?” trong một trang tổng quan."
    },

    /* PR - Định cư vĩnh viễn */
    "visa/pr": {
      title:
        "Visa Định cư vĩnh viễn Nhật Bản (PR)｜Điều kiện, Tiêu chuẩn thu nhập/thuế, Lý do từ chối, Hồ sơ cần thiết - AIVisa",
      description:
        "Muốn xin PR Nhật Bản cần bao nhiêu năm lưu trú? Thu nhập và đóng thuế phải ở mức nào? Trang này giải thích rõ điều kiện PR (thời gian cư trú, thu nhập, lịch sử đóng thuế, tiêu chí về nhân thân), danh sách hồ sơ, điểm xét duyệt chính, lý do từ chối thường gặp và hướng chuẩn bị bổ sung. Phù hợp với những ai đang tìm “điều kiện xin PR Nhật”, “PR Nhật bị rớt phải làm sao”."
    },

    /* Du học */
    "visa/study": {
      title:
        "Visa Du học Nhật Bản｜Hồ sơ COE, Chứng minh tài chính, Lý do từ chối, Điểm xét duyệt - AIVisa",
      description:
        "Xin visa du học Nhật cần những giấy tờ gì? Vì sao COE bị từ chối? Trang này trình bày điều kiện nhập học, bộ hồ sơ COE, yêu cầu chứng minh tài chính và người bảo lãnh, các điểm mà Cục xuất nhập cảnh thường xem xét, ví dụ về yêu cầu bổ sung, lý do bị từ chối và lưu ý sau khi nhập cảnh/ gia hạn. Phù hợp với từ khóa “hồ sơ xin visa du học Nhật”, “COE Nhật bị rớt”."
    },

    /* Kỹ sư / Nhân văn / Nghiệp vụ quốc tế */
    "visa/engineer": {
      title:
        "Visa Kỹ sư / Nhân văn / Nghiệp vụ quốc tế Nhật Bản｜Điều kiện học vấn/kinh nghiệm, Hợp đồng lao động, Đổi việc - AIVisa",
      description:
        "Có đủ điều kiện xin visa lao động Nhật hay không? Đổi công ty có ảnh hưởng gì đến visa? Trang này giải thích điều kiện về học vấn/kinh nghiệm, yêu cầu đối với công ty tuyển dụng và hợp đồng lao động, danh sách hồ sơ, điểm xét duyệt, lý do từ chối thường gặp và những lưu ý khi chuyển việc hoặc đổi tư cách lưu trú."
    },

    /* HSP-I */
    "visa/hsp-i": {
      title:
        "Visa Kỹ năng cao Nhật Bản loại I (HSP-I)｜Cách tính điểm, Hạng mục cộng điểm, Hồ sơ, Điểm xét duyệt - AIVisa",
      description:
        "Điểm HSP được tính như thế nào? Cần bao nhiêu điểm để xin? Trang này giải thích hệ thống tính điểm HSP dựa trên học vấn, kinh nghiệm làm việc và thu nhập; các hạng mục cộng điểm; hồ sơ cần chuẩn bị; những loại giấy tờ hay bị yêu cầu bổ sung; và các điểm được chú ý khi xét duyệt. Phù hợp với những ai tìm “tính điểm HSP Nhật”, “điều kiện xin visa kỹ năng cao Nhật Bản”."
    },

    /* HSP-II */
    "visa/hsp-ii": {
      title:
        "Visa Kỹ năng cao Nhật Bản loại II (HSP-II)｜Điều kiện, Quyền lợi gia đình, Hỗ trợ xin PR, Hồ sơ cần thiết - AIVisa",
      description:
        "Visa HSP-II có lợi gì so với HSP-I? Có giúp rút ngắn thời gian xin PR không? Trang này giải thích điều kiện để chuyển lên HSP-II, quyền lợi khi đi kèm gia đình, cách HSP-II liên quan đến đường đi tới PR, các loại hồ sơ cần chuẩn bị, điểm xét duyệt và loại giấy tờ thường được yêu cầu bổ sung."
    },

    /* Phụ thuộc */
    "visa/dep": {
      title:
        "Visa Phụ thuộc Nhật Bản｜Điều kiện cho vợ/chồng, con cái・Tiêu chuẩn thu nhập・Hồ sơ, Điểm xét duyệt - AIVisa",
      description:
        "Muốn bảo lãnh vợ/chồng, con sang Nhật cần thu nhập bao nhiêu? Cần chuẩn bị giấy tờ gì để chứng minh quan hệ gia đình? Trang này giải thích điều kiện visa phụ thuộc đối với vợ/chồng – con cái, tiêu chuẩn về khả năng chu cấp tài chính, danh sách hồ sơ, điểm xét duyệt, lý do từ chối thường gặp và lưu ý khi gia hạn."
    },

    /* Hoạt động đặc định */
    "visa/da": {
      title:
        "Visa Hoạt động đặc định Nhật Bản｜Loại 28・46・Lao động, Điều kiện, Hồ sơ, Điểm xét duyệt - AIVisa",
      description:
        "Không rõ trường hợp của mình có thuộc diện hoạt động đặc định hay không? Trang này giải thích các loại hoạt động đặc định phổ biến (số 28, số 46, dạng lao động), trường hợp áp dụng, điều kiện xét duyệt, hồ sơ cần chuẩn bị, điểm dễ bị hỏi bổ sung và lý do từ chối thường gặp, giúp bạn đánh giá tuyến này có phù hợp hay không."
    },

    /* Kỹ năng đặc định SSW */
    "visa/ssw": {
      title:
        "Visa Kỹ năng đặc định (SSW) Nhật Bản｜Yêu cầu 14 ngành, Kỳ thi kỹ năng & tiếng Nhật, Các bước nộp đơn - AIVisa",
      description:
        "Thi SSW khó không, gồm những phần nào? Ngành nghề của bạn có thuộc diện SSW không? Trang này trình bày điều kiện SSW loại 1 & 2, danh sách 14 ngành, chuẩn kỳ thi kỹ năng và tiếng Nhật, yêu cầu đối với công ty tiếp nhận, hồ sơ cần thiết, điểm xét duyệt và các bước cụ thể để nộp hồ sơ. Phù hợp với từ khóa “visa kỹ năng đặc định Nhật”, “đi Nhật theo diện SSW”."
    },

    /* Thăm thân */
    "visa/vr": {
      title:
        "Visa Thăm thân Nhật Bản｜Điều kiện mời, Giấy tờ bảo lãnh, Cách viết thư mời & lịch trình, Lý do từ chối - AIVisa",
      description:
        "Thư mời thăm thân Nhật phải viết thế nào? Vì sao visa thăm thân dễ bị từ chối? Trang này giải thích quy trình mời người thân, điều kiện đối với người bảo lãnh, giấy tờ cần thiết, cách viết thư mời và lịch trình, các lý do từ chối thường gặp và hướng chuẩn bị bổ sung để tăng tỉ lệ đậu."
    },

    /* Lưu trú ngắn hạn */
    "visa/temp": {
      title:
        "Visa Lưu trú ngắn hạn Nhật Bản｜Du lịch・Công tác・Thăm thân｜Hồ sơ, Lịch trình, Điểm xét duyệt - AIVisa",
      description:
        "Xin visa du lịch Nhật cần những gì? Lịch trình tham quan nên viết ra sao? Trang này tổng hợp hồ sơ cơ bản cho lưu trú ngắn hạn (du lịch, công tác, thăm thân), cách làm lịch trình chi tiết, yêu cầu về chứng minh tài chính, điểm mà Cục xuất nhập cảnh thường kiểm tra, lý do bị từ chối và ví dụ về yêu cầu bổ sung hồ sơ."
    },

    /* Vợ/chồng của người định cư vĩnh viễn */
    "visa/pr-spouse": {
      title:
        "Visa Vợ/chồng của Người định cư vĩnh viễn Nhật Bản｜Điều kiện, Chứng minh hôn nhân, Hồ sơ, Lý do từ chối - AIVisa",
      description:
        "Làm sao chứng minh hôn nhân thực sự khi xin visa vợ/chồng của người định cư vĩnh viễn? Trang này giải thích điều kiện cơ bản, yêu cầu về thu nhập, bằng chứng sống chung, danh sách hồ sơ, điểm xét duyệt, lý do bị từ chối thường gặp và gợi ý dạng giấy tờ có thể chuẩn bị thêm."
    },

    /* Vợ/chồng người Nhật */
    "visa/jp-spouse": {
      title:
        "Visa Vợ/chồng người Nhật｜Hồ sơ kết hôn, Bằng chứng sống chung, Quy trình nộp đơn, Lý do từ chối - AIVisa",
      description:
        "Xin visa vợ/chồng người Nhật cần những giấy tờ gì? Thủ tục cụ thể diễn ra thế nào? Trang này trình bày hồ sơ liên quan đến đăng ký kết hôn, cách chứng minh sống chung, vai trò của người bảo lãnh, quy trình nộp hồ sơ, điểm xét duyệt, lý do bị từ chối thường gặp và lưu ý khi đổi tư cách lưu trú sau khi kết hôn."
    },

    /* Định cư dài hạn */
    "visa/ltr": {
      title:
        "Visa Định cư dài hạn Nhật Bản (Long-Term Resident)｜Các trường hợp áp dụng, Điều kiện, Hồ sơ, Xét duyệt - AIVisa",
      description:
        "Ly hôn xong có được tiếp tục ở lại Nhật không? Trường hợp nào được xét visa định cư dài hạn? Trang này giải thích những trường hợp đại diện như định cư sau ly hôn, con của người Nhật, tư cách đặc biệt; điều kiện xét duyệt, hồ sơ cần thiết, loại giấy tờ thường bị yêu cầu bổ sung, điểm xét duyệt và lưu ý khi gia hạn."
    },

    /* Kinh doanh – quản lý */
    "visa/bm": {
      title:
        "Visa Kinh doanh – Quản lý Nhật Bản｜Thành lập công ty, Vốn yêu cầu, Văn phòng, Quy trình xin visa - AIVisa",
      description:
        "Muốn mở công ty để xin visa kinh doanh – quản lý ở Nhật cần những điều kiện gì? Cần bao nhiêu vốn, có bắt buộc phải có văn phòng riêng không? Trang này trình bày các bước thành lập công ty, tiêu chuẩn về vốn đầu tư, yêu cầu đối với văn phòng, những điểm Cục xuất nhập cảnh xem xét trong bản kế hoạch kinh doanh, hồ sơ cần nộp, ví dụ về yêu cầu bổ sung và quy trình tổng thể khi xin visa."
    },

    /* Điều dưỡng / chăm sóc */
    "visa/care": {
      title:
        "Visa Điều dưỡng Nhật Bản｜Điều kiện bằng cấp, Kỳ thi kỹ năng, Hồ sơ cần thiết - AIVisa",
      description:
        "Muốn sang Nhật làm điều dưỡng cần bằng cấp gì? Kỳ thi kỹ năng bao gồm những nội dung nào? Trang này giải thích hệ thống chứng chỉ điều dưỡng, tiêu chuẩn kỳ thi kỹ năng, yêu cầu đối với cơ sở tiếp nhận, danh sách hồ sơ, điểm xét duyệt và các bước tổng quát khi nộp hồ sơ."
    },

    /* Lao động kỹ năng (Skilled) */
    "visa/skilled": {
      title:
        "Visa Lao động kỹ năng Nhật Bản｜Ngành nghề áp dụng, Chứng minh tay nghề, Hồ sơ, Đổi công ty - AIVisa",
      description:
        "Nghề của bạn có xin được visa lao động kỹ năng không? Đổi công ty có ảnh hưởng đến visa không? Trang này giải thích danh mục ngành nghề áp dụng, cách chứng minh tay nghề, yêu cầu đối với công ty tiếp nhận, hồ sơ cần chuẩn bị, điểm xét duyệt và các lưu ý khi chuyển việc."
    },

    /* Thực tập sinh kỹ năng / TIT */
    "visa/tit": {
      title:
        "Visa Thực tập sinh kỹ năng Nhật Bản (TIT)｜Điều kiện thực tập sinh 1・2, Doanh nghiệp tiếp nhận, Hồ sơ - AIVisa",
      description:
        "Muốn sang Nhật theo diện thực tập sinh kỹ năng cần chuẩn bị gì? Trang này trình bày điều kiện của thực tập sinh kỹ năng loại 1 & 2, yêu cầu đối với tổ chức giám sát và doanh nghiệp tiếp nhận, danh sách hồ sơ, điểm xét duyệt và ví dụ về yêu cầu bổ sung."
    },

    /* AI Hỏi đáp */
    "ask-ai": {
      title:
        "Tư vấn visa Nhật bằng AI｜Trả lời nhanh, Gợi ý hồ sơ, Giải thích quy định cơ bản - AIVisa",
      description:
        "Không biết nên xin loại visa nào? Không chắc hồ sơ đã đầy đủ chưa? Lo lắng vì từng bị từ chối visa? Trợ lý AI của AIVisa giúp bạn nhanh chóng nắm được điều kiện, các giấy tờ quan trọng, điểm xét duyệt, loại giấy tờ thường bị yêu cầu bổ sung và mô hình lý do bị từ chối của từng loại visa."
    },

    /* Bảng hỏi đánh giá */
    "questionnaire": {
      title:
        "Đánh giá & Gợi ý loại visa Nhật phù hợp｜AI phân tích hồ sơ & đề xuất tuyến visa - AIVisa",
      description:
        "Chỉ cần trả lời một bảng hỏi ngắn, hệ thống AI sẽ phân tích tình hình của bạn và đề xuất những loại visa Nhật phù hợp nhất, đồng thời tạo danh sách hồ sơ cần chuẩn bị, đánh giá sơ bộ điều kiện và những điểm rủi ro cần chú ý khi nộp hồ sơ."
    },

    /* Công cụ tính điểm HSP */
    "tools/hsp-points": {
      title:
        "Công cụ tính điểm HSP Nhật Bản｜Cấu trúc điểm, Hạng mục cộng điểm, Gợi ý tự đánh giá - AIVisa",
      description:
        "Công cụ và phần giải thích chi tiết về hệ thống tính điểm Kỹ năng cao (HSP) của Nhật Bản: cấu trúc điểm, các hạng mục cộng điểm, ví dụ cách tính dựa trên học vấn – kinh nghiệm – thu nhập và gợi ý cách tự ước tính điểm để xem mình có phù hợp tuyến HSP hay không."
    },

    /* Liên hệ */
    "questionnaire/contact": {
      title: "Liên hệ AIVisa｜Tư vấn visa Nhật & Hợp tác kinh doanh - AIVisa",
      description:
        "Nếu bạn cần được tư vấn chi tiết hơn về trường hợp xin visa Nhật của mình hoặc có nhu cầu hợp tác kinh doanh, phát triển hệ thống liên quan đến lĩnh vực du học – việc làm – bất động sản – nhân sự tại Nhật, hãy liên hệ với AIVisa qua trang này."
    },

    /* FAQ */
    "about/faq": {
      title:
        "Câu hỏi thường gặp về visa Nhật Bản (FAQ)｜Thông tin cơ bản, Hồ sơ, Thời gian xét duyệt - AIVisa",
      description:
        "Tổng hợp các câu hỏi thường gặp: phân biệt các loại visa, hồ sơ cơ bản cần chuẩn bị, thời gian xét duyệt thông thường, có thể xin lại sau khi bị từ chối hay không, những lưu ý khi gia hạn… Tất cả được trình bày dạng Hỏi – Đáp để người mới dễ tra cứu."
    },

    /* Chính sách quyền riêng tư */
    "legal/privacy": {
      title:
        "Chính sách quyền riêng tư của AIVisa｜Cách chúng tôi xử lý dữ liệu cá nhân - AIVisa",
      description:
        "Giải thích cách AIVisa thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của người dùng liên quan đến dịch vụ visa Nhật Bản, đồng thời nêu rõ các quyền cơ bản của người dùng đối với thông tin của mình."
    },

    /* Điều khoản sử dụng */
    "legal/terms": {
      title:
        "Điều khoản sử dụng AIVisa｜Quy định khi sử dụng dịch vụ visa Nhật Bản - AIVisa",
      description:
        "Nội dung quy định phạm vi dịch vụ, trách nhiệm và nghĩa vụ của người dùng, các hành vi bị cấm và điều khoản miễn trừ trách nhiệm khi sử dụng nền tảng AIVisa. Vui lòng đọc kỹ trước khi sử dụng dịch vụ."
    }
  }
}
};

export function getSeoMeta(locale: Locale, key?: string): SeoMeta {
  const conf = seoMetaMap[locale] || seoMetaMap.ja;
  if (key && conf.pages[key]) return conf.pages[key];
  return conf.default;
}
