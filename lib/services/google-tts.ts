/**
 * Google Cloud Text-to-Speech service for Panther Panchali.
 * Generates clear, measured Indian English audio playback for place guide memoirs and reflections
 * using Google Cloud Text-to-Speech API with a distinguished male voice and relaxed speaking rate.
 */

export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateSpeechAudio(rawText: string): Promise<Uint8Array> {
  const apiKey =
    process.env.GOOGLE_VOICE_API_KEY ||
    process.env.GOOGLE_CLOUD_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GOOGLE_VOICE_API_KEY is not configured in environment variables.",
    );
  }

  const text = cleanTextForSpeech(rawText);
  if (!text) {
    throw new Error("Text is empty or invalid for speech synthesis.");
  }

  // Clear, distinguished Indian English male voice (Neural2-B with fallback to Wavenet-B)
  const preferredVoiceName = process.env.GOOGLE_VOICE_NAME || "en-IN-Neural2-B";

  // Relaxed speaking rate (0.86) ensuring every word is clearly distinguishable and pleasant to listen to
  const requestBody = {
    input: { text },
    voice: {
      languageCode: "en-IN",
      name: preferredVoiceName,
      ssmlGender: "MALE",
    },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: 0.86,
      pitch: 0.0,
    },
  };

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  );

  if (!response.ok) {
    const errorData = await response.text();

    // Fallback to Wavenet-B male voice if Neural2-B encounters quota limitations
    if (preferredVoiceName !== "en-IN-Wavenet-B") {
      const fallbackRes = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...requestBody,
            voice: {
              languageCode: "en-IN",
              name: "en-IN-Wavenet-B",
              ssmlGender: "MALE",
            },
          }),
        },
      );

      if (fallbackRes.ok) {
        const fallbackData = (await fallbackRes.json()) as {
          audioContent?: string;
        };
        if (fallbackData.audioContent) {
          const buffer = Buffer.from(fallbackData.audioContent, "base64");
          return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        }
      }
    }

    throw new Error(
      `Google Cloud TTS synthesis failed (${response.status}): ${errorData}`,
    );
  }

  const data = (await response.json()) as { audioContent?: string };
  if (!data.audioContent) {
    throw new Error("No audio content returned by Google Cloud Text-to-Speech.");
  }

  const buffer = Buffer.from(data.audioContent, "base64");
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
