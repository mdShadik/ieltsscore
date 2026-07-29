'use client';

import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

export default function NavigationFooter({ activePart, onSelectPart, onSubmit, isEvaluating }) {
  return (
    <footer className="h-16 bg-[#181818] border-t border-[#2a2a2a] flex items-center justify-between px-4 z-10">
      
      {/* Navigation Arrows */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onSelectPart('part1')}
          disabled={activePart === 'part1'}
          className="p-2 bg-[#242424] hover:bg-[#333] disabled:opacity-40 rounded text-gray-300 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => onSelectPart('part2')}
          disabled={activePart === 'part2'}
          className="p-2 bg-[#242424] hover:bg-[#333] disabled:opacity-40 rounded text-gray-300 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Center Tabs for Part 1 / Part 2 */}
      <div className="flex-1 max-w-2xl mx-6 grid grid-cols-2 gap-2">
        <button
          onClick={() => onSelectPart('part1')}
          className={`py-2 rounded text-sm font-semibold border transition ${
            activePart === 'part1'
              ? 'border-red-800/80 bg-[#251818] text-white shadow-inner'
              : 'border-[#2d2d2d] bg-[#222] text-gray-400 hover:bg-[#282828]'
          }`}
        >
          Part 1
        </button>
        <button
          onClick={() => onSelectPart('part2')}
          className={`py-2 rounded text-sm font-semibold border transition ${
            activePart === 'part2'
              ? 'border-red-800/80 bg-[#251818] text-white shadow-inner'
              : 'border-[#2d2d2d] bg-[#222] text-gray-400 hover:bg-[#282828]'
          }`}
        >
          Part 2
        </button>
      </div>

      {/* Global Submit Trigger */}
      <button
        onClick={onSubmit}
        disabled={isEvaluating}
        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white text-sm font-bold px-5 py-2 rounded flex items-center gap-2 shadow-sm transition"
      >
        <span>Submit</span>
        <Send className="w-4 h-4" />
      </button>

    </footer>
  );
}