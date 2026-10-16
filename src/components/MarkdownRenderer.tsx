import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none text-slate-100 leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-slate-700/80 bg-slate-900/60 shadow-sm">
              <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-800/90 text-xs font-semibold uppercase tracking-wider text-slate-200">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-800/70 bg-slate-900/40">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-slate-800/40">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold text-slate-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-slate-300 align-top">
              {children}
            </td>
          ),
          h1: ({ children }) => (
            <h1 className="text-xl font-bold tracking-tight text-white mt-5 mb-2 pb-1 border-b border-slate-800">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold tracking-tight text-white mt-4 mb-2 pb-1 border-b border-slate-800/60">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-cyan-300 mt-3 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-2 text-slate-200 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-2.5 list-disc space-y-1.5 pl-5 text-slate-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 list-decimal space-y-1.5 pl-5 text-slate-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed marker:text-cyan-400">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-cyan-500/80 bg-cyan-950/20 py-2 px-4 rounded-r-lg text-slate-300 italic">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && typeof children === 'string' && !children.includes('\n');
            if (isInline) {
              return (
                <code
                  className="rounded bg-slate-800/90 px-1.5 py-0.5 text-xs font-mono font-medium text-cyan-300 border border-slate-700/60"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{String(children).replace(/\n$/, '')}</CodeBlock>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface CodeBlockProps {
  className?: string;
  children: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ className, children }) => {
  const [copied, setCopied] = useState(false);
  const language = className ? className.replace(/language-/, '') : 'code';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-1.5 text-xs text-slate-400">
        <span className="font-mono uppercase tracking-wider font-semibold text-slate-300">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-0.5 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed text-slate-200">
        <code>{children}</code>
      </pre>
    </div>
  );
};
