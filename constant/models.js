export const MODEL_PREFERENCES_KEY = "ieltsscore_model_preferences";

export const PROVIDER_MODELS = {
  puter: {
    default: "gemini-3.6-flash",
    models: [
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", free: true },
      { id: "gpt-4o-mini", label: "GPT-4o Mini", free: true },
      { id: "gpt-4o", label: "GPT-4o", free: true },
      { id: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet", free: true },
    ],
  },
  gemini: {
    default: "gemini-3.6-flash",
    models: [
      { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite", free: true },
    ],
  },
  openrouter: {
    default: "meta-llama/llama-3.3-70b-instruct:free",
    models: [
      {
        id: "meta-llama/llama-3.3-70b-instruct:free",
        label: "Llama 3.3 70B",
        free: true,
      },
      {
        id: "google/gemma-2-9b-it:free",
        label: "Gemma 2 9B",
        free: true,
      },
      {
        id: "qwen/qwen-2.5-7b-instruct:free",
        label: "Qwen 2.5 7B",
        free: true,
      },
      {
        id: "microsoft/phi-3-mini-128k-instruct:free",
        label: "Phi-3 Mini",
        free: true,
      },
      {
        id: "meta-llama/llama-3.2-3b-instruct:free",
        label: "Llama 3.2 3B",
        free: true,
      },
    ],
  },
  huggingface: {
    default: "Qwen/Qwen2.5-7B-Instruct",
    models: [
      { id: "Qwen/Qwen2.5-7B-Instruct", label: "Qwen 2.5 7B", free: true },
      {
        id: "meta-llama/Meta-Llama-3.1-8B-Instruct",
        label: "Llama 3.1 8B",
        free: true,
      },
      {
        id: "microsoft/Phi-3-mini-4k-instruct",
        label: "Phi-3 Mini 4K",
        free: true,
      },
      {
        id: "HuggingFaceH4/zephyr-7b-beta",
        label: "Zephyr 7B",
        free: true,
      },
    ],
  },
  cloudflare: {
    default: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    models: [
      {
        id: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        label: "Llama 3.3 70B",
        free: true,
      },
      {
        id: "@cf/meta/llama-3.1-8b-instruct",
        label: "Llama 3.1 8B",
        free: true,
      },
      {
        id: "@cf/mistral/mistral-7b-instruct-v0.1",
        label: "Mistral 7B",
        free: true,
      },
      {
        id: "@cf/google/gemma-7b-it-lora",
        label: "Gemma 7B",
        free: true,
      },
    ],
  },
  groq: {
    default: "llama-3.3-70b-versatile",
    models: [
      { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B", free: true },
      { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant", free: true },
      { id: "gemma2-9b-it", label: "Gemma 2 9B", free: true },
      { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B", free: true },
    ],
  },
};

export function getDefaultModel(providerId) {
  return PROVIDER_MODELS[providerId]?.default ?? null;
}

export function getModelsForProvider(providerId) {
  return PROVIDER_MODELS[providerId]?.models ?? [];
}

export function isValidModelForProvider(providerId, modelId) {
  return getModelsForProvider(providerId).some((m) => m.id === modelId);
}

export function resolveModel(providerId, modelOverride) {
  if (modelOverride && isValidModelForProvider(providerId, modelOverride)) {
    return modelOverride;
  }
  return getDefaultModel(providerId);
}

export function getModelLabel(providerId, modelId) {
  const match = getModelsForProvider(providerId).find((m) => m.id === modelId);
  return match?.label ?? modelId;
}
