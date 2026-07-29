"use client";

import { GraduationCap, LogIn, LogOut, History } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function Header() {
  const { authenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[#222] bg-[#141414] px-6 py-4">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="rounded-lg border border-indigo-500/30 bg-indigo-600/20 p-2 text-indigo-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white">
              IELTS<span className="text-indigo-400">Score</span>
            </span>
            <span className="text-[10px]">
              Powered by <span className="text-indigo-400 italic">Shaanoo</span>
            </span>
          </div>
        </Link>

        {authenticated && (
          <div className="flex items-center gap-2">
            <Link
              href="/history"
              className="flex items-center gap-2 rounded-lg border border-[#333] bg-[#222] px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-[#2e2e2e]"
            >
              <History className="h-4 w-4 text-gray-400" />
              <span className="hidden sm:inline">History</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-[#333] bg-[#222] px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-[#2e2e2e]"
            >
              <LogOut className="h-4 w-4 text-gray-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}

        {!authenticated && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <LogIn className="h-4 w-4" />
            Sign in required
          </div>
        )}
      </nav>
    </header>
  );
}
