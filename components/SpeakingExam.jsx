"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Send,
  Clock,
  MessageSquare,
} from "lucide-react";
import Header from "@/components/Header";
import EvaluationModal from "@/components/EvaluationModal";
import {
  IELTS_SPEAKING_SYSTEM_PROMPT,
  IELTS_EVALUATION_PROMPT,
} from "@/constant/speaking";
import { getProvider } from "@/constant/providers";
import { callAI, usePuterAI } from "@/lib/client/ai";
import { saveScoreEntry } from "@/lib/client/scoreHistory";

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

export default function SpeakingExam({ providerId }) {
  const provider = getProvider(providerId);
  const { puter, loading: puterLoading, error: puterError } = usePuterAI();

  const [testPhase, setTestPhase] = useState("IDLE");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
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

  const recognitionRef = useRef(null);
  const currentAudioRef = useRef(null);
  const handlePart2FinishedRef = useRef(null);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + " ";
          }
          setTranscript(currentTranscript.trim());
        };

        recognition.onerror = (err) => {
          console.error("Speech Recognition Error:", err);
          setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, []);

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

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const startTest = async () => {
    stopAudio();
    setTestPhase("PART1");
    setConversationHistory([]);
    setEvaluationResult("");
    setTranscript("");
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

  const handleNextPart1Turn = async () => {
    if (!transcript.trim()) return;

    const nextPart1AnswerCount = part1AnswerCount + 1;
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: transcript },
    ];
    setConversationHistory(updatedHistory);
    setTranscript("");

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
      const topicCardText =
        aiResponse ||
        "Part 2 Cue Card:\nDescribe a memorable journey you have taken.\n- Where you went\n- Who you went with\n- What you did\n- And explain why it was memorable.";

      setCurrentQuestion(topicCardText);
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: topicCardText },
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

  const handlePart2Finished = useCallback(async () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: transcript || "[Candidate spoke for Part 2]" },
    ];
    setConversationHistory(updatedHistory);
    setTranscript("");

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
  }, [conversationHistory, isListening, requestExaminer, speakText, transcript]);

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

  const handlePart3Turn = async () => {
    if (!transcript.trim()) return;

    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: transcript },
    ];
    setConversationHistory(updatedHistory);
    setTranscript("");

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

  useEffect(() => {
    handlePart2FinishedRef.current = handlePart2Finished;
  }, [handlePart2Finished]);

  useEffect(() => {
    if (testPhase === "PART2_PREP") {
      const timer = setTimeout(() => {
        if (prepTimer > 1) {
          setPrepTimer((time) => time - 1);
        } else {
          setPrepTimer(0);
          setTestPhase("PART2_SPEAK");
          void speakText("Your preparation time is over. Please begin speaking now.");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (testPhase === "PART2_SPEAK") {
      const timer = setTimeout(() => {
        if (speakTimer > 1) {
          setSpeakTimer((time) => time - 1);
        } else {
          setSpeakTimer(0);
          void handlePart2FinishedRef.current?.();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [testPhase, prepTimer, speakTimer, speakText]);

  const phaseIndex = getPhaseIndex(testPhase);
  const isActive = !["IDLE", "EVALUATING", "FINISHED"].includes(testPhase);

  return (
    <div className="min-h-screen bg-[#101010] text-gray-100 flex flex-col font-sans">
      <Header />

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
        {/* Sub-header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              IELTS <span className="text-indigo-400">Speaking</span> Test
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              AI Engine: <span className="text-indigo-400">{provider.name}</span>
              {" · "}Neural Examiner Voice
            </p>
          </div>
          {isActive && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              {isPlayingVoice && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
              {isPlayingVoice ? "Examiner Speaking" : "Live Session"}
            </span>
          )}
        </div>

        {puterError && provider.clientSide && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {puterError}
          </div>
        )}

        {/* Phase progress bar */}
        {isActive && (
          <div className="grid grid-cols-4 gap-2">
            {PHASES.map((phase, index) => {
              const isCurrent = phase.id === testPhase;
              const isPast = phaseIndex > index;

              return (
                <div
                  key={phase.id}
                  className={`rounded-xl border px-3 py-2.5 text-center transition-all ${
                    isCurrent
                      ? "border-indigo-500/50 bg-indigo-500/10"
                      : isPast
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-[#222] bg-[#141414]"
                  }`}
                >
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isCurrent
                        ? "text-indigo-400"
                        : isPast
                          ? "text-emerald-500"
                          : "text-gray-600"
                    }`}
                  >
                    {phase.label}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
                      isCurrent ? "text-white" : isPast ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {phase.sub}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* IDLE */}
        {testPhase === "IDLE" && (
          <div className="p-8 rounded-2xl bg-[#141414] border border-[#222] text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              Full 3-Part Examination
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              IELTS Speaking Mock Test
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto leading-relaxed text-sm">
              Complete a realistic Part 1, Part 2, and Part 3 interview with a
              neural-voice AI examiner. Receive detailed band scores, grammatical
              error analysis, and Band 8.0+ model responses.
            </p>
            <button
              onClick={startTest}
              disabled={provider.clientSide && puterLoading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all"
            >
              {provider.clientSide && puterLoading ? "Loading AI..." : "Start Full Exam"}
            </button>
          </div>
        )}

        {/* ACTIVE EXAM */}
        {isActive && (
          <div className="space-y-4">
            {/* Status bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#141414] rounded-xl border border-[#222]">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                {getPhaseLabel(testPhase)}
              </span>
              {isPlayingVoice && (
                <button
                  onClick={stopAudio}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  Mute Examiner
                </button>
              )}
              {!isPlayingVoice && isProcessing && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Examiner is thinking...
                </span>
              )}
            </div>

            {/* Examiner question */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#222] space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Examiner Says
                </h3>
              </div>
              <p className="text-lg font-medium text-gray-100 whitespace-pre-line leading-relaxed">
                {currentQuestion}
              </p>
            </div>

            {aiError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {aiError}
              </div>
            )}

            {/* Timers */}
            {testPhase === "PART2_PREP" && (
              <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold">Preparation Time</span>
                </div>
                <p className="text-5xl font-black text-amber-400 tabular-nums">
                  {prepTimer}s
                </p>
              </div>
            )}

            {testPhase === "PART2_SPEAK" && (
              <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <Mic className="w-4 h-4" />
                  <span className="text-sm font-semibold">Speaking Time</span>
                </div>
                <p className="text-5xl font-black text-emerald-400 tabular-nums">
                  {speakTimer}s
                </p>
              </div>
            )}

            {/* Candidate response */}
            <div className="p-6 rounded-2xl bg-[#141414] border border-[#222] space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Your Response
                  </h3>
                </div>
                <button
                  onClick={toggleListening}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    isListening
                      ? "bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse"
                      : "bg-[#222] hover:bg-[#2a2a2a] text-gray-200 border border-[#333]"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" /> Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" /> Start Recording
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                disabled={isProcessing}
                placeholder="Speak into your microphone or type your response here..."
                rows={4}
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl p-4 text-gray-200 text-sm focus:outline-none focus:border-indigo-500/60 transition-colors resize-none"
              />

              <div className="flex justify-end">
                {testPhase === "PART1" && (
                  <button
                    onClick={handleNextPart1Turn}
                    disabled={isProcessing || !transcript.trim()}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Thinking...
                      </>
                    ) : (
                      <>
                        Submit Answer <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}

                {testPhase === "PART2_SPEAK" && (
                  <button
                    onClick={handlePart2Finished}
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-all"
                  >
                    Finish Part 2 Early
                  </button>
                )}

                {testPhase === "PART3" && (
                  <button
                    onClick={handlePart3Turn}
                    disabled={isProcessing || !transcript.trim()}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Thinking...
                      </>
                    ) : (
                      <>
                        Submit Answer <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Post-exam: retake button when modal closed */}
        {testPhase === "FINISHED" && !isReportOpen && (
          <div className="p-8 rounded-2xl bg-[#141414] border border-[#222] text-center space-y-4">
            <h3 className="text-xl font-bold text-white">Test Complete</h3>
            <p className="text-gray-400 text-sm">
              Your examiner report is ready. View it or start a new test.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsReportOpen(true)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all"
              >
                View Report
              </button>
              <button
                onClick={startTest}
                className="px-6 py-2.5 bg-[#222] hover:bg-[#2a2a2a] text-gray-200 border border-[#333] rounded-lg text-sm font-bold transition-all"
              >
                Take New Test
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Evaluation modal — same as writing */}
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
