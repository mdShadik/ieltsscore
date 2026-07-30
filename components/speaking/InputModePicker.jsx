"use client";

import { Mic, Keyboard, Globe, Cpu } from "lucide-react";

export default function InputModePicker({
  selected,
  voiceEngine,
  onSelect,
  onVoiceEngineSelect,
}) {
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

      {selected === "voice" && (
        <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center">
            Speech recognition engine
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onVoiceEngineSelect("browser")}
              className={`p-4 rounded-xl border text-left transition-all active:scale-[0.98] ${
                voiceEngine === "browser"
                  ? "border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                  : "border-[#222] bg-[#141414] hover:border-[#333]"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    voiceEngine === "browser"
                      ? "bg-emerald-600 text-white"
                      : "bg-[#222] text-emerald-400"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">Browser</h4>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Built-in Web Speech API with live captions. Fast, no download.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onVoiceEngineSelect("transformer")}
              className={`p-4 rounded-xl border text-left transition-all active:scale-[0.98] ${
                voiceEngine === "transformer"
                  ? "border-violet-500/60 bg-violet-500/10 ring-1 ring-violet-500/30"
                  : "border-[#222] bg-[#141414] hover:border-[#333]"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    voiceEngine === "transformer"
                      ? "bg-violet-600 text-white"
                      : "bg-[#222] text-violet-400"
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">Transformer.js</h4>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Whisper-base runs locally with a noise filter. Better accents &
                background noise handling — free, private.
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
