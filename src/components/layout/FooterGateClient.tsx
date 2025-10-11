"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./SiteFooter";

export default function FooterGateClient() {
  const pathname = usePathname();
  if (pathname && /\/ask-ai(\/.*)?$/.test(pathname)) return null;
  return <SiteFooter />;
}
