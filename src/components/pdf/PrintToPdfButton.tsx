"use client";

import React from "react";
import { logEventReliable } from "@/lib/analytics/events";

export type PrintToPdfButtonProps = {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
  onBeforePrint?: () => void | Promise<void>;
  onAfterPrint?: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function PrintToPdfButton({
  targetRef,
  filename,
  onBeforePrint,
  onAfterPrint,
  disabled,
  className,
  children,
}: PrintToPdfButtonProps) {
  const printingRef = React.useRef(false);
  const restoredFromBFCacheRef = React.useRef(false);

  // 粗略检测 iOS WebKit（不含 Chrome/Fx iOS 外壳）
  const isIOSWebKit = React.useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    const isIOS = /iP(ad|hone|od)/.test(ua);
    const isWebKit = /WebKit/i.test(ua);
    const isCriOS = /CriOS/.test(ua);
    const isFxiOS = /FxiOS/.test(ua);
    return isIOS && isWebKit && !isCriOS && !isFxiOS;
  }, []);

  // 记录是否从 bfcache 恢复
  React.useEffect(() => {
    const onPageShow = (e: Event) => {
      const ev = e as PageTransitionEvent;
      restoredFromBFCacheRef.current = !!ev.persisted;
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const handleClick = async () => {
    if (!targetRef.current || printingRef.current) return;

    // Fire analytics 'pdf' event early with readiness deferral
    try {
      const label = typeof children === 'string' ? children : (filename ? `PrintPDF:${filename}` : 'PrintPDF');
      const getSid = () => {
        const w = window as unknown as Record<string, unknown>;
        return (w.__ANALYTICS_SESSION_ID__ ?? w.__WEB_SESSION_ID__ ?? (w.__ANALYTICS_IDS__ as Record<string, unknown> | undefined)?.sessionId) as number | string | undefined;
      };
      const send = () => logEventReliable("pdf", { path: location.pathname }, { category: "interaction", label: String(label) });
      if (getSid()) send();
      else {
        const onReady: EventListener = () => send();
        window.addEventListener("analytics:ready", onReady, { once: true });
        const poll = setInterval(() => { if (getSid()) { clearInterval(poll); try { window.removeEventListener("analytics:ready", onReady); } catch {}; send(); } }, 500);
        setTimeout(() => clearInterval(poll), 15000);
      }
    } catch {}

    printingRef.current = true;
    const root = targetRef.current;

    const prevTitle = document.title;
    const prevAttr = root.getAttribute("data-export-scope");

    // 统一的清理逻辑
    const cleanup = async () => {
      try {
        root.setAttribute("data-export-scope", prevAttr ?? "");
        if (!prevAttr) root.removeAttribute("data-export-scope");
      } catch {}
      try {
        if (filename) document.title = prevTitle;
      } catch {}
      try {
        if (onAfterPrint) await onAfterPrint();
      } catch {}
      printingRef.current = false;
    };

    // afterprint 触发判定与超时回退
    let afterPrintFired = false;
    const onAfterPrintEvent = () => {
      afterPrintFired = true;
      // 给浏览器一拍还原 DOM
      setTimeout(() => {
        cleanup();
      }, 0);
      try {
        window.removeEventListener("afterprint", onAfterPrintEvent as any);
      } catch {}
    };
    window.addEventListener("afterprint", onAfterPrintEvent as any, { once: true });

    // 尝试原生打印；在 iOS WebKit 或 bfcache 恢复后，避免等待异步以防丢失用户手势
    const tryNativePrint = () => {
      try {
        root.setAttribute("data-export-scope", "true");
      } catch {}
      try {
        if (filename) document.title = filename;
      } catch {}

      try {
        if (onBeforePrint) {
          if (isIOSWebKit || restoredFromBFCacheRef.current) {
            // 不等待，尽量保持在同一用户手势内
            try { (onBeforePrint() as any); } catch {}
          } else {
            // 其他浏览器可等待以确保展开等状态已渲染
            // 注意：等待可能会丢失极端环境下的手势，但主流桌面浏览器兼容良好
            return (onBeforePrint() as Promise<void>).then(() => {
              window.print();
            });
          }
        }
      } catch {}
      // iOS 或未等待路径：直接触发
      window.print();
      return Promise.resolve();
    };

    const fallbackToExport = async () => {
      try {
        // 若原生打印失败，改用截图导出 PDF
        const { exportElementToPdf } = await import("@/lib/utils/exportPdf");
        // 确保导出前的准备完成
        try { if (onBeforePrint) await onBeforePrint(); } catch {}
        await exportElementToPdf(root, { filename: filename || document.title || "export" });
      } catch (err) {
        console.error("PDF 导出回退失败:", err);
      } finally {
        await cleanup();
        try { window.removeEventListener("afterprint", onAfterPrintEvent as any); } catch {}
      }
    };

    try {
      await tryNativePrint();
    } catch {
      // 直接回退
      await fallbackToExport();
      return;
    }

    // 若一定时间未触发 afterprint，则认为原生打印被阻止或无效（常见于 iOS WebKit/bfcache 恢复），自动回退
    // 但仅在未进入“打印介质”状态时回退，避免与系统打印预览并发导致内容被隐藏
    setTimeout(() => {
      if (afterPrintFired) return;
      const mm = typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('print') : null;
      const inPrintMedia = !!mm && mm.matches;
      const shouldFallback = (isIOSWebKit || restoredFromBFCacheRef.current) && !inPrintMedia;
      if (shouldFallback) {
        fallbackToExport();
      }
    }, 2500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      disabled={disabled}
      aria-label="导出为 PDF"
      data-analytics="click"
      data-analytics-direct
      data-analytics-name={typeof children === 'string' ? children : (filename ? `PrintPDF:${filename}` : 'PrintPDF')}
      data-hide-print
    >
      {children ?? "PDF"}
    </button>
  );
}

export default PrintToPdfButton;
