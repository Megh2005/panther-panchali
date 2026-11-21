import { NextResponse } from "next/server";
import { generateSpeechAudio } from "@/lib/services/google-tts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body as { text?: string };

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required for voice narration." },
        { status: 400 },
      );
    }

    const audioUint8 = await generateSpeechAudio(text);

    return new Response(audioUint8 as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    console.error("Voice generation failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate voice narration.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
