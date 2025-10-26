export function serverAnalyticsDebug(): boolean {
  const flag = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG;
  if (flag === "true") return true;
  if (flag === "false") return false;
  // 默认不打印调试日志，只有显式设置为 true 时才开启
  return false;
}

export function serverDbg(...args: unknown[]) {
  if (!serverAnalyticsDebug()) return;
  try {
    console.log('[analytics:bff]', ...args);
  } catch {}
}
