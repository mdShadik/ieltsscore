import { Sparkles, Cpu, Cloud, Zap, Boxes, Route } from "lucide-react";

export const AI_PROVIDERS = {
  puter: {
    id: "puter",
    name: "Puter AI",
    description:
      "Keyless & serverless evaluation powered by Puter.js (GPT-4o routing).",
    active: true,
    clientSide: true,
    tag: "Active & Free",
    icon: Cpu,
    color:
      "border-emerald-500/40 bg-emerald-950/20 text-emerald-400 hover:border-emerald-500",
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    description:
      "Evaluate essays and speaking using Google's Gemini model.",
    active: true,
    clientSide: false,
    tag: "Active",
    icon: Sparkles,
    color:
      "border-blue-500/40 bg-blue-950/20 text-blue-400 hover:border-blue-500",
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    description:
      "Free-tier models via OpenRouter — Llama 3.3 70B and other :free models.",
    active: true,
    clientSide: false,
    tag: "Active & Free",
    icon: Route,
    color:
      "border-cyan-500/40 bg-cyan-950/20 text-cyan-400 hover:border-cyan-500",
  },
  huggingface: {
    id: "huggingface",
    name: "Hugging Face",
    description:
      "Free inference via Hugging Face — Qwen 2.5 7B Instruct on the HF router.",
    active: true,
    clientSide: false,
    tag: "Active & Free",
    icon: Boxes,
    color:
      "border-yellow-500/40 bg-yellow-950/20 text-yellow-400 hover:border-yellow-500",
  },
  cloudflare: {
    id: "cloudflare",
    name: "Cloudflare Workers AI",
    description:
      "Fast, edge-hosted evaluation using Llama 3.3 on Cloudflare Workers AI.",
    active: true,
    clientSide: false,
    tag: "Active",
    icon: Cloud,
    color:
      "border-orange-500/40 bg-orange-950/20 text-orange-400 hover:border-orange-500",
  },
  groq: {
    id: "groq",
    name: "Groq",
    description:
      "Ultra-fast inference with Groq's Llama 3.3 70B for instant scoring.",
    active: true,
    clientSide: false,
    tag: "Active",
    icon: Zap,
    color:
      "border-amber-500/40 bg-amber-950/20 text-amber-400 hover:border-amber-500",
  },
};

export const PROVIDER_IDS = Object.keys(AI_PROVIDERS);

export function getProvider(id) {
  return AI_PROVIDERS[id] ?? null;
}

export function isValidProvider(id) {
  return PROVIDER_IDS.includes(id);
}
