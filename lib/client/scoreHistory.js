import {
  HISTORY_STORAGE_KEY,
  MAX_HISTORY_ENTRIES,
  extractOverallScore,
  isErrorResult,
} from "@/lib/scoreUtils";

function readHistory() {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(entries) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
}

export function getScoreHistory() {
  return readHistory().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function saveScoreEntry(entry) {
  if (isErrorResult(entry.report)) return null;

  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    overallScore: extractOverallScore(entry.report),
    ...entry,
  };

  const history = readHistory();
  history.unshift(record);
  writeHistory(history.slice(0, MAX_HISTORY_ENTRIES));

  return record;
}

export function deleteScoreEntry(id) {
  const history = readHistory().filter((entry) => entry.id !== id);
  writeHistory(history);
  return history;
}

export function clearScoreHistory() {
  writeHistory([]);
}

export function getScoreEntry(id) {
  return readHistory().find((entry) => entry.id === id) ?? null;
}
