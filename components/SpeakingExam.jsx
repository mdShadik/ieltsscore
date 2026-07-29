"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, RefreshCw, Clock } from "lucide-react";
import Header from "@/components/Header";
import EvaluationModal from "@/components/EvaluationModal";
import InputModePicker from "@/components/speaking/InputModePicker";
import TextResponsePanel from "@/components/speaking/TextResponsePanel";
import VoiceWaveMic from "@/components/speaking/VoiceWaveMic";
import {
  IELTS_SPEAKING_SYSTEM_PROMPT,
  IELTS_EVALUATION_PROMPT,
} from "@/constant/speaking";
import { getProvider } from "@/constant/providers";
import { getModelLabel } from "@/constant/models";
import { callAI, usePuterAI } from "@/lib/client/ai";
import { saveScoreEntry } from "@/lib/client/scoreHistory";
import { getModelForProvider } from "@/lib/client/modelPreferences";

const SPEAKING_LOADING_STEPS = [
  "Analyzing fluency & coherence...",
  "Evaluating lexical resource...",
  "Checking grammatical range & accuracy...",
  "Assessing pronunciation patterns...",
  "Compiling detailed error corrections...",
];

const PHASES = [
  { id: "PART1", label: "Part 1", sub: "Introduction" },
  { id: "PART2_PREP", label: "Part 2", sub: "Preparation" },
  { id: "PART2_SPEAK", label: "Part 2", sub: "Long Turn" },
  { id: "PART3", label: "Part 3", sub: "Discussion" },
];

function getPhaseIndex(phase) {
  if (phase === "IDLE" || phase === "EVALUATING" || phase === "FINISHED") return -1;
  return PHASES.findIndex((p) => p.id === phase);
}

function getPhaseLabel(phase) {
  const match = PHASES.find((p) => p.id === phase);
  return match ? `${match.label}: ${match.sub}` : phase.replace("_", " ");
}

function needsResponseInput(phase) {
  return phase === "PART1" || phase === "PART2_SPEAK" || phase === "PART3";
}

