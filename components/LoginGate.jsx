"use client";

import { useState } from "react";
import { GraduationCap, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function LoginGate({ children }) {
  const { authenticated, ready, login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#101010] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authenticated) return children;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(password);
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101010] text-gray-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-600/20 p-3 text-indigo-400">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-white">
            IELTS<span className="text-indigo-400">Score</span>
          </h1>
          <p className="text-sm text-gray-400">
            Enter the app password to access writing and speaking practice.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#222] bg-[#141414] p-6 space-y-4"
        >
          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Password
            </span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter app password"
                autoFocus
                className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500/60"
              />
            </div>
          </label>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
