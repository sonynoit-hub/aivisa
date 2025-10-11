"use client";

import React from "react";

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

  const handleClick = async () => {
    if (!targetRef.current || printingRef.current) return;

    printingRef.current = true;
    const root = targetRef.current;

    const prevTitle = document.title;
    const prevAttr = root.getAttribute("data-export-scope");

    try {
      root.setAttribute("data-export-scope", "true");

      if (filename) {
        document.title = filename;
      }

      if (onBeforePrint) await onBeforePrint();

      window.print();
    } finally {
      // Give the browser a tick after print dialog closes to restore
      setTimeout(async () => {
        root.setAttribute("data-export-scope", prevAttr ?? "");
        if (!prevAttr) root.removeAttribute("data-export-scope");

        if (filename) {
          document.title = prevTitle;
        }

        if (onAfterPrint) await onAfterPrint();
        printingRef.current = false;
      }, 0);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      disabled={disabled}
      aria-label="导出为 PDF"
      data-analytics="click"
      data-analytics-name={typeof children === 'string' ? children : (filename ? `PrintPDF:${filename}` : 'PrintPDF')}
      data-hide-print
    >
      {children ?? "PDF"}
    </button>
  );
}

export default PrintToPdfButton;
