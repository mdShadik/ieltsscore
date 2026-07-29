'use client';

import { useState, useEffect } from 'react';
import QuestionPanel from '../../../components/QuestionPanel';
import AnswerPanel from '../../../components/AnswerPanel';
import NavigationFooter from '../../../components/NavigationFooter';
import EvaluationModal from '../../../components/EvaluationModal';

export default function ExamPage() {
  const [puter, setPuter] = useState(null);
  const [activePart, setActivePart] = useState('part1');

  // Exam Data State
  const [questions, setQuestions] = useState({
    part1: {
      type: 'Formal Letter',
      prompt: 'The system used for rubbish/garbage area collection in your local area is not working properly.\n\nThis is causing problems for you and your neighbours.\n\nWrite a letter to the local council. In your letter:\n• Describe how the rubbish collection system is not working properly\n• Explain how this is affecting you and your neighbours\n• Suggest what should be done about the problem'
    },
    part2: {
      type: 'General Essay',
      prompt: 'Some people believe that university education should be available to everyone free of charge. To what extent do you agree or disagree?'
    }
  });

  const [answers, setAnswers] = useState({
    part1: '',
    part2: ''
  });

  // Modal & AI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState('');

  useEffect(() => {
    import('@heyputer/puter.js').then((mod) => setPuter(mod.puter));
  }, []);

  const handleUpdateQuestion = (part, data) => {
    setQuestions((prev) => ({
      ...prev,
      [part]: data
    }));
  };

  const handleAnswerChange = (part, text) => {
    setAnswers((prev) => ({
      ...prev,
      [part]: text
    }));
  };

  const handleSubmitEvaluation = async () => {
    const currentQuestion = questions[activePart];
    const currentAnswer = answers[activePart];

    if (!currentAnswer.trim()) {
      alert(`Please write an answer for ${activePart === 'part1' ? 'Part 1' : 'Part 2'} before submitting.`);
      return;
    }

    setIsModalOpen(true);
    setLoading(true);
    setEvalResult('');

    const systemPrompt = `You are a certified, strict IELTS General Training Writing Examiner.
Evaluate the candidate's writing based strictly on the official IELTS band descriptors:
1. OVERALL BAND SCORE (rounded to nearest 0.5)
2. SUB-SCORES:
   - Task Achievement / Response (0.0-9.0)
   - Coherence & Cohesion (0.0-9.0)
   - Lexical Resource (0.0-9.0)
   - Grammatical Range & Accuracy (0.0-9.0)
3. SPECIFIC IMPROVEMENTS & CORRECTIONS
4. BAND 8.0+ REWRITTEN MODEL ANSWER`;

    const fullPrompt = `${systemPrompt}\n\nEVALUATION TASK: ${activePart === 'part1' ? 'Task 1 Letter' : 'Task 2 Essay'}\nTYPE: ${currentQuestion.type}\nPROMPT:\n${currentQuestion.prompt}\n\nCANDIDATE SUBMISSION:\n${currentAnswer}`;

    try {
      if (!puter) throw new Error("AI engine loading...");
      const res = await puter.ai.chat(fullPrompt, { model: 'gpt-4o' });
      setEvalResult(res.toString());
    } catch (err) {
      setEvalResult(`Error during evaluation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#121212] select-none">
      
      {/* Split Exam Screen Area */}
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

      {/* IELTS Bottom Navigation Footer */}
      <NavigationFooter
        activePart={activePart}
        onSelectPart={setActivePart}
        onSubmit={handleSubmitEvaluation}
        isEvaluating={loading}
      />

      {/* Examiner Report Pop-up */}
      <EvaluationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        loading={loading}
        result={evalResult}
      />

    </div>
  );
}