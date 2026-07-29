import {
  MODEL_PREFERENCES_KEY,
  getDefaultModel,
  isValidModelForProvider,
} from "@/constant/models";

function readPreferences() {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(MODEL_PREFERENCES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writePreferences(prefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MODEL_PREFERENCES_KEY, JSON.stringify(prefs));
}

export function getAllModelPreferences() {
  return readPreferences();
}

export function getModelForProvider(providerId) {
  const prefs = readPreferences();
  const saved = prefs[providerId];

  if (saved && isValidModelForProvider(providerId, saved)) {
    return saved;
  }

  return getDefaultModel(providerId);
}

export function setModelForProvider(providerId, modelId) {
  if (!isValidModelForProvider(providerId, modelId)) {
    throw new Error("Invalid model for this provider.");
  }

  const prefs = readPreferences();
  prefs[providerId] = modelId;
  writePreferences(prefs);

  window.dispatchEvent(
    new CustomEvent("ieltsscore:model-preferences-changed", {
      detail: { providerId, modelId },
    })
  );

  return modelId;
}

export function resetModelForProvider(providerId) {
  const prefs = readPreferences();
  delete prefs[providerId];
  writePreferences(prefs);

  window.dispatchEvent(
    new CustomEvent("ieltsscore:model-preferences-changed", {
      detail: { providerId, modelId: getDefaultModel(providerId) },
    })
  );
}

export function resetAllModelPreferences() {
  writePreferences({});
  window.dispatchEvent(new CustomEvent("ieltsscore:model-preferences-changed"));
}
