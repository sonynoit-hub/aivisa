export function serverAnalyticsDebug(): boolean {
  const flag = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function serverDbg(...args: any[]) {
  if (!serverAnalyticsDebug()) return;
  try {
    // eslint-disable-next-line no-console
    console.log('[analytics:bff]', ...args);
  } catch {}
}
