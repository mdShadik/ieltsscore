'use client';

import { useState } from 'react';
import { Settings, Check } from 'lucide-react';

export default function QuestionPanel({ activePart, questionData, onUpdateQuestion }) {
  const [isEditing, setIsEditing] = useState(!questionData.prompt);
  const [tempType, setTempType] = useState(questionData.type);
  const [tempPrompt, setTempPrompt] = useState(questionData.prompt);

  const isPart1 = activePart === 'part1';
  const defaultInstructions = isPart1
    ? "You should spend about 20 minutes on this task. Write at least 150 words."
    : "You should spend about 40 minutes on this task. Write at least 250 words.";

  const handleApply = (e) => {
    e.preventDefault();
    onUpdateQuestion(activePart, { type: tempType, prompt: tempPrompt });
    setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] text-gray-200 p-6 border-r border-[#2d2d2d] overflow-y-auto">
      
      {/* Top Banner Bar */}
      <div className="border-b border-[#333] pb-4 mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white">
            {isPart1 ? 'Part 1' : 'Part 2'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{defaultInstructions}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition"
          title="Configure Question"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Setup Form View */}
      {isEditing ? (
        <form onSubmit={handleApply} className="space-y-4 bg-[#222] p-4 rounded-lg border border-[#333]">
          <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">
            Configure {isPart1 ? 'Part 1' : 'Part 2'} Task
          </h3>

          {isPart1 && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Letter Type</label>
              <select
                value={tempType}
                onChange={(e) => setTempType(e.target.value)}
                className="w-full bg-[#161616] border border-[#333] rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Formal Letter">Formal Letter</option>
                <option value="Semi-Formal Letter">Semi-Formal Letter</option>
                <option value="Informal Letter">Informal Letter</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Question / Prompt Text</label>
            <textarea
              rows={6}
              value={tempPrompt}
              onChange={(e) => setTempPrompt(e.target.value)}
              placeholder="Paste your IELTS prompt here..."
              className="w-full bg-[#161616] border border-[#333] rounded p-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded text-sm transition flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Apply Prompt
          </button>
        </form>
      ) : (
        /* Real Exam Display Mode */
        <div className="space-y-4 leading-relaxed font-sans text-[#d4d4d4] text-base whitespace-pre-wrap">
          {questionData.type && (
            <span className="inline-block bg-[#262626] border border-[#3a3a3a] text-xs font-semibold px-2.5 py-1 rounded text-gray-300">
              {questionData.type}
            </span>
          )}
          <div className="pt-2">{questionData.prompt || "No question configured yet. Click the gear icon to set one up."}</div>
        </div>
      )}
    </div>
  );
}