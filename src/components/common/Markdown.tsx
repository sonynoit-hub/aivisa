"use client";

import React, {useState} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  children: string;
  className?: string;
};

export default function Markdown({children, className}: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const onCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((v) => (v === key ? null : v)), 1500);
    } catch {}
  };

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          blockquote: ({node: _node, ...props}) => (
            <blockquote className="  bg-slate-100 px-4 py-3 mb-3 rounded-r-md" {...props} />
          ),
          a: ({node: _node, href, children, ...props}) => (
            <a href={href} className="text-blue-600 hover:text-blue-800 underline" {...props}>
              {children}
            </a>
          ),
          h1: ({node: _node, ...props}) => <h1 className="text-xl font-semibold mt-2 mb-3" {...props} />,
          h2: ({node: _node, ...props}) => <h2 className="text-lg font-semibold mt-2 mb-2" {...props} />,
          h3: ({node: _node, ...props}) => <h3 className="text-base font-semibold mt-2 mb-2" {...props} />,
          p: ({node: _node, ...props}) => <p className="leading-7 text-[15px] mb-3" {...props} />,
          ul: ({node: _node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-3" {...props} />,
          ol: ({node: _node, ...props}) => <ol className="list-decimal pl-5 space-y-1 mb-3" {...props} />,
          li: ({node: _node, ...props}) => <li className="leading-7 text-[15px]" {...props} />,
          table: ({node: _node, ...props}) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-slate-200 text-sm" {...props} />
            </div>
          ),
          th: ({node: _node, ...props}) => <th className="bg-slate-50 border-b border-slate-200 px-3 py-2 text-left font-medium" {...props} />,
          td: ({node: _node, ...props}) => <td className="border-b border-slate-200 px-3 py-2 align-top" {...props} />,
          code({inline, className, children, ...props}: { inline?: boolean; className?: string; children?: React.ReactNode }) {
            const text = String(children);
            if (inline) {
              return <code className="rounded bg-slate-100 px-1 py-[1px] text-[13px]" {...props}>{children}</code>;
            }
            const lang = /language-([a-zA-Z0-9_+-]+)/.exec(className || "")?.[1] || "";
            const key = lang + ":" + text.slice(0, 24);
            return (
              <div className="my-3">
                {lang && <div className="px-3 pt-2 text-[12px] uppercase tracking-wide text-slate-500">{lang}</div>}
                <div className="relative">
                  <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3"><code className="font-mono text-[13px] leading-6 whitespace-pre">{text}</code></pre>
                  <button
                    type="button"
                    className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] text-slate-600 hover:text-slate-800 hover:bg-white/80 ring-1 ring-slate-200 bg-white/60 backdrop-blur"
                    onClick={() => onCopy(text, key)}
                    title="复制代码"
                    aria-label="复制代码"
                  >
                    {copied === key ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" className="fill-green-600"><path d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.5-1.5z"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" className="fill-slate-700"><path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                    )}
                    <span>{copied === key ? "已复制" : "复制"}</span>
                  </button>
                </div>
              </div>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
