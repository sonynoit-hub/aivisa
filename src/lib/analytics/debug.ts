export function isAnalyticsDebug() {
  // 默认不打印，只有显式设置 NEXT_PUBLIC_ANALYTICS_DEBUG=true 时才开启
  const flag = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return false;
}

export function dbg(...args: unknown[]) {
  if (!isAnalyticsDebug()) return;
  try {
    console.log(...["[analytics]", ...args]);
  } catch {}
}

export function newRequestId(): string {
  try {
    const val = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
    return String(val);
  } catch {
    return Math.random().toString(36).slice(2);
  }
}
