/**
 * ElevenLabs Text-to-Speech service for Panther Panchali.
 * Generates natural Indian English audio playback for place guide memoirs and reflections.
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

export async function generateSpeechAudio(
  rawText: string,
  preferredVoiceId?: string,
): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured in environment variables.");
  }

  const text = cleanTextForSpeech(rawText);
  if (!text) {
    throw new Error("Text is empty or invalid for speech synthesis.");
  }

  // Frank, clear Indian English female voice (Anjali: gHu9GtaHOXcSqFTK06ux, or custom config)
  const voiceId =
    preferredVoiceId ||
    process.env.ELEVENLABS_VOICE_ID ||
    "gHu9GtaHOXcSqFTK06ux";

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.8,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    // Fallback to Rachel (21m00Tcm4TlvDq8ikWAM) if specific voice ID is not in library
    if (voiceId !== "21m00Tcm4TlvDq8ikWAM") {
      console.warn("Retrying with default premade female voice...");
      const retryRes = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.55,
              similarity_boost: 0.8,
              style: 0.35,
              use_speaker_boost: true,
            },
          }),
        },
      );

      if (retryRes.ok) {
        return retryRes.arrayBuffer();
      }
    }

    throw new Error(`ElevenLabs TTS failed (${response.status}): ${errorBody}`);
  }

  return response.arrayBuffer();
}
