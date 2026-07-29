'use client';

import { useEffect, useState } from 'react';
import { X, RefreshCw, Award, CheckCircle2 } from 'lucide-react';
import FormattedReport from './FormattedReport';

export default function EvaluationModal({
  isOpen,
  onClose,
  loading,
  result,
  loadingSteps = [
    'Analyzing task response...',
    'Checking coherence & cohesion...',
    'Evaluating lexical resource...',
    'Reviewing grammar & accuracy...',
  ],
}) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!loading) {
      setActiveStep(0);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2200);

    return () => clearInterval(interval);
  }, [loading, loadingSteps]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex h-screen w-screen flex-col overflow-hidden bg-[#121212]">
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#2d2d2d] bg-[#141414]">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Award className="w-6 h-6 text-indigo-400" />
            <span>IELTS Examiner Assessment Report</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#282828] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-[#121212]">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-8 max-w-md mx-auto">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 flex items-center justify-center">
                  <RefreshCw className="w-9 h-9 animate-spin text-indigo-500" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-white">
                  Evaluating Your Performance
                </h3>
                <p className="text-gray-400 text-sm">
                  Scoring against official IELTS band descriptors...
                </p>
              </div>

              <div className="w-full space-y-2.5">
                {loadingSteps.map((step, index) => {
                  const isDone = index < activeStep;
                  const isCurrent = index === activeStep;

                  return (
                    <div
                      key={step}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${
                        isCurrent
                          ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                          : isDone
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400/80'
                            : 'bg-[#161616] border-[#262626] text-gray-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      ) : (
                        <div
                          className={`w-4 h-4 shrink-0 rounded-full border-2 ${
                            isCurrent
                              ? 'border-indigo-400 animate-pulse'
                              : 'border-gray-700'
                          }`}
                        />
                      )}
                      <span className="text-sm font-medium">{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <FormattedReport text={result} />
          )}
        </div>

        <div className="p-4 border-t border-[#2d2d2d] bg-[#141414] flex justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
