import { chatWithProvider } from "@/lib/ai/chat";
import { isValidProvider, getProvider } from "@/constant/providers";

export async function POST(req) {
  try {
    const { provider, prompt, messages, model } = await req.json();

    if (!provider || !isValidProvider(provider)) {
      return Response.json({ error: "Invalid or missing provider." }, { status: 400 });
    }

    const providerConfig = getProvider(provider);
    if (providerConfig.clientSide) {
      return Response.json(
        { error: `${providerConfig.name} runs client-side and cannot use this API route.` },
        { status: 400 }
      );
    }

    const input = messages ?? prompt;
    if (!input) {
      return Response.json(
        { error: "Provide either prompt (string) or messages (array)." },
        { status: 400 }
      );
    }

    const content = await chatWithProvider(provider, input, model);
    return Response.json({ content, model: model ?? null });
  } catch (error) {
    console.error("AI chat error:", error);
    return Response.json(
      { error: error.message || "AI request failed." },
      { status: 500 }
    );
  }
}
