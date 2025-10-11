export function isAnalyticsDebug() {
  // default: true in development, false in production unless explicitly enabled
  const flag = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function dbg(...args: any[]) {
  if (!isAnalyticsDebug()) return;
  try {
    // eslint-disable-next-line no-console
    console.log(...["[analytics]", ...args]);
  } catch {}
}

export function newRequestId(): string {
  try {
    return (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) as string;
  } catch {
    return Math.random().toString(36).slice(2);
  }
}
