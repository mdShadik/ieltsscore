'use client';

import { GraduationCap, LogIn } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#222] bg-[#141414] px-6 py-4">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-600/20 p-2 text-indigo-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">
            IELTS<span className="text-indigo-400">Score</span>.ai
          </span>
        </div>

        <button
          onClick={() => alert('Login feature is static for now.')}
          className="flex items-center gap-2 rounded-lg border border-[#333] bg-[#222] px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-[#2e2e2e]"
        >
          <LogIn className="h-4 w-4 text-gray-400" />
          <span>Login / Sign Up</span>
        </button>
      </nav>
    </header>
  );
}
