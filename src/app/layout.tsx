import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { defaultLocale } from "@/i18n/locales";
import HtmlLangSync from "@/components/layout/HtmlLangSync";
import Script from "next/script";
import RouteTrackerClient from "@/components/analytics/RouteTrackerClient";

export const metadata = {
  title: "aivisa",
  description: "A multilingual visa information platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-PQ5W93R5";
  return (
  <html lang={defaultLocale} suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-base" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* SPA route change -> pageview (GTM dataLayer) */}
        <RouteTrackerClient />
        <HtmlLangSync />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        {/* Footer is rendered within locale layout to ensure next-intl context */}
      </body>
    </html>
  );
}
