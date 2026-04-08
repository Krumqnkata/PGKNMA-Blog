import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import hljs from 'highlight.js';
import { useEffect } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onPdfClick?: (url: string) => void;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = "prose prose-lg max-w-none break-words prose-headings:mb-4 prose-headings:mt-6 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:my-4 prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-blockquote:my-4 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:bg-muted prose-pre:my-4 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-img:my-4 prose-img:max-w-full prose-img:rounded-lg prose-table:my-4 prose-th:font-semibold prose-th:border prose-th:px-3 prose-th:py-2 prose-td:border prose-td:px-3 prose-td:py-2 prose-a:text-primary prose-a:underline hover:prose-a:no-underline prose-strong:font-semibold prose-em:italic dark:prose-invert",
  onPdfClick
}) => {
  useEffect(() => {
    // Wait for DOM to update before applying syntax highlighting
    const timer = setTimeout(() => {
      document.querySelectorAll('pre code').forEach((block) => {
        // Only apply highlighting if it hasn't been highlighted yet
        if (!block.classList.contains('hljs')) {
          hljs.highlightElement(block as HTMLElement);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [content]);

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            // Check if this is inline code (no language specified) or a code block
            if (match) {
              // This is a code block - it will be handled by the pre component
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            } else {
              // This is inline code
              return (
                <code className={`${className} bg-muted rounded px-1.5 py-0.5 font-mono text-sm`} {...props}>
                  {children}
                </code>
              );
            }
          },
          pre({ node, className, children, ...props }) {
            return (
              <pre className={`${className} bg-secondary rounded-lg p-4 overflow-x-auto`} {...props}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          h1({ node, children, ...props }) {
            return <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground" {...props}>{children}</h1>;
          },
          h2({ node, children, ...props }) {
            return <h2 className="text-2xl font-bold mt-7 mb-3 text-foreground" {...props}>{children}</h2>;
          },
          h3({ node, children, ...props }) {
            return <h3 className="text-xl font-bold mt-6 mb-2 text-foreground" {...props}>{children}</h3>;
          },
          p({ node, children, ...props }) {
            return <p className="my-4 text-foreground leading-relaxed" {...props}>{children}</p>;
          },
          blockquote({ node, children, ...props }) {
            return <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6" {...props}>{children}</blockquote>;
          },
          ul({ node, children, ...props }) {
            return <ul className="my-4 pl-6 list-disc space-y-2" {...props}>{children}</ul>;
          },
          ol({ node, children, ...props }) {
            return <ol className="my-4 pl-6 list-decimal space-y-2" {...props}>{children}</ol>;
          },
          li({ node, children, ...props }) {
            return <li className="leading-relaxed" {...props}>{children}</li>;
          },
          strong({ node, children, ...props }) {
            return <strong className="font-bold" {...props}>{children}</strong>;
          },
          em({ node, children, ...props }) {
            return <em className="italic" {...props}>{children}</em>;
          },
          table({ node, children, ...props }) {
            return <table className="my-4 border-collapse" {...props}>{children}</table>;
          },
          th({ node, children, ...props }) {
            return <th className="border border-border px-3 py-2 font-semibold bg-muted" {...props}>{children}</th>;
          },
          td({ node, children, ...props }) {
            return <td className="border border-border px-3 py-2" {...props}>{children}</td>;
          },
          a({ node, children, href, ...props }) {
            const isPdf = href?.toLowerCase().endsWith('.pdf');
            if (isPdf && onPdfClick) {
              return (
                <a 
                  className="text-primary hover:underline underline-offset-4 cursor-pointer" 
                  onClick={(e) => {
                    e.preventDefault();
                    onPdfClick(href);
                  }}
                  {...props}
                >
                  {children}
                </a>
              );
            }
            return <a className="text-primary hover:underline underline-offset-4" href={href} {...props}>{children}</a>;
          },
          img({ node, children, ...props }) {
            return <img className="my-4 max-w-full rounded-lg border border-border" {...props} />;
          },
          hr({ node, ...props }) {
            return <hr className="my-8 border-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" {...props} />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;