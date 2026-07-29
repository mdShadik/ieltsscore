export const AUTH_STORAGE_KEY = "ieltsscore_auth";
export const HISTORY_STORAGE_KEY = "ieltsscore_history";
export const MAX_HISTORY_ENTRIES = 100;

export function extractOverallScore(text) {
  if (!text) return null;
  const match = text.match(/OVERALL BAND SCORE:\s*\*\*?([\d.]+)\*\*?/i);
  return match ? match[1] : null;
}

export function isErrorResult(text) {
  return (
    !text ||
    text.startsWith("Error during evaluation:") ||
    text.startsWith("Error:")
  );
}
