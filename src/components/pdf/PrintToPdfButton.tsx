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

  const handleClick = async () => {
    if (!targetRef.current || printingRef.current) return;

    // Fire analytics 'pdf' event early with readiness deferral
    try {
      const label = (typeof children === 'string' ? children : (filename ? `PrintPDF:${filename}` : 'PrintPDF')) as string;
      const getSid = () => (window as any).__ANALYTICS_SESSION_ID__ || (window as any).__WEB_SESSION_ID__ || (window as any).__ANALYTICS_IDS__?.sessionId;
  const send = () => logEventReliable("pdf", { path: location.pathname }, { category: "interaction", label: String(label) });
      if (getSid()) send();
      else {
        const onReady = () => send();
        window.addEventListener("analytics:ready", onReady as any, { once: true } as any);
        const poll = setInterval(() => { if (getSid()) { clearInterval(poll); try { window.removeEventListener("analytics:ready", onReady as any); } catch {}; send(); } }, 500);
        setTimeout(() => clearInterval(poll), 15000);
      }
    } catch {}

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
      data-analytics-direct
      data-analytics-name={typeof children === 'string' ? children : (filename ? `PrintPDF:${filename}` : 'PrintPDF')}
      data-hide-print
    >
      {children ?? "PDF"}
    </button>
  );
}

export default PrintToPdfButton;
