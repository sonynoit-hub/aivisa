import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/locales";


function pickLocaleFromAcceptLanguage(header: string | null): typeof locales[number] | null {
  if (!header) return null;
  // Parse: en-US,en;q=0.9,ja;q=0.8
  const items = header.split(",").map((part) => {
    const [tagRaw, qRaw] = part.trim().split(";q=");
    const tag = tagRaw.toLowerCase();
    const q = qRaw ? parseFloat(qRaw) : 1;
    return { tag, q: isNaN(q) ? 1 : q };
  });
  // Sort by q desc, then order
  items.sort((a, b) => b.q - a.q);
  for (const it of items) {
    const base = it.tag.split("-")[0];
    // Map base tag to supported locales
    for (const sup of locales) {
      if (base === sup) return sup;
      // Special-case Chinese variants
      if (base === "zh" && sup === "zh") return sup;
    }
  }
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // API: 附加基础安全响应头与轻量防护
  if (pathname.startsWith('/api/')) {
    const res = NextResponse.next();
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Cache-Control', 'no-store, max-age=0');
    // 对修改类请求做基本 Content-Type 校验
    const method = req.method.toUpperCase();
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const ct = req.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        return new NextResponse(JSON.stringify({ error: 'Invalid Content-Type' }), { status: 415, headers: { 'Content-Type': 'application/json' } });
      }
    }
    return res;
  }

  const isStatic = pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname === "/favicon.ico" || pathname.endsWith(".svg") || pathname.endsWith(".png") || pathname.endsWith(".jpg") || pathname.endsWith(".jpeg") || pathname.endsWith(".gif") || pathname.endsWith(".webp");
  if (isStatic) return NextResponse.next();

  const seg = pathname.split("/").filter(Boolean)[0];

  const isLocalePrefixed = locales.some(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!isLocalePrefixed) {
    // First-time or non-prefixed: detect preferred locale
    const cookieLocale = req.cookies.get("preferred_locale")?.value;
    const hasCookie = cookieLocale && (locales as readonly string[]).includes(cookieLocale as any);
    const detected = hasCookie
      ? (cookieLocale as typeof locales[number])
      : pickLocaleFromAcceptLanguage(req.headers.get("accept-language")) || defaultLocale;

    const url = req.nextUrl.clone();
    url.pathname = `/${detected}${pathname === "/" ? "" : pathname}`;
    const res = NextResponse.redirect(url);
    res.cookies.set("preferred_locale", detected, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    res.headers.set("Vary", "Accept-Language");
    return res;
  }
  // When visiting a locale-prefixed path, keep cookie in sync
  const res = NextResponse.next();
  const currentLocale = seg;
  if ((locales as readonly string[]).includes(currentLocale as any)) {
    res.cookies.set("preferred_locale", currentLocale!, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  return res;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next|static|images|favicon.ico).*)"]
};
