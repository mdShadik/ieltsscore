import { EdgeTTS } from "edge-tts-universal";

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), { status: 400 });
    }

    // Generate MP3 audio using Edge Neural Voice
    const tts = new EdgeTTS(text, "en-US-AvaNeural");
    const result = await tts.synthesize();
    const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Edge TTS Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate audio" }), { status: 500 });
  }
}