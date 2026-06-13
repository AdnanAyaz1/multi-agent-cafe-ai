'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { RecommendationMarkdownProps } from '@/types/dashboard';

export function RecommendationMarkdown({ content }: RecommendationMarkdownProps) {
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h3 className="text-white text-sm font-bold mt-6 mb-3 pb-2 border-b border-zinc-800">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-white text-sm font-semibold mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-zinc-400 leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-zinc-500 italic">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 ml-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 ml-0 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 text-zinc-400">
              <span className="text-green-500 mt-1.5 flex-shrink-0">
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
                <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-[#e89070] text-xs font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="block p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono overflow-x-auto">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="pl-4 border-l-2 border-zinc-700 text-zinc-400 italic">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#e07850] hover:underline">
              {children}
            </a>
          ),
          hr: () => (
            <hr className="my-6 border-zinc-800" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-zinc-800">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="text-left py-2 px-3 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-mono">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="py-2 px-3 text-white border-b border-zinc-800">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
