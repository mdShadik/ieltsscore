'use client';

import { Image as ImageIcon } from 'lucide-react';

export default function AnswerPanel({ activePart, answer, onAnswerChange }) {
  const isPart1 = activePart === 'part1';
  const labelText = isPart1 ? 'Part 1 Answer' : 'Part 2 Answer';
  const placeholderText = isPart1 ? 'Enter your part 1 answer...' : 'Enter your part 2 answer...';

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="h-full flex flex-col bg-[#121212] p-6 relative">
      
      {/* Container simulating official test interface input */}
      <div className="flex-1 flex flex-col border border-[#333] rounded-md relative bg-[#181818]">
        
        {/* Field Title Badge */}
        <div className="absolute -top-3 left-4 bg-[#181818] px-2 text-xs font-semibold text-gray-400 border border-[#333] rounded">
          {labelText}
        </div>

        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(activePart, e.target.value)}
          placeholder={placeholderText}
          className="w-full h-full bg-transparent p-4 pt-5 text-gray-100 focus:outline-none font-sans text-base leading-relaxed resize-none"
        />

        {/* OCR / Image-to-Text Button */}
        <div className="absolute bottom-3 right-3">
          <button
            type="button"
            className="flex items-center gap-1.5 bg-[#252525] hover:bg-[#303030] text-gray-300 border border-[#444] text-xs px-2.5 py-1.5 rounded transition"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Image to Text
          </button>
        </div>
      </div>

      {/* Word Count Bar */}
      <div className="mt-2 text-xs text-gray-400 italic">
        Word Count: <span className="font-semibold text-gray-200">{wordCount}</span>
      </div>

    </div>
  );
}