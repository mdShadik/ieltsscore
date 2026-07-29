'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Sparkles, 
  Bot, 
  Cpu, 
  Zap, 
  CheckCircle, 
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const aiProviders = [
    {
      id: 'puter',
      name: 'Puter AI',
      description: 'Keyless & Serverless evaluation powered by Puter.js (GPT-4o routing).',
      active: true,
      href: '/writing/puter',
      tag: 'Active & Free',
      icon: Cpu,
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400 hover:border-emerald-500',
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Evaluate essays using Google’s high-speed Gemini model.',
      active: false,
      href: '#',
      tag: 'Coming Soon',
      icon: Sparkles,
      color: 'border-gray-800 bg-[#161616] text-gray-500 hover:border-gray-700',
    },
    {
      id: 'chatgpt',
      name: 'OpenAI ChatGPT',
      description: 'Direct API integration with OpenAI GPT-4o models.',
      active: false,
      href: '#',
      tag: 'Coming Soon',
      icon: Bot,
      color: 'border-gray-800 bg-[#161616] text-gray-500 hover:border-gray-700',
    },
    {
      id: 'claude',
      name: 'Anthropic Claude AI',
      description: 'Detailed writing feedback using Claude 3.5 Sonnet.',
      active: false,
      href: '#',
      tag: 'Coming Soon',
      icon: Zap,
      color: 'border-gray-800 bg-[#161616] text-gray-500 hover:border-gray-700',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#101010] text-gray-100 flex flex-col font-sans">
      
      <Header />

      {/* Hero & Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 md:py-16 space-y-16">
        
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Official IELTS Assessment Criteria
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Score Your IELTS Writing Before Exam Day
          </h1>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed">
            Practice in an authentic Computer-Delivered IELTS environment. Select an AI engine below to get detailed band scores, sub-criterion analysis, and Band 8.0+ model rewrites.
          </p>
        </div>

        {/* AI Provider Selector Cards */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
            Choose AI Provider
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiProviders.map((provider) => {
              const IconComponent = provider.icon;

              const CardContent = (
                <div className={`p-6 rounded-2xl border transition-all h-full flex flex-col justify-between ${provider.color}`}>
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        provider.active 
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                          : 'bg-gray-800/50 border-gray-700 text-gray-500'
                      }`}>
                        {provider.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{provider.name}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                      {provider.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold pt-4 border-t border-white/5">
                    {provider.active ? (
                      <>
                        <span>Start Practice Test</span>
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </>
                    ) : (
                      <span className="text-gray-500 text-xs">Currently Unavailable</span>
                    )}
                  </div>
                </div>
              );

              return provider.active ? (
                <Link key={provider.id} href={provider.href} className="block">
                  {CardContent}
                </Link>
              ) : (
                <div key={provider.id} className="cursor-not-allowed opacity-75">
                  {CardContent}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#222]">
          <div className="bg-[#141414] border border-[#222] p-5 rounded-xl space-y-2">
            <CheckCircle className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-white text-sm">Strict IELTS Descriptors</h4>
            <p className="text-xs text-gray-400">Scored across Task Achievement, Coherence, Lexical Resource, and Grammar.</p>
          </div>

          <div className="bg-[#141414] border border-[#222] p-5 rounded-xl space-y-2">
            <CheckCircle className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-white text-sm">Real Test Interface</h4>
            <p className="text-xs text-gray-400">Dark-mode split screen matching the official computer-delivered test environment.</p>
          </div>

          <div className="bg-[#141414] border border-[#222] p-5 rounded-xl space-y-2">
            <CheckCircle className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-white text-sm">Instant Band 8.0 Rewrites</h4>
            <p className="text-xs text-gray-400">Compare your essay directly against examiner-level rewritten responses.</p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#222] bg-[#141414] py-6 text-center text-xs text-gray-500 mt-auto">
        IELTS General Training Writing Evaluator &bull; Powered by Puter.js
      </footer>

    </div>
  );
}
