import type {ReactNode} from "react";
import IntlProvider from "@/i18n/NextIntlProvider"; // ✅ 用默认导入（不是解构）
import {locales, defaultLocale, type Locale} from "@/i18n/locales";
import {loadMessages} from "@/i18n/request";
import ChatDockClient from "@/features/ask-ai/components/ChatDockClient";
import FooterGateClient from "@/components/layout/FooterGateClient";
import AnalyticsBootstrapClient from "@/components/analytics/AnalyticsBootstrapClient";
import RouteTrackerClient from "@/components/analytics/RouteTrackerClient";
import ClickTrackerClient from "@/components/analytics/ClickTrackerClient";

// 可提到 config 里统一管理
const DEFAULT_TIME_ZONE = "Asia/Tokyo";

// 避免预渲染阶段因 useSearchParams 等导致的 CSR bailout 报错
export const dynamic = 'force-dynamic'

type ParamsLike =
  | Record<string, string>
  | PromiseLike<Record<string, string>>
  | undefined;

type Props = { params: ParamsLike; children: ReactNode };

export default async function LocaleLayout({children, params}: Props) {
  // 解析动态路由里的 locale
  const resolvedParams = (await Promise.resolve(params)) as
    | Record<string, string>
    | undefined;

  const candidate = resolvedParams?.locale as string | undefined;
  const locale: Locale =
    candidate && (locales as readonly string[]).includes(candidate)
      ? (candidate as Locale)
      : defaultLocale;

  // 按 locale 动态加载消息（合并多 domains）
  const messages = await loadMessages(locale);

  // ⚠️ 嵌套 layout 不要渲染 <html>/<body>，这里仅提供上下文
  return (
    <IntlProvider
      messages={messages}
      locale={locale}
      timeZone={DEFAULT_TIME_ZONE} // ✅ 显式传入，避免 ENVIRONMENT_FALLBACK
    >
      {children}
  <AnalyticsBootstrapClient />
  <RouteTrackerClient />
  <ClickTrackerClient />
      <ChatDockClient />
      {/* 确保 Footer 处于 next-intl Provider 下 */}
      <FooterGateClient />
    </IntlProvider>
  );
}

// 让 Next 预生成所有本地化路径
export function generateStaticParams() {
  return locales.map((l) => ({locale: l}));
}
