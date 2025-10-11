"use client";

import {NextIntlClientProvider, type AbstractIntlMessages} from "next-intl";
import * as React from "react";

const DEFAULT_LOCALE = "ja";
const DEFAULT_TIME_ZONE = "Asia/Tokyo";

type Props = {
  children: React.ReactNode;
  /** 由上游（layout/server）传入的消息对象 */
  messages: AbstractIntlMessages;
  /** 当前语言，可选；不传则走默认 ja */
  locale?: string;
  /** 可选；不传则走默认 Asia/Tokyo */
  timeZone?: string;
};

/**
 * 全局 i18n Provider（App Router）
 * - 解决 next-intl ENVIRONMENT_FALLBACK：统一设置 timeZone
 * - 提供常用的 date/number 格式
 * - 缺失文案时使用 key 兜底，避免页面崩溃
 */
export default function IntlProvider({
  children,
  messages,
  locale,
  timeZone
}: Props) {
  const effectiveLocale = locale || DEFAULT_LOCALE;
  const effectiveTZ = timeZone || DEFAULT_TIME_ZONE;

  return (
    <NextIntlClientProvider
      locale={effectiveLocale}
      timeZone={effectiveTZ}
      messages={messages}
      formats={{
        dateTime: {
          short: {year: "numeric", month: "2-digit", day: "2-digit"},
          shortWithTime: {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          }
        },
        number: {
          currencyJPY: {style: "currency", currency: "JPY"},
          percent: {style: "percent", maximumFractionDigits: 2}
        }
      }}
      // 开发期看到更清晰的缺键提示（生产环境不噪音）
      onError={(err) => {
        if (process.env.NODE_ENV === "development") {
          // 仅在本地开发打印，避免污染生产日志
          console.warn("[next-intl]", err);
        }
      }}
      // 缺失文案时，用 key 兜底，避免抛错
      getMessageFallback={({key}) => key}
    >
      {children}
    </NextIntlClientProvider>
  );
}
