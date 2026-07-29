'use client';

import { X, RefreshCw, Award } from 'lucide-react';
import FormattedReport from './FormattedReport';

export default function EvaluationModal({ isOpen, onClose, loading, result }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#121212]">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-gray-400 text-sm font-medium">
                Evaluating against official IELTS descriptors...
              </p>
            </div>
          ) : (
            <FormattedReport text={result} />
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2d2d2d] bg-[#141414] flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
}