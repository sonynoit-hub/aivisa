"use client";

import { useState } from "react";
import SafeImage from "@/components/common/SafeImage";
import { useTranslations } from "next-intl";

interface QrCodeModalProps {
  qrUrl: string;
  platformLabel: string;
}

export default function QrCodeModal({ qrUrl, platformLabel }: QrCodeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('common.qr');

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 mt-2 text-xs text-[#04c4b6] hover:text-[#039991] font-semibold transition-colors"
        aria-label={t('open')}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm12-2h4v4h-4V3zm0 6h4v8h-8v-4h4V9zM3 13h8v8H3v-8zm2 2v4h4v-4H5z"/>
        </svg>
        <span>{t('open')}</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors" 
              onClick={() => setIsOpen(false)}
              aria-label={t('close')}
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <h5 className="text-lg font-bold text-slate-900 mb-4">{t('title', { platform: platformLabel })}</h5>
            <div className="flex justify-center mb-4">
              <div className="relative w-64 h-64 rounded-xl border-2 border-slate-200 overflow-hidden">
                <SafeImage src={qrUrl} alt={t('alt')} fill sizes="256px" className="object-contain" />
              </div>
            </div>
            <p className="text-sm text-slate-600 text-center">{t('scanHint')}</p>
          </div>
        </div>
      )}
    </>
  );
}
