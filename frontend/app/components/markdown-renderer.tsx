import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
    content, 
    className = "" 
}) => {
    return (
        <div className={`max-w-none text-text-muted ${className}`}>
            <ReactMarkdown
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-2xl md:text-3xl font-bold text-text-main mt-6 mb-4 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl md:text-2xl font-bold text-text-main mt-5 mb-3 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg md:text-xl font-semibold text-text-main mt-4 mb-2 leading-tight">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-base md:text-lg font-semibold text-text-main mt-3 mb-2 leading-tight">
                            {children}
                        </h4>
                    ),
                    p: ({ children }) => (
                        <p className="text-text-muted mb-4 leading-relaxed text-sm md:text-base">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 text-text-muted space-y-1 text-sm md:text-base">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 text-text-muted space-y-1 text-sm md:text-base">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="ml-2 md:ml-4 leading-relaxed">
                            {children}
                        </li>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-text-main">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-text-muted">
                            {children}
                        </em>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 italic text-text-muted my-4 bg-muted/30 py-2 pr-4 rounded-r text-sm md:text-base">
                            {children}
                        </blockquote>
                    ),
                    code: ({ children, className: codeClassName }) => {
                        const isInline = !codeClassName;
                        return isInline ? (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-xs md:text-sm font-mono text-primary">
                                {children}
                            </code>
                        ) : (
                            <pre className="bg-muted p-3 md:p-4 rounded-lg overflow-x-auto my-4">
                                <code className={`text-xs md:text-sm font-mono ${codeClassName || ''}`}>
                                    {children}
                                </code>
                            </pre>
                        );
                    },
                    a: ({ children, href }) => (
                        <a 
                            href={href} 
                            className="text-primary hover:text-primary-hover underline transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                    hr: () => (
                        <hr className="my-4 md:my-6 border-border" />
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full border-collapse border border-border text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-muted">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody>
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="border-b border-border">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-3 md:px-4 py-2 text-left text-xs md:text-sm font-semibold text-text-main">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-3 md:px-4 py-2 text-xs md:text-sm text-text-muted">
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
