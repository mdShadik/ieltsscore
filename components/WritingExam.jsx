"use client";

import { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import Header from "@/components/Header";
import QuestionPanel from "@/components/QuestionPanel";
import AnswerPanel from "@/components/AnswerPanel";
import NavigationFooter from "@/components/NavigationFooter";
import EvaluationModal from "@/components/EvaluationModal";
import { BUILD_IELTS_EVALUATION_PROMPT } from "@/constant/ielts";
import { getProvider } from "@/constant/providers";
import { callAI, usePuterAI } from "@/lib/client/ai";

export default function WritingExam({ providerId }) {
  const provider = getProvider(providerId);
  const { puter, loading: puterLoading, error: puterError } = usePuterAI();

  const [activePart, setActivePart] = useState("part1");
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [questions, setQuestions] = useState({
    part1: {
      type: "Formal Letter",
      prompt:
        "The system used for rubbish/garbage area collection in your local area is not working properly.\n\nThis is causing problems for you and your neighbours.\n\nWrite a letter to the local council. In your letter:\n• Describe how the rubbish collection system is not working properly\n• Explain how this is affecting you and your neighbours\n• Suggest what should be done about the problem",
    },
    part2: {
      type: "General Essay",
      prompt:
        "Some people believe that university education should be available to everyone free of charge. To what extent do you agree or disagree?",
    },
  });

  const [answers, setAnswers] = useState({ part1: "", part2: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState("");

  const handleUpdateQuestion = (part, data) => {
    setQuestions((prev) => ({ ...prev, [part]: data }));
  };

  const handleAnswerChange = (part, text) => {
    setAnswers((prev) => ({ ...prev, [part]: text }));
  };

  const handleSubmitEvaluation = async () => {
    const currentQuestion = questions[activePart];
    const currentAnswer = answers[activePart];

    if (!currentAnswer.trim()) {
      alert(
        `Please write an answer for ${activePart === "part1" ? "Part 1" : "Part 2"} before submitting.`
      );
      return;
    }

    if (provider.clientSide && puterLoading) {
      alert("AI engine is still loading. Please wait a moment.");
      return;
    }

    setIsModalOpen(true);
    setLoading(true);
    setEvalResult("");

    const fullPrompt = BUILD_IELTS_EVALUATION_PROMPT({
      taskType:
        activePart === "part1"
          ? `Task 1 (${currentQuestion.type})`
          : `Task 2 (${currentQuestion.type})`,
      promptText: currentQuestion.prompt,
      candidateAnswer: currentAnswer,
    });

    try {
      const result = await callAI({
        provider: providerId,
        puter,
        input: fullPrompt,
      });
      setEvalResult(result);
    } catch (err) {
      setEvalResult(`Error during evaluation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#121212] select-none">
      {!isFocusMode && (
        <>
          <Header />
          <div className="px-4 pt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsFocusMode(true)}
              className="flex items-center gap-2 rounded-md border border-[#333] bg-[#1a1a1a] px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-[#252525] hover:text-white"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Focus Mode
            </button>
            <span className="text-xs text-gray-500">
              AI Engine: <span className="text-indigo-400">{provider.name}</span>
            </span>
          </div>
        </>
      )}

      {isFocusMode && (
        <button
          type="button"
          onClick={() => setIsFocusMode(false)}
          className="absolute left-4 top-4 z-50 flex items-center gap-2 rounded-md border border-[#333] bg-[#1a1a1a] px-3 py-2 text-xs font-semibold text-gray-300 shadow-lg transition hover:bg-[#252525] hover:text-white"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          Exit Focus Mode
        </button>
      )}

      {puterError && provider.clientSide && (
        <div className="mx-4 mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {puterError}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <QuestionPanel
          activePart={activePart}
          questionData={questions[activePart]}
          onUpdateQuestion={handleUpdateQuestion}
        />
        <AnswerPanel
          activePart={activePart}
          answer={answers[activePart]}
          onAnswerChange={handleAnswerChange}
        />
      </div>

      <NavigationFooter
        activePart={activePart}
        onSelectPart={setActivePart}
        onSubmit={handleSubmitEvaluation}
        isEvaluating={loading}
      />

      <EvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        loading={loading}
        result={evalResult}
      />
    </div>
  );
}
