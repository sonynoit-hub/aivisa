import { useEffect, useRef } from "react";

export function cacheIds(_: any) {}

// Push a GTM-compatible pageview event on SPA route changes.
export function usePageView(route: string) {
	const didMountRef = useRef(false);
	useEffect(() => {
		if (!didMountRef.current) {
			// Skip initial mount to avoid double-counting with GTM's default All Pages trigger
			didMountRef.current = true;
			return;
		}
		if (typeof window === "undefined") return;
		try {
			(window as any).dataLayer = (window as any).dataLayer || [];
			(window as any).dataLayer.push({ event: "pageview", page: route });
		} catch {}
	}, [route]);
}
