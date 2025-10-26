'use client';

import { useState } from 'react';

interface CopyableTextProps {
  text: string;
  className?: string;
}

export default function CopyableText({ text, className = '' }: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // 方法1: 尝试使用 Clipboard API (仅在 HTTPS 或 localhost 下工作)
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        } catch (_err) {
          console.log('Clipboard API failed, trying fallback...', _err);
        }
      }
      
      // 方法2: 使用 execCommand (兼容更多移动端浏览器)
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // 确保元素可见但在屏幕外
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      // iOS Safari 需要特殊处理
      if (navigator.userAgent.match(/ipad|iphone/i)) {
        const range = document.createRange();
        range.selectNodeContents(textArea);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        textArea.setSelectionRange(0, 999999);
      }
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          console.error('execCommand copy failed');
        }
      } catch (err) {
        console.error('execCommand error:', err);
      }
      
      document.body.removeChild(textArea);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`group relative inline-flex items-center gap-1.5 ${className}`}
      title="クリックしてコピー"
    >
      <span className="text-sm text-slate-600 font-mono truncate group-hover:text-[#04c4b6] transition-colors">
        {text}
      </span>
      <svg 
        className="w-4 h-4 text-slate-400 group-hover:text-[#04c4b6] transition-colors flex-shrink-0" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        {copied ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        )}
      </svg>
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200 z-10">
          コピーしました！
        </span>
      )}
    </button>
  );
}
