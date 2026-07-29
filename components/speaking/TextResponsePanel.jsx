"use client";

import { Mic, MicOff, Send, RefreshCw } from "lucide-react";

export default function TextResponsePanel({
  transcript,
  onTranscriptChange,
  isListening,
  onToggleMic,
  onSubmit,
  isProcessing,
  canSubmit,
  submitLabel = "Submit Answer",
  showSubmit = true,
}) {
  return (
    <div className="rounded-2xl bg-[#141414] border border-[#222] p-4 space-y-3">
      <div className="relative">
        <textarea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          disabled={isProcessing}
          placeholder="Type your answer here..."
          rows={5}
          className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl p-4 pr-12 text-gray-200 text-base focus:outline-none focus:border-indigo-500/60 transition-colors resize-none min-h-[120px]"
        />
        <button
          type="button"
          onClick={onToggleMic}
          disabled={isProcessing}
          aria-label={isListening ? "Stop dictation" : "Dictate with mic"}
          className={`absolute right-3 bottom-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? "bg-red-500/20 text-red-400 animate-pulse"
              : "bg-[#222] text-gray-400 hover:text-indigo-400 hover:bg-[#2a2a2a]"
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>

      {isListening && (
        <p className="text-xs text-indigo-400/80 text-center animate-pulse">
          Listening… speak now
        </p>
      )}

      {showSubmit && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isProcessing || !canSubmit}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Examiner is thinking…
            </>
          ) : (
            <>
              {submitLabel} <Send className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
