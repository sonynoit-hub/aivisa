"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { usePageView } from "./usePageView";

export default function RouteTrackerClient() {
  const pathname = usePathname() || "/";
  const sp = useSearchParams();
  const route = useMemo(() => {
    const qs = sp?.toString();
    return qs && qs.length > 0 ? `${pathname}?${qs}` : pathname;
  }, [pathname, sp]);
  usePageView(route);
  // 可在此加入自定义逻辑（例如曝光等）
  return null;
}
