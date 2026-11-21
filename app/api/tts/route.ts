import { NextResponse } from "next/server";
import { generateSpeechAudio } from "@/lib/services/elevenlabs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, voiceId } = body as { text?: string; voiceId?: string };

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required for audio playback." },
        { status: 400 },
      );
    }

    const audioBuffer = await generateSpeechAudio(text, voiceId);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("Audio generation failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate audio playback.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
