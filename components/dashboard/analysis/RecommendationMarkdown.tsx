'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RecommendationMarkdownProps {
  content: string;
}

export function RecommendationMarkdown({ content }: RecommendationMarkdownProps) {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h3 className="text-white text-sm font-bold mt-6 mb-3 pb-2 border-b border-white/[0.06]" style={{ fontFamily: 'var(--font-montserrat)' }}>
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-white text-sm font-semibold mt-4 mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-[#859399] leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-[#859399]/80 italic">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 ml-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 ml-0 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-[#859399]">
              <span className="text-[#1fe19e] mt-1.5 flex-shrink-0">
                <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
                  <circle cx="3" cy="3" r="3" />
                </svg>
              </span>
              <span>{children}</span>
            </li>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-white/[0.05] text-[#00d2ff] text-xs font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="block p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#859399] text-xs font-mono overflow-x-auto">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="pl-4 border-l-2 border-[#a78bfa]/30 text-[#859399] italic">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#00d2ff] hover:underline">
              {children}
            </a>
          ),
          hr: () => (
            <hr className="my-6 border-white/[0.06]" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-white/[0.06]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="text-left py-2 px-3 text-[10px] text-[#859399] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="py-2 px-3 text-white border-b border-white/[0.04]">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
