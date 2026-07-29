'use client';

import ReactMarkdown from 'react-markdown';
import { Award, CheckCircle2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

export default function FormattedReport({ text }) {
  if (!text) return null;

  // Extract Overall Band Score using Regex
  const overallMatch = text.match(/OVERALL BAND SCORE:\s*\*\*?([\d.]+)\*\*?/i);
  const overallScore = overallMatch ? overallMatch[1] : null;

  return (
    <div className="space-y-6 text-gray-200">
      
      {/* 1. Overall Score Hero Header */}
      {overallScore && (
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-indigo-900/40 border border-indigo-500/30 rounded-xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 block mb-0.5">
              Estimated Result
            </span>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-400" /> Overall Band Score
            </h3>
          </div>
          <div className="bg-indigo-600 text-white font-extrabold text-3xl px-5 py-2.5 rounded-xl border border-indigo-400 shadow-md">
            {overallScore}
          </div>
        </div>
      )}

      {/* 2. Structured Markdown Body with Custom Styling */}
      <div className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed">
        <ReactMarkdown
          components={{
            // Heading level 4 (e.g., Criteria headings)
            h4: ({ children }) => (
              <h4 className="text-base font-bold text-indigo-300 border-b border-[#333] pb-2 mt-6 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {children}
              </h4>
            ),
            // Bold text highlighting
            strong: ({ children }) => (
              <strong className="font-semibold text-emerald-400">{children}</strong>
            ),
            // Unordered list styling
            ul: ({ children }) => (
              <ul className="space-y-2 my-2 list-none pl-1">{children}</ul>
            ),
            // List item styling with custom icons
            li: ({ children }) => {
              const childrenText = String(children);
              const isStrength = childrenText.toLowerCase().includes('strength');
              const isWeakness = childrenText.toLowerCase().includes('weakness');

              return (
                <li className="flex items-start gap-2 bg-[#161616] p-2.5 rounded-lg border border-[#262626]">
                  {isStrength ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : isWeakness ? (
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                  )}
                  <span className="text-gray-300">{children}</span>
                </li>
              );
            },
            // Blockquotes for Band 8.0 Model Answers
            blockquote: ({ children }) => (
              <div className="bg-[#181d28] border-l-4 border-indigo-500 p-4 rounded-r-lg my-4 text-gray-200 italic">
                <div className="flex items-center gap-2 font-bold text-indigo-300 not-italic mb-2 text-xs uppercase tracking-wide">
                  <BookOpen className="w-4 h-4" /> Model Answer
                </div>
                {children}
              </div>
            ),
            // Horizontal rule replacement
            hr: () => <hr className="border-[#2d2d2d] my-6" />,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>

    </div>
  );
}