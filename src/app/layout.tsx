import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { defaultLocale } from "@/i18n/locales";
import HtmlLangSync from "@/components/layout/HtmlLangSync";

export const metadata = {
  title: "aivisa",
  description: "A multilingual visa information platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
  <html lang={defaultLocale} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <HtmlLangSync />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        {/* Footer is rendered within locale layout to ensure next-intl context */}
      </body>
    </html>
  );
}
