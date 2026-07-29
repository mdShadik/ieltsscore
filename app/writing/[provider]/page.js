import { notFound } from "next/navigation";
import WritingExam from "@/components/WritingExam";
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

export default async function WritingProviderPage({ params }) {
  const { provider } = await params;

  if (!isValidProvider(provider)) {
    notFound();
  }

  const providerConfig = getProvider(provider);

  return <WritingExam providerId={providerConfig.id} />;
}
