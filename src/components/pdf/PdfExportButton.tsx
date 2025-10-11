"use client";

import React from "react";

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
      data-analytics-name={typeof children === 'string' ? children : (filename ? `ExportPDF:${filename}` : 'ExportPDF')}
      data-hide-print
    >
      {children ?? (loading ? "导出中…" : "PDF")}
    </button>
  );
}

export default PdfExportButton;
