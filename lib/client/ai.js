"use client";

import { useEffect, useState } from "react";

export function usePuterAI() {
  const [puter, setPuter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    import("@heyputer/puter.js")
      .then((mod) => {
        if (isMounted) {
          setPuter(mod.puter);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load Puter AI.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { puter, loading, error };
}

function extractPuterContent(response) {
  const content =
    typeof response === "string"
      ? response
      : response?.message?.content ?? response?.toString?.();

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text || ""))
      .join("");
  }

  return content ? String(content) : "";
}

export async function callPuterAI(puter, input) {
  if (!puter?.ai?.chat) {
    throw new Error("Puter AI is still loading. Please wait and try again.");
  }

  const response = await puter.ai.chat(input, { model: "gemini-3.6-flash" });
  const content = extractPuterContent(response);

  if (!content) {
    throw new Error("Puter AI returned an empty response.");
  }

  return content;
}

export async function callServerAI(provider, input) {
  const body = Array.isArray(input)
    ? { provider, messages: input }
    : { provider, prompt: input };

  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "AI request failed.");
  }

  return data.content;
}

export async function callAI({ provider, puter, input }) {
  if (provider === "puter") {
    return callPuterAI(puter, input);
  }

  return callServerAI(provider, input);
}
