"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  Mic,
  PenLine,
  Trash2,
  ChevronRight,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import FormattedReport from "@/components/FormattedReport";
import {
  getScoreHistory,
  deleteScoreEntry,
  clearScoreHistory,
} from "@/lib/client/scoreHistory";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "writing", label: "Writing" },
  { id: "speaking", label: "Speaking" },
];

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function HistoryPage() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const loadEntries = () => setEntries(getScoreHistory());

  useEffect(() => {
    loadEntries();
  }, []);

  const filtered = entries.filter((entry) =>
    filter === "all" ? true : entry.type === filter
  );

  const selected = filtered.find((e) => e.id === selectedId) ?? null;

  const handleDelete = (id) => {
    deleteScoreEntry(id);
    if (selectedId === id) setSelectedId(null);
    loadEntries();
  };

  const handleClearAll = () => {
    if (!confirm("Delete all score history? This cannot be undone.")) return;
    clearScoreHistory();
    setSelectedId(null);
    loadEntries();
  };

  return (
    <div className="min-h-screen bg-[#101010] text-gray-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Score History</h1>
            <p className="text-sm text-gray-400 mt-1">
              Saved locally in your browser — writing and speaking results.
            </p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 border border-red-500/20 bg-red-500/5 px-3 py-2 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === f.id
                  ? "bg-indigo-600 text-white"
                  : "bg-[#141414] border border-[#222] text-gray-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#222] bg-[#141414] p-12 text-center space-y-4">
            <Award className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-gray-400 text-sm">No scores saved yet.</p>
            <Link
              href="/"
              className="inline-block text-indigo-400 text-sm font-semibold hover:text-indigo-300"
            >
              Start a practice test →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              {filtered.map((entry) => {
                const Icon = entry.type === "writing" ? PenLine : Mic;
                const isSelected = selectedId === entry.id;

                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedId(entry.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "border-indigo-500/50 bg-indigo-500/10"
                        : "border-[#222] bg-[#141414] hover:border-[#333]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg shrink-0 ${
                            entry.type === "writing"
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-violet-500/10 text-violet-400"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">
                            {entry.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {entry.providerName} · {formatDate(entry.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {entry.overallScore && (
                          <span className="bg-indigo-600 text-white text-sm font-extrabold px-2.5 py-1 rounded-lg">
                            {entry.overallScore}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:sticky lg:top-24 h-fit">
              {selected ? (
                <div className="rounded-2xl border border-[#222] bg-[#141414] overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-[#222]">
                    <div>
                      <p className="font-bold text-white text-sm">{selected.label}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(selected.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 max-h-[70vh] overflow-y-auto">
                    <FormattedReport text={selected.report} />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#333] bg-[#141414]/50 p-10 text-center">
                  <p className="text-sm text-gray-500">
                    Select a score to view the full report.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#121212] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#222] bg-[#141414]">
            <p className="font-bold text-white text-sm">{selected.label}</p>
            <button onClick={() => setSelectedId(null)} className="p-2 text-gray-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <FormattedReport text={selected.report} />
          </div>
        </div>
      )}
    </div>
  );
}