export default function SpeakingExam({ providerId }) {
  const provider = getProvider(providerId);
  const { puter, loading: puterLoading, error: puterError } = usePuterAI();

  const [inputMode, setInputMode] = useState(null);
  const [testPhase, setTestPhase] = useState("IDLE");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [part1AnswerCount, setPart1AnswerCount] = useState(0);
  const [part3AnswerCount, setPart3AnswerCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiError, setAiError] = useState("");
  const [prepTimer, setPrepTimer] = useState(60);
  const [speakTimer, setSpeakTimer] = useState(120);
  const [evaluationResult, setEvaluationResult] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeModel, setActiveModel] = useState(() => getModelForProvider(providerId));

  const recognitionRef = useRef(null);
  const currentAudioRef = useRef(null);
  const handlePart2FinishedRef = useRef(null);
  const wantsListeningRef = useRef(false);
  const transcriptRef = useRef("");
  const interimRef = useRef("");

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    interimRef.current = interimTranscript;
  }, [interimTranscript]);

  useEffect(() => {
    const syncModel = () => setActiveModel(getModelForProvider(providerId));
    syncModel();
    window.addEventListener("ieltsscore:model-preferences-changed", syncModel);
    return () =>
      window.removeEventListener("ieltsscore:model-preferences-changed", syncModel);
  }, [providerId]);

  const getAnswer = useCallback(
    () => `${transcriptRef.current} ${interimRef.current}`.trim(),
    []
  );

  const speakText = useCallback(async (text) => {
    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      setIsPlayingVoice(true);

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("TTS generation failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setIsPlayingVoice(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => setIsPlayingVoice(false);

      await audio.play();
    } catch (err) {
      console.error("Audio playback error:", err);
      setIsPlayingVoice(false);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      setIsPlayingVoice(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    wantsListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* already stopped */
      }
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          setTranscript((prev) => (prev ? `${prev} ${text}` : text).trim());
        } else {
          interim += text;
        }
      }

      setInterimTranscript(interim.trim());
    };

    recognition.onerror = (err) => {
      console.error("Speech Recognition Error:", err);
      if (err.error === "not-allowed") {
        wantsListeningRef.current = false;
        setIsListening(false);
        setAiError("Microphone permission denied. Allow mic access and try again.");
      } else if (err.error !== "aborted" && err.error !== "no-speech") {
        wantsListeningRef.current = false;
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (wantsListeningRef.current) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      wantsListeningRef.current = false;
      recognition.stop();
    };
  }, []);

  const startListening = useCallback(
    (clearFirst = true) => {
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported. Please use Chrome, Edge, or Safari.");
        return;
      }
      if (isPlayingVoice || isProcessing) return;

      if (clearFirst) {
        setTranscript("");
        setInterimTranscript("");
        transcriptRef.current = "";
        interimRef.current = "";
      }

      wantsListeningRef.current = true;

      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        try {
          recognitionRef.current.stop();
        } catch {
          /* noop */
        }
        setTimeout(() => {
          if (!wantsListeningRef.current) return;
          try {
            recognitionRef.current?.start();
            setIsListening(true);
          } catch {
            wantsListeningRef.current = false;
            setIsListening(false);
          }
        }, 250);
      }
    },
    [isPlayingVoice, isProcessing]
  );

  const toggleTextModeMic = () => {
    if (isListening) stopListening();
    else startListening(false);
  };

  const requestExaminer = useCallback(
    async (prompt) => {
      if (provider.clientSide && puterLoading) {
        setAiError("The AI examiner is still loading. Please wait a moment.");
        return null;
      }

      setIsProcessing(true);
      setAiError("");

      try {
        return await callAI({ provider: providerId, puter, input: prompt });
      } catch (error) {
        console.error("AI Error:", error);
        setAiError(
          error.message || "The AI examiner could not respond. Please try again."
        );
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [provider.clientSide, providerId, puter, puterLoading]
  );

  const startTest = async () => {
    if (!inputMode) return;

    stopAudio();
    stopListening();
    setTestPhase("PART1");
    setConversationHistory([]);
    setEvaluationResult("");
    setTranscript("");
    setInterimTranscript("");
    setPart1AnswerCount(0);
    setPart3AnswerCount(0);
    setPrepTimer(60);
    setSpeakTimer(120);
    setAiError("");
    setIsReportOpen(false);
    setIsEvaluating(false);

    const initialQuestion =
      "Good day! Welcome to the IELTS Speaking Test. My name is Ava. Can you please tell me your full name and where you are from?";

    setCurrentQuestion(initialQuestion);
    setConversationHistory([{ role: "assistant", content: initialQuestion }]);
    await speakText(initialQuestion);
  };

  const resetToIdle = () => {
    stopAudio();
    stopListening();
    setTestPhase("IDLE");
    setInputMode(null);
  };

  const handleNextPart1Turn = async (answerOverride) => {
    stopListening();
    const answer = answerOverride ?? getAnswer();
    if (!answer) return;

    const nextPart1AnswerCount = part1AnswerCount + 1;
    const updatedHistory = [...conversationHistory, { role: "user", content: answer }];
    setConversationHistory(updatedHistory);
    setTranscript("");
    setInterimTranscript("");
    transcriptRef.current = "";
    interimRef.current = "";

    const prompt = [
      { role: "system", content: IELTS_SPEAKING_SYSTEM_PROMPT },
      ...updatedHistory,
      {
        role: "user",
        content:
          nextPart1AnswerCount >= 7
            ? "Part 1 is complete. Give a smooth transition into Part 2 and output a Topic Cue Card with preparation instructions."
            : "Continue Part 1 by asking one new, natural follow-up question. Do not move to Part 2 yet.",
      },
    ];

    const aiResponse = await requestExaminer(prompt);
    if (!aiResponse) return;

    setPart1AnswerCount(nextPart1AnswerCount);

    if (
      aiResponse.includes("Part 2") ||
      aiResponse.includes("Cue Card") ||
      nextPart1AnswerCount >= 7
    ) {
      setCurrentQuestion(aiResponse);
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: aiResponse },
      ]);
      setPrepTimer(60);
      setSpeakTimer(120);
      setTestPhase("PART2_PREP");
      await speakText(
        "We will now move to Part 2. Here is your cue card. You have 1 minute to prepare."
      );
    } else {
      setCurrentQuestion(aiResponse);
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: aiResponse },
      ]);
      await speakText(aiResponse);
    }
  };

  const handlePart2Finished = useCallback(
    async (answerOverride) => {
      stopListening();
      const answer = answerOverride ?? (getAnswer() || "[Candidate spoke for Part 2]");

      const updatedHistory = [...conversationHistory, { role: "user", content: answer }];
      setConversationHistory(updatedHistory);
      setTranscript("");
      setInterimTranscript("");
      transcriptRef.current = "";
      interimRef.current = "";

      const transitionPrompt = [
        { role: "system", content: IELTS_SPEAKING_SYSTEM_PROMPT },
        ...updatedHistory,
        {
          role: "user",
          content:
            "Thank you. Now let's move on to Part 3 with two abstract, analytical discussion questions related to the topic.",
        },
      ];

      const aiResponse = await requestExaminer(transitionPrompt);
      if (!aiResponse) return;

      setTestPhase("PART3");
      setPart3AnswerCount(0);
      setCurrentQuestion(aiResponse);
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: aiResponse },
      ]);
      await speakText(aiResponse);
    },
    [conversationHistory, getAnswer, requestExaminer, speakText, stopListening]
  );

  const generateFinalEvaluation = async (finalHistory) => {
    setTestPhase("EVALUATING");
    setIsReportOpen(true);
    setIsEvaluating(true);
    setEvaluationResult("");

    await speakText(
      "That concludes your IELTS Speaking test. Generating your detailed examiner evaluation now."
    );

    const formattedTranscript = finalHistory
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const evalPrompt = [
      { role: "system", content: IELTS_EVALUATION_PROMPT },
      {
        role: "user",
        content: `Evaluate this complete IELTS Speaking test transcript and provide scores and feedback:\n\n${formattedTranscript}`,
      },
    ];

    const evalResult = await requestExaminer(evalPrompt);
    if (!evalResult) {
      setTestPhase("PART3");
      setIsReportOpen(false);
      setIsEvaluating(false);
      return;
    }

    setEvaluationResult(evalResult);
    setIsEvaluating(false);
    setTestPhase("FINISHED");

    saveScoreEntry({
      type: "speaking",
      provider: providerId,
      providerName: provider.name,
      label: "Speaking Mock Test",
      report: evalResult,
    });
  };

  const handlePart3Turn = async (answerOverride) => {
    stopListening();
    const answer = answerOverride ?? getAnswer();
    if (!answer) return;

    const updatedHistory = [...conversationHistory, { role: "user", content: answer }];
    setConversationHistory(updatedHistory);
    setTranscript("");
    setInterimTranscript("");
    transcriptRef.current = "";
    interimRef.current = "";

    const nextPart3AnswerCount = part3AnswerCount + 1;
    setPart3AnswerCount(nextPart3AnswerCount);

    if (nextPart3AnswerCount >= 3) {
      generateFinalEvaluation(updatedHistory);
    } else {
      const prompt = [
        { role: "system", content: IELTS_SPEAKING_SYSTEM_PROMPT },
        ...updatedHistory,
        { role: "user", content: "Ask a follow-up question for Part 3." },
      ];
      const aiResponse = await requestExaminer(prompt);
      if (!aiResponse) return;
      setCurrentQuestion(aiResponse);
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: aiResponse },
      ]);
      await speakText(aiResponse);
    }
  };

  const handleVoiceSubmit = () => {
    const answer = getAnswer();
    if (testPhase === "PART1") handleNextPart1Turn(answer);
    else if (testPhase === "PART2_SPEAK") handlePart2Finished(answer);
    else if (testPhase === "PART3") handlePart3Turn(answer);
  };

  useEffect(() => {
    handlePart2FinishedRef.current = handlePart2Finished;
  }, [handlePart2Finished]);

  useEffect(() => {
    if (testPhase === "PART2_PREP") {
      const timer = setTimeout(() => {
        if (prepTimer > 1) setPrepTimer((time) => time - 1);
        else {
          setPrepTimer(0);
          setTestPhase("PART2_SPEAK");
          void speakText("Your preparation time is over. Please begin speaking now.");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (testPhase === "PART2_SPEAK") {
      const timer = setTimeout(() => {
        if (speakTimer > 1) setSpeakTimer((time) => time - 1);
        else {
          setSpeakTimer(0);
          void handlePart2FinishedRef.current?.();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [testPhase, prepTimer, speakTimer, speakText]);

  const phaseIndex = getPhaseIndex(testPhase);
  const isActive = !["IDLE", "EVALUATING", "FINISHED"].includes(testPhase);
  const inputDisabled = isPlayingVoice || isProcessing;
  const showResponseUI = isActive && needsResponseInput(testPhase);

  return (
    <div className="min-h-dvh bg-[#101010] text-gray-100 flex flex-col font-sans w-full">
      {/* Full header on tablet/desktop */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Compact header on mobile */}
      <header className="md:hidden sticky top-0 z-40 border-b border-[#222] bg-[#141414]/95 backdrop-blur px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto">
          <span className="text-xs font-bold text-indigo-400 shrink-0">
            IELTS Speaking
          </span>
          <div className="text-center min-w-0 flex-1">
            {isActive && (
              <p className="text-[10px] text-gray-500 truncate">
                {getPhaseLabel(testPhase)} · {inputMode === "voice" ? "Mic" : "Text"}
              </p>
            )}
          </div>
          {isPlayingVoice ? (
            <button onClick={stopAudio} className="shrink-0 p-2 text-gray-400" aria-label="Mute">
              <VolumeX className="w-4 h-4" />
            </button>
          ) : isProcessing ? (
            <RefreshCw className="w-4 h-4 text-gray-500 animate-spin shrink-0" />
          ) : (
            <div className="w-8 shrink-0" />
          )}
        </div>
        {isActive && (
          <div className="flex gap-1 mt-2 max-w-4xl mx-auto">
            {PHASES.map((phase, index) => (
              <div
                key={phase.id}
                className={`flex-1 h-1 rounded-full ${
                  phase.id === testPhase
                    ? "bg-indigo-500"
                    : phaseIndex > index
                      ? "bg-emerald-500/60"
                      : "bg-[#333]"
                }`}
              />
            ))}
          </div>
        )}
      </header>

      <div className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-8 flex flex-col min-h-0">
        {/* Desktop sub-header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">
              IELTS <span className="text-indigo-400">Speaking</span> Test
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {provider.name} · {getModelLabel(providerId, activeModel)}
              {inputMode && ` · ${inputMode === "voice" ? "Mic mode" : "Text mode"}`}
            </p>
          </div>
          {isActive && (
            <div className="flex items-center gap-3">
              {isPlayingVoice && (
                <button
                  onClick={stopAudio}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
                >
                  <VolumeX className="w-3.5 h-3.5" /> Mute examiner
                </button>
              )}
              {isProcessing && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Thinking…
                </span>
              )}
            </div>
          )}
        </div>

        {/* Desktop phase bar */}
        {isActive && (
          <div className="hidden md:grid grid-cols-4 gap-2 mb-6">
            {PHASES.map((phase, index) => (
              <div
                key={phase.id}
                className={`rounded-xl border px-3 py-2.5 text-center ${
                  phase.id === testPhase
                    ? "border-indigo-500/50 bg-indigo-500/10"
                    : phaseIndex > index
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-[#222] bg-[#141414]"
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    phase.id === testPhase
                      ? "text-indigo-400"
                      : phaseIndex > index
                        ? "text-emerald-500"
                        : "text-gray-600"
                  }`}
                >
                  {phase.label}
                </p>
                <p className="text-xs mt-0.5 text-gray-400">{phase.sub}</p>
              </div>
            ))}
          </div>
        )}

        {puterError && provider.clientSide && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {puterError}
          </div>
        )}

        <main className="flex-1 flex flex-col min-h-0">
          {testPhase === "IDLE" && (
            <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full space-y-6 py-4 md:py-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                  Speaking Mock Test
                </h2>
                <p className="text-sm md:text-base text-gray-400 leading-relaxed">
                  Full 3-part IELTS interview with neural voice examiner.
                </p>
              </div>
              <InputModePicker selected={inputMode} onSelect={setInputMode} />
              <button
                onClick={startTest}
                disabled={!inputMode || (provider.clientSide && puterLoading)}
                className="w-full py-4 md:py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-2xl text-base transition-all"
              >
                {provider.clientSide && puterLoading ? "Loading AI…" : "Start Exam"}
              </button>
            </div>
          )}

          {isActive && (
            <div
              className={`flex-1 flex flex-col min-h-0 gap-4 ${
                showResponseUI ? "md:grid md:grid-cols-2 md:gap-6 md:items-stretch" : ""
              }`}
            >
              {/* Examiner panel */}
              <div className="flex flex-col min-h-0 md:min-h-[420px] gap-3">
                <div className="flex-1 min-h-[180px] md:min-h-0 overflow-y-auto rounded-2xl bg-[#141414] border border-[#222] p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Examiner Says
                    </span>
                    {isPlayingVoice && (
                      <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Speaking
                      </span>
                    )}
                  </div>
                  <p className="text-base md:text-lg leading-relaxed text-gray-100 whitespace-pre-line">
                    {currentQuestion}
                  </p>
                </div>

                {aiError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {aiError}
                  </div>
                )}

                {testPhase === "PART2_PREP" && (
                  <div className="shrink-0 py-6 md:py-8 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center">
                    <div className="flex items-center justify-center gap-2 text-amber-400 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-semibold">Preparation Time</span>
                    </div>
                    <p className="text-5xl md:text-6xl font-black text-amber-400 tabular-nums">
                      {prepTimer}s
                    </p>
                  </div>
                )}

                {testPhase === "PART2_SPEAK" && (
                  <div className="shrink-0 flex items-center justify-between px-2 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-sm font-semibold text-emerald-400">
                      Speaking time remaining
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-emerald-400 tabular-nums">
                      {speakTimer}s
                    </span>
                  </div>
                )}
              </div>

              {/* Response panel */}
              {showResponseUI && inputMode === "text" && (
                <div className="shrink-0 md:shrink md:flex md:flex-col md:justify-end pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <TextResponsePanel
                    transcript={
                      isListening && interimTranscript
                        ? `${transcript}${transcript ? " " : ""}${interimTranscript}`
                        : transcript
                    }
                    onTranscriptChange={(val) => {
                      if (isListening) stopListening();
                      setTranscript(val);
                      setInterimTranscript("");
                      transcriptRef.current = val;
                      interimRef.current = "";
                    }}
                    isListening={isListening}
                    onToggleMic={toggleTextModeMic}
                    onSubmit={() => {
                      if (testPhase === "PART2_SPEAK") handlePart2Finished();
                      else if (testPhase === "PART1") handleNextPart1Turn();
                      else handlePart3Turn();
                    }}
                    isProcessing={isProcessing}
                    canSubmit={Boolean(getAnswer())}
                    submitLabel={
                      testPhase === "PART2_SPEAK" ? "Finish Part 2" : "Submit Answer"
                    }
                  />
                </div>
              )}

              {showResponseUI && inputMode === "voice" && (
                <div className="shrink-0 md:shrink md:flex md:flex-col md:justify-center rounded-2xl bg-[#141414] border border-[#222] p-4 md:p-8 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <VoiceWaveMic
                    isListening={isListening}
                    transcript={transcript}
                    interimTranscript={interimTranscript}
                    onStart={() => startListening(true)}
                    onSubmit={handleVoiceSubmit}
                    disabled={inputDisabled}
                    isProcessing={isProcessing}
                    hint={
                      testPhase === "PART2_SPEAK"
                        ? "Tap mic to speak · Tap wave when done"
                        : "Tap mic to answer · Tap wave to submit"
                    }
                  />
                </div>
              )}
            </div>
          )}

          {testPhase === "FINISHED" && !isReportOpen && (
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full space-y-4 py-8 text-center">
              <h3 className="text-xl md:text-2xl font-bold text-white">Test Complete</h3>
              <p className="text-sm text-gray-400">Your examiner report is ready.</p>
              <button
                onClick={() => setIsReportOpen(true)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
              >
                View Report
              </button>
              <button
                onClick={startTest}
                className="w-full py-3.5 bg-[#222] border border-[#333] text-gray-200 rounded-xl font-bold"
              >
                Retake Test
              </button>
              <button
                onClick={resetToIdle}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                Change input method
              </button>
            </div>
          )}
        </main>
      </div>

      <EvaluationModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        loading={isEvaluating}
        result={evaluationResult}
        loadingSteps={SPEAKING_LOADING_STEPS}
      />
    </div>
  );
}
