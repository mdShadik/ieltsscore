"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { ArrowRight, PenLine, Mic } from "lucide-react";
import { AI_PROVIDERS } from "@/constant/providers";

export default function LandingPage() {
  const aiProviders = Object.values(AI_PROVIDERS);

  return (
    <div className="w-full min-h-screen bg-[#101010] text-gray-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-16 space-y-16">
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            Official IELTS Assessment Criteria
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Score Your IELTS Before Exam Day
          </h1>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed">
            Practice in an authentic Computer-Delivered IELTS environment.
            Choose an AI engine below for writing scoring or a full speaking
            mock test with band analysis and model responses.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
            Choose AI Provider
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiProviders.map((provider) => {
              const IconComponent = provider.icon;

              return (
                <div
                  key={provider.id}
                  className={`p-6 rounded-2xl border transition-all h-full flex flex-col justify-between ${provider.color}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          provider.active
                            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                            : "bg-gray-800/50 border-gray-700 text-gray-500"
                        }`}
                      >
                        {provider.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                      {provider.description}
                    </p>
                  </div>

                  {provider.active ? (
                    <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-white/5">
                      <Link
                        href={`/writing/${provider.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                      >
                        <PenLine className="w-4 h-4" />
                        Writing
                        <ArrowRight className="w-4 h-4 ml-auto sm:ml-0" />
                      </Link>
                      <Link
                        href={`/speaking/${provider.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                      >
                        <Mic className="w-4 h-4" />
                        Speaking
                        <ArrowRight className="w-4 h-4 ml-auto sm:ml-0" />
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-bold pt-4 border-t border-white/5">
                      <span className="text-gray-500 text-xs">
                        Currently Unavailable
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#222]">
          <div className="bg-[#141414] border border-[#222] p-5 rounded-xl space-y-2">
            <PenLine className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-white text-sm">Writing Scoring</h4>
            <p className="text-xs text-gray-400">
              Task 1 letters and Task 2 essays scored across all four official
              IELTS writing criteria with Band 8.0 rewrites.
            </p>
          </div>

          <div className="bg-[#141414] border border-[#222] p-5 rounded-xl space-y-2">
            <Mic className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-white text-sm">Full Speaking Mock</h4>
            <p className="text-xs text-gray-400">
              Complete 3-part interview with neural voice examiner, live speech
              recognition, and detailed band scoring.
            </p>
          </div>

          <div className="bg-[#141414] border border-[#222] p-5 rounded-xl space-y-2">
            <ArrowRight className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-white text-sm">Multiple AI Engines</h4>
            <p className="text-xs text-gray-400">
              Gemini, OpenRouter, Hugging Face, Cloudflare Workers AI, Groq, or
              free Puter AI — pick the engine that fits your setup.
            </p>
          </div>
        </div>
      </main>

      <footer className="flex flex-col gap-2 border-t border-[#222] bg-[#141414] py-6 text-center text-xs text-gray-500 mt-auto">
        <span className="flex flex-col gap-0">
          <span className="text-lg font-extrabold tracking-tight text-white">
            IELTS<span className="text-indigo-400">Score</span>
          </span>
          <span className="text-[10px]">
            Powered by <span className="text-indigo-400 italic">Shaanoo</span>
          </span>
        </span>
        <span>
          IELTS Writing & Speaking Evaluator &bull; Multi-AI Provider Support
        </span>
      </footer>
    </div>
  );
}
