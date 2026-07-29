"use client";

import { Mic } from "lucide-react";

function WaveBars({ active }) {
  const bars = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="flex items-center justify-center gap-1.5 h-16 px-4">
      {bars.map((i) => (
        <div
          key={i}
          className={`w-1.5 md:w-2 rounded-full bg-indigo-400 ${
            active ? "animate-speaking-wave" : "h-2 opacity-40"
          }`}
          style={
            active
              ? {
                  animationDelay: `${i * 0.08}s`,
                  height: `${14 + (i % 3) * 10}px`,
                }
              : { height: "8px" }
          }
        />
      ))}
    </div>
  );
}

export default function VoiceWaveMic({
  isListening,
  transcript,
  interimTranscript,
  onStart,
  onSubmit,
  disabled,
  isProcessing,
  hint = "Tap mic to speak · Tap wave to submit",
}) {
  const displayText = [transcript, interimTranscript].filter(Boolean).join(" ").trim();

  const handleMainAction = () => {
    if (disabled || isProcessing) return;
    if (isListening) {
      onSubmit();
    } else {
      onStart();
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full justify-center">
      {/* Live subtitles */}
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
        ) : isListening ? (
          <p className="text-center text-sm md:text-base text-indigo-400/70 animate-pulse">
            Listening… start speaking
          </p>
        ) : (
          <p className="text-center text-sm text-gray-500">{hint}</p>
        )}
      </div>

      {/* Mic / Wave */}
      <button
        type="button"
        onClick={handleMainAction}
        disabled={disabled || isProcessing}
        aria-label={isListening ? "Tap wave to submit answer" : "Tap to start speaking"}
        className={`relative flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-40 ${
          isListening
            ? "w-full max-w-sm md:max-w-md rounded-3xl bg-indigo-500/10 border-2 border-indigo-500/40 py-3 cursor-pointer"
            : "w-20 h-20 md:w-28 md:h-28 rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 cursor-pointer"
        }`}
      >
        {isListening ? (
          <>
            <WaveBars active />
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

      {!isListening && !disabled && (
        <p className="text-[10px] md:text-xs text-gray-500 mt-3 uppercase tracking-wider font-semibold">
          Tap mic to answer
        </p>
      )}
    </div>
  );
}
