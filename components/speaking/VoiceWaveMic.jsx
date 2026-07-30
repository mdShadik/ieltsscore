"use client";

import { Mic, RefreshCw } from "lucide-react";
import VoiceVisualizer from "./VoiceVisualizer";

export default function VoiceWaveMic({
  isListening,
  transcript,
  interimTranscript,
  onStart,
  onSubmit,
  disabled,
  isProcessing,
  isTranscribing,
  isModelLoading,
  modelLoadProgress,
  voiceEngine,
  getVolume,
  hint = "Tap mic to speak · Tap wave to submit",
}) {
  const displayText = [transcript, interimTranscript].filter(Boolean).join(" ").trim();
  const isTransformer = voiceEngine === "transformer";
  const engineLabel = isTransformer ? "Whisper (local)" : "Browser";

  const handleMainAction = () => {
    if (disabled || isProcessing || isTranscribing || isModelLoading) return;
    if (isListening) {
      onSubmit();
    } else {
      onStart();
    }
  };

  const statusMessage = (() => {
    if (isModelLoading) {
      return modelLoadProgress > 0
        ? `Loading Whisper model… ${modelLoadProgress}%`
        : "Loading Whisper model…";
    }
    if (isTranscribing) return "Transcribing with Whisper…";
    if (isListening && isTransformer) return "Recording (noise filter active)…";
    if (isListening) return "Listening… start speaking";
    return hint;
  })();

  return (
    <div className="flex flex-col items-center w-full h-full justify-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isTransformer
              ? "bg-violet-500/15 text-violet-400"
              : "bg-emerald-500/15 text-emerald-400"
          }`}
        >
          {engineLabel}
        </span>
        {isTransformer && (
          <span className="text-[10px] text-gray-600">High-pass noise filter</span>
        )}
      </div>

      <div className="w-full min-h-[80px] md:min-h-[100px] max-h-[160px] md:max-h-[200px] overflow-y-auto px-3 md:px-6 mb-4 md:mb-6 rounded-xl bg-[#0d0d0d]/80 border border-[#2a2a2a] py-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 text-center mb-2">
          Live transcript
        </p>
        {displayText ? (
          <p className="text-center text-base md:text-xl leading-relaxed">
            <span className="text-gray-100">{transcript}</span>
            {interimTranscript && (
              <span className="text-indigo-300"> {interimTranscript}</span>
            )}
          </p>
        ) : isTranscribing || isModelLoading ? (
          <p className="text-center text-sm md:text-base text-violet-400/80 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            {statusMessage}
          </p>
        ) : isListening ? (
          <p className="text-center text-sm md:text-base text-indigo-400/70 animate-pulse">
            {statusMessage}
          </p>
        ) : (
          <p className="text-center text-sm text-gray-500">{statusMessage}</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleMainAction}
        disabled={disabled || isProcessing || isTranscribing || isModelLoading}
        aria-label={isListening ? "Tap wave to submit answer" : "Tap to start speaking"}
        className={`relative flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40 ${
          isListening
            ? "w-full max-w-sm md:max-w-md rounded-3xl bg-indigo-500/10 border-2 border-indigo-500/40 py-3 cursor-pointer"
            : "w-20 h-20 md:w-28 md:h-28 rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 cursor-pointer"
        }`}
      >
        {isTranscribing || isModelLoading ? (
          <RefreshCw className="w-10 h-10 text-indigo-300 animate-spin" />
        ) : isListening ? (
          <>
            <VoiceVisualizer
              active={isListening}
              voiceEngine={voiceEngine}
              displayText={displayText}
              className="mb-2"
              getVolume={getVolume}
            />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-indigo-400 pb-2">
              Tap wave to submit
            </span>
          </>
        ) : (
          <Mic className="w-9 h-9 md:w-12 md:h-12 text-white" />
        )}

        {isListening && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
        )}
      </button>

      {!isListening && !disabled && !isTranscribing && !isModelLoading && (
        <p className="text-[10px] md:text-xs text-gray-500 mt-3 uppercase tracking-wider font-semibold">
          Tap mic to answer
        </p>
      )}
    </div>
  );
}
