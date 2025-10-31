import { useEffect, useRef } from "react";

export function cacheIds(_: unknown) {}

// Push a GTM-compatible page_view event on SPA route changes.
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
			const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
			w.dataLayer = w.dataLayer || [];
			w.dataLayer.push({ event: "page_view" });
		} catch {}
	}, [route]);
}
