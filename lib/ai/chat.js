import {
  resolveModel,
  getDefaultModel,
} from "@/constant/models";

const PROVIDER_ENV = {
  gemini: ["GEMINI_API_KEY", "GEMINI_KEY"],
  groq: ["GROQ_API_KEY"],
  cloudflare: ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"],
  openrouter: ["OPENROUTER_API_KEY"],
  huggingface: ["HUGGINGFACE_API_KEY", "HF_TOKEN"],
};

function getEnv(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }
  return null;
}

function missingEnvMessage(provider) {
  const keys = PROVIDER_ENV[provider] ?? [];
  return `Missing API credentials for ${provider}. Set ${keys.join(" or ")} in your .env file.`;
}

export function normalizeMessages(input) {
  if (typeof input === "string") {
    return [{ role: "user", content: input }];
  }

  if (Array.isArray(input)) {
    return input.map((message) => ({
      role: message.role ?? "user",
      content: String(message.content ?? ""),
    }));
  }

  throw new Error("Invalid messages format. Expected a string prompt or message array.");
}

async function parseJsonResponse(res, provider) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      data?.error?.message ||
      data?.errors?.[0]?.message ||
      data?.message ||
      JSON.stringify(data);
    throw new Error(`${provider} API error (${res.status}): ${detail}`);
  }

  return data;
}

async function chatGemini(messages, model) {
  const apiKey = getEnv(...PROVIDER_ENV.gemini);
  if (!apiKey) throw new Error(missingEnvMessage("gemini"));

  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const contents = chatMessages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  const body = { contents };
  if (systemMessage) {
    body.systemInstruction = { parts: [{ text: systemMessage.content }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await parseJsonResponse(res, "Gemini");
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("");

  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

async function chatOpenAICompatible({
  messages,
  apiKey,
  baseUrl,
  model,
  providerName,
  providerKey,
  extraHeaders = {},
}) {
  if (!apiKey) {
    throw new Error(
      missingEnvMessage(providerKey ?? providerName.toLowerCase().replace(/\s+/g, ""))
    );
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({ model, messages, temperature: 0.4 }),
  });

  const data = await parseJsonResponse(res, providerName);
  const content = data?.choices?.[0]?.message?.content;

  if (!content) throw new Error(`${providerName} returned an empty response.`);
  return content;
}

async function chatGroq(messages, model) {
  return chatOpenAICompatible({
    messages,
    apiKey: getEnv(...PROVIDER_ENV.groq),
    baseUrl: "https://api.groq.com/openai/v1",
    model,
    providerName: "Groq",
    providerKey: "groq",
  });
}

async function chatOpenRouter(messages, model) {
  return chatOpenAICompatible({
    messages,
    apiKey: getEnv(...PROVIDER_ENV.openrouter),
    baseUrl: "https://openrouter.ai/api/v1",
    model,
    providerName: "OpenRouter",
    providerKey: "openrouter",
    extraHeaders: {
      "HTTP-Referer": getEnv("NEXT_PUBLIC_APP_URL") || "http://localhost:3000",
      "X-Title": "IELTS Score",
    },
  });
}

async function chatHuggingFace(messages, model) {
  return chatOpenAICompatible({
    messages,
    apiKey: getEnv(...PROVIDER_ENV.huggingface),
    baseUrl: "https://router.huggingface.co/v1",
    model,
    providerName: "Hugging Face",
    providerKey: "huggingface",
  });
}

async function chatCloudflare(messages, model) {
  const accountId = getEnv("CLOUDFLARE_ACCOUNT_ID");
  const apiToken = getEnv("CLOUDFLARE_API_TOKEN");

  if (!accountId || !apiToken) {
    throw new Error(missingEnvMessage("cloudflare"));
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    }
  );

  const data = await parseJsonResponse(res, "Cloudflare Workers AI");
  const content = data?.result?.response;

  if (!content) {
    throw new Error("Cloudflare Workers AI returned an empty response.");
  }

  return content;
}

export async function chatWithProvider(provider, input, modelOverride) {
  const model = resolveModel(provider, modelOverride);

  if (!model) {
    throw new Error(`No model configured for provider: ${provider}`);
  }

  const messages = normalizeMessages(input);

  switch (provider) {
    case "gemini":
      return chatGemini(messages, model);
    case "groq":
      return chatGroq(messages, model);
    case "openrouter":
      return chatOpenRouter(messages, model);
    case "huggingface":
      return chatHuggingFace(messages, model);
    case "cloudflare":
      return chatCloudflare(messages, model);
    default:
      throw new Error(`Unsupported server-side provider: ${provider}`);
  }
}

export { getDefaultModel, resolveModel };
