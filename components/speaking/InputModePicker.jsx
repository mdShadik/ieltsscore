"use client";

import { Mic, Keyboard } from "lucide-react";

export default function InputModePicker({ selected, onSelect }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center">
        How will you answer?
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSelect("voice")}
          className={`p-5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
            selected === "voice"
              ? "border-indigo-500 bg-indigo-500/15 ring-2 ring-indigo-500/30"
              : "border-[#222] bg-[#141414] hover:border-[#333]"
          }`}
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 ${
              selected === "voice"
                ? "bg-indigo-600 text-white"
                : "bg-[#222] text-indigo-400"
            }`}
          >
            <Mic className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Speak with Mic</h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Tap the mic, speak your answer, tap the wave to submit. Best for
            mobile.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onSelect("text")}
          className={`p-5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
            selected === "text"
              ? "border-indigo-500 bg-indigo-500/15 ring-2 ring-indigo-500/30"
              : "border-[#222] bg-[#141414] hover:border-[#333]"
          }`}
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 ${
              selected === "text"
                ? "bg-indigo-600 text-white"
                : "bg-[#222] text-indigo-400"
            }`}
          >
            <Keyboard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Type or Dictate</h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Write in the text box. Use the small mic to fill it with speech.
          </p>
        </button>
      </div>
    </div>
  );
}
