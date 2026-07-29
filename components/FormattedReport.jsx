'use client';

import ReactMarkdown from 'react-markdown';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  XCircle,
  ArrowRight,
} from 'lucide-react';

export default function FormattedReport({ text }) {
  if (!text) return null;

  const overallMatch = text.match(/OVERALL BAND SCORE:\s*\*\*?([\d.]+)\*\*?/i);
  const overallScore = overallMatch ? overallMatch[1] : null;

  const subScoreMatches = [
    ...text.matchAll(
      /\*\*(Fluency and Coherence|Lexical Resource|Grammatical Range(?: and Accuracy)?|Pronunciation(?: \(transcript-based\))?|Task Achievement|Task Response|Coherence & Cohesion):\s*([\d.]+)\*\*/gi
    ),
  ];

  return (
    <div className="space-y-6 text-gray-200">
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

      {subScoreMatches.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {subScoreMatches.map(([full, label, score]) => (
            <div
              key={full}
              className="bg-[#161616] border border-[#262626] rounded-xl p-3 text-center"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1 leading-tight">
                {label.replace(' (transcript-based)', '')}
              </p>
              <p className="text-2xl font-extrabold text-indigo-400">{score}</p>
            </div>
          ))}
        </div>
      )}

      <div className="prose prose-invert max-w-none space-y-4 text-sm leading-relaxed">
        <ReactMarkdown
          components={{
            h3: ({ children }) => (
              <h3 className="text-lg font-bold text-white mt-2 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-bold text-indigo-300 border-b border-[#333] pb-2 mt-6 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {children}
              </h4>
            ),
            strong: ({ children }) => {
              const label = String(children).toLowerCase();
              if (label === 'error:' || label.startsWith('error'))
                return (
                  <strong className="font-semibold text-red-400">{children}</strong>
                );
              if (label === 'correct:' || label.startsWith('correct'))
                return (
                  <strong className="font-semibold text-emerald-400">{children}</strong>
                );
              if (label === 'reason:' || label.startsWith('reason'))
                return (
                  <strong className="font-semibold text-amber-400">{children}</strong>
                );
              return (
                <strong className="font-semibold text-emerald-400">{children}</strong>
              );
            },
            ul: ({ children }) => (
              <ul className="space-y-2 my-2 list-none pl-1">{children}</ul>
            ),
            li: ({ children }) => {
              const childrenText = String(children);
              const isStrength = childrenText.toLowerCase().includes('strength');
              const isWeakness = childrenText.toLowerCase().includes('weakness');
              const isError = childrenText.toLowerCase().includes('error:');
              const isCorrect = childrenText.toLowerCase().includes('correct:');
              const isReason = childrenText.toLowerCase().includes('reason:');

              let icon = (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
              );
              let borderClass = 'border-[#262626]';

              if (isStrength) {
                icon = (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                );
              } else if (isWeakness) {
                icon = (
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                );
              } else if (isError) {
                icon = <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />;
                borderClass = 'border-red-500/20 bg-red-500/5';
              } else if (isCorrect) {
                icon = (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                );
                borderClass = 'border-emerald-500/20 bg-emerald-500/5';
              } else if (isReason) {
                icon = (
                  <ArrowRight className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                );
                borderClass = 'border-amber-500/20 bg-amber-500/5';
              }

              return (
                <li
                  className={`flex items-start gap-2 bg-[#161616] p-2.5 rounded-lg border ${borderClass}`}
                >
                  {icon}
                  <span className="text-gray-300">{children}</span>
                </li>
              );
            },
            blockquote: ({ children }) => (
              <div className="bg-[#181d28] border-l-4 border-indigo-500 p-4 rounded-r-lg my-4 text-gray-200 italic">
                <div className="flex items-center gap-2 font-bold text-indigo-300 not-italic mb-2 text-xs uppercase tracking-wide">
                  <BookOpen className="w-4 h-4" /> Model Answer
                </div>
                {children}
              </div>
            ),
            hr: () => <hr className="border-[#2d2d2d] my-6" />,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}
