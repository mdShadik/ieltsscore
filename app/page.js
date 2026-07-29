'use client';

import { useState, useEffect } from 'react';
import { Award, CheckCircle2, AlertTriangle, BookOpen, Sparkles, RefreshCw } from 'lucide-react';

export default function Home() {
  const [puter, setPuter] = useState(null);
  const [taskType, setTaskType] = useState('Task 1 (Letter)');
  const [prompt, setPrompt] = useState('');
  const [submission, setSubmission] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  // Dynamically load Puter.js in browser context
  useEffect(() => {
    import('@heyputer/puter.js').then((module) => {
      setPuter(module.puter);
    });
  }, []);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!submission.trim()) return;

    setLoading(true);
    setResult('');

    const systemPrompt = `You are a strict, certified IELTS General Training Writing Examiner.
Evaluate the user's text based strictly on the official IELTS assessment criteria:

1. **OVERALL BAND SCORE**: Calculated as the average of the 4 sub-scores, rounded to the nearest half-band (e.g. 6.5, 7.0).
2. **CRITERIA SUB-SCORES & BREAKDOWN**:
   - Task Achievement / Response (0.0 - 9.0)
   - Coherence & Cohesion (0.0 - 9.0)
   - Lexical Resource (0.0 - 9.0)
   - Grammatical Range & Accuracy (0.0 - 9.0)
3. **SPECIFIC CORRECTIONS**: List specific sentences with grammar/vocab errors and provide corrected Band 8.0+ versions.
4. **BAND 8.0+ REWRITE**: A full polished rewrite keeping the original meaning intact.`;

    const fullPrompt = `${systemPrompt}\n\nTask Details:\nTask Type: ${taskType}\nPrompt Question: ${prompt || 'N/A'}\n\nUser Submission:\n${submission}`;

    try {
      if (!puter) throw new Error("Puter SDK loading...");
      
      // Request evaluation using Puter.js
      const response = await puter.ai.chat(fullPrompt, { model: 'gpt-4o' });
      setResult(response.toString());
    } catch (err) {
      setResult(`Evaluation failed: ${err.message || 'Error communicating with AI service.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" /> Powered by Puter.js AI
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            IELTS General Writing Evaluator
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            Instant band scores and actionable feedback strictly aligned with official IELTS General Training criteria.
          </p>
        </header>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Form Input Section */}
          <section className="md:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <form onSubmit={handleEvaluate} className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Writing Task Category
                </label>
                <select 
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Task 1 (Letter - Formal)">Task 1 (Formal Letter)</option>
                  <option value="Task 1 (Letter - Semi-Formal)">Task 1 (Semi-Formal Letter)</option>
                  <option value="Task 1 (Letter - Informal)">Task 1 (Informal Letter)</option>
                  <option value="Task 2 (Essay)">Task 2 (General Essay)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  IELTS Question / Prompt
                </label>
                <textarea
                  rows={5}
                  placeholder="e.g. Write a letter to your local council complaining about traffic noise..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-semibold text-slate-700">
                    Your Response
                  </label>
                  <span className="text-xs text-slate-400">
                    {submission.trim() ? submission.trim().split(/\s+/).length : 0} words
                  </span>
                </div>
                <textarea
                  rows={10}
                  required
                  placeholder="Paste or write your answer here..."
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !submission.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Writing...
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" /> Calculate Band Score
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Results Output Section */}
          <section className="md:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-3 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Evaluation Report
            </h2>

            <div className="flex-1 overflow-y-auto max-h-[550px] pr-2">
              {loading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                  <p className="text-sm">Analyzing task achievement, grammar, and vocabulary...</p>
                </div>
              )}

              {!loading && !result && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-slate-200 mb-2" />
                  <p className="text-sm">Fill in your writing task and submit to receive a detailed examiner report.</p>
                </div>
              )}

              {!loading && result && (
                <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                  {result}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}