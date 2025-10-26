"use client";

import React from "react";
import { logEventReliable } from "@/lib/analytics/events";

export type PdfExportButtonProps = {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
  chunkSelector?: string;
  background?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function PdfExportButton({
  targetRef,
  filename,
  chunkSelector,
  background,
  disabled,
  className,
  children,
}: PdfExportButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    if (!targetRef.current || loading) return;
    // Fire analytics 'pdf' event early with readiness deferral
    try {
      const label = typeof children === 'string' ? children : (filename ? `ExportPDF:${filename}` : 'ExportPDF');
      const getSid = () => {
        const w = window as unknown as Record<string, unknown>;
        return (w.__ANALYTICS_SESSION_ID__ ?? w.__WEB_SESSION_ID__ ?? (w.__ANALYTICS_IDS__ as Record<string, unknown> | undefined)?.sessionId) as number | string | undefined;
      };
      const send = () => logEventReliable("pdf", { path: location.pathname }, { category: "interaction", label: String(label) });
      if (getSid()) send(); else {
        const onReady: EventListener = () => send();
        window.addEventListener("analytics:ready", onReady, { once: true });
        const poll = setInterval(() => { if (getSid()) { clearInterval(poll); try { window.removeEventListener("analytics:ready", onReady); } catch {}; send(); } }, 500);
        setTimeout(() => clearInterval(poll), 15000);
      }
    } catch {}
    setLoading(true);

    try {
      const { exportElementToPdf } = await import("@/lib/utils/exportPdf");
      await exportElementToPdf(targetRef.current, {
        filename: filename || document.title || "export",
        chunkSelector,
        background,
      });
    } catch (err) {
      console.error("PDF 导出失败:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      disabled={disabled || loading}
      aria-label="导出为 PDF（截图方式）"
      data-analytics="click"
      data-analytics-direct
      data-analytics-name={typeof children === 'string' ? children : (filename ? `ExportPDF:${filename}` : 'ExportPDF')}
      data-hide-print
    >
      {children ?? (loading ? "导出中…" : "PDF")}
    </button>
  );
}

export default PdfExportButton;
