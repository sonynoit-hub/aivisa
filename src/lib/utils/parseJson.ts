/**
 * Safe JSON parser with fallback.
 * - Accepts object or string; if already an object, returns it as-is (typed).
 * - Returns fallback when input is empty or parsing fails.
 */
export function parseJson<T>(raw: unknown, fallback: T): T {
  if (raw == null) return fallback;
  if (typeof raw === 'object') return raw as T;
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return fallback;
    try {
      return JSON.parse(s) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}
