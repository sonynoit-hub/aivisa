"use client";

import React, { useEffect, useRef, useState } from "react";

export type StripImage = {
  url: string;
  alt?: string;
};

type Props = {
  images: StripImage[];
};

/**
 * AutoScrollImageStrip
 * - 横向滚动图片条，每 3 秒自动滚动到下一张
 * - 无标题，仅展示图片卡片；支持手动滚动
 * - 当用户 hover/touch 时暂停自动滚动，离开后继续
 */
export default function AutoScrollImageStrip({ images }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const timerRef = useRef<number | null>(null);
  const indexRef = useRef(0);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isDocVisible, setIsDocVisible] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = () => setPrefersReduced(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Pause auto-scroll when the gallery is not in viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // 仅当可见比例足够时才算可见，避免边缘触发
        setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.5);
      },
      { root: null, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Track page/tab visibility
  useEffect(() => {
    const onVis = () => setIsDocVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    cardsRef.current = Array.from(
      scroller.querySelectorAll<HTMLElement>("[data-card='1']")
    );

    const start = () => {
      if (prefersReduced || !isVisible || !isDocVisible) return;
      stop();
      timerRef.current = window.setInterval(() => {
        const cards = cardsRef.current;
        if (!scroller || cards.length === 0) return;
        indexRef.current = (indexRef.current + 1) % cards.length;
        const card = cards[indexRef.current];
        // Compute left offset relative to scroller and scroll only the scroller (avoid page jump)
        const cardRect = card.getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        const targetLeft = cardRect.left - scrollerRect.left + scroller.scrollLeft;
        scroller.scrollTo({ left: targetLeft, behavior: "smooth" });
      }, 3000);
    };

    const stop = () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const onMouseEnter = () => stop();
    const onMouseLeave = () => start();
    const onTouchStart = () => stop();
    const onTouchEnd = () => start();

    scroller.addEventListener("mouseenter", onMouseEnter);
    scroller.addEventListener("mouseleave", onMouseLeave);
    scroller.addEventListener("touchstart", onTouchStart, { passive: true });
    scroller.addEventListener("touchend", onTouchEnd);

    // 初始化对齐到开头，避免页面跳动，仅横向滚动容器
    scroller.scrollTo({ left: 0, behavior: "auto" });

    start();

    return () => {
      stop();
      scroller.removeEventListener("mouseenter", onMouseEnter);
      scroller.removeEventListener("mouseleave", onMouseLeave);
      scroller.removeEventListener("touchstart", onTouchStart as any);
      scroller.removeEventListener("touchend", onTouchEnd);
    };
  }, [images, prefersReduced, isVisible, isDocVisible]);

  if (!images?.length) return null;

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={scrollerRef}
        className="overflow-x-auto scrollbar-hide px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8"
        aria-label="office images gallery"
      >
        <div className="flex gap-5 sm:gap-6 md:gap-7">
          {images.map((img, idx) => (
            <article
              key={idx}
              data-card="1"
              className="group relative flex-shrink-0 w-72 sm:w-80 md:w-96 aspect-[4/3]"
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-100 shadow-md hover:shadow-xl transition-all duration-300">
                <img
                  src={img.url}
                  alt={img.alt || `Office photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
      {/* 右侧渐隐滚动提示 */}
      <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-10 sm:w-12 md:w-16 bg-gradient-to-l from-white/90 to-transparent" />
    </div>
  );
}
