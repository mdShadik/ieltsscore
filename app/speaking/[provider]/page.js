import { notFound } from "next/navigation";
import SpeakingExam from "@/components/SpeakingExam";
import { isValidProvider, getProvider } from "@/constant/providers";

export function generateStaticParams() {
  return [
    { provider: "puter" },
    { provider: "gemini" },
    { provider: "openrouter" },
    { provider: "huggingface" },
    { provider: "cloudflare" },
    { provider: "groq" },
  ];
}

export default async function SpeakingProviderPage({ params }) {
  const { provider } = await params;

  if (!isValidProvider(provider)) {
    notFound();
  }

  const providerConfig = getProvider(provider);

  return <SpeakingExam providerId={providerConfig.id} />;
}
