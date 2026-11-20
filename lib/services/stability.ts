import type { PostVibe, TimeOfDay, YearSpan } from "@/lib/models/post";

export interface GenerateKolkataArtworkParams {
  placeName: string;
  timeOfDay: TimeOfDay;
  yearSpan: YearSpan;
  vibe: PostVibe;
  userPromptNotes?: string;
}

export interface StabilityArtworkResult {
  imageBuffer: Buffer;
  mimeType: string;
  promptUsed: string;
}

function getStabilityApiKey(): string {
  const key = process.env.STABILITY_API_KEY;
  if (!key) {
    throw new Error(
      "STABILITY_API_KEY is not defined in the environment variables.",
    );
  }
  return key;
}

export function buildKolkataArtworkPrompt(
  params: GenerateKolkataArtworkParams,
): string {
  const { placeName, timeOfDay, yearSpan, vibe, userPromptNotes } = params;

  let timePhrase = "at twilight with amber skies and glowing streetlights";
  switch (timeOfDay) {
    case "Dawn":
      timePhrase =
        "at soft golden dawn with morning mist rising over the Hooghly river and gentle first light";
      break;
    case "Morning":
      timePhrase =
        "in crisp warm morning sunlight, bustling tea stalls with earthen bhad cups and lively street life";
      break;
    case "Afternoon":
      timePhrase =
        "in warm afternoon sunlight, colonial shutters, deep architectural shadows, and vintage charm";
      break;
    case "Twilight":
      timePhrase =
        "at enchanting godhuli twilight, golden amber sunset sky, illuminated streetlamps, and vintage reflections";
      break;
    case "Evening":
      timePhrase =
        "in vibrant evening glow with bustling yellow taxis, heritage streetlights, and warm amber illumination";
      break;
    case "Midnight":
      timePhrase =
        "at quiet midnight with solitary streetlights, nostalgic heritage facades, and peaceful stillness";
      break;
  }

  let seasonPhrase = "during festive Durga Puja with decorative pandal lighting";
  switch (yearSpan) {
    case "Pooja":
      seasonPhrase =
        "during Durga Puja with festive illuminations, autumn sky, traditional decorations, and festive atmosphere";
      break;
    case "Deepavali":
      seasonPhrase =
        "during Deepavali and Kali Puja with thousands of warm glowing earthen clay diyas and golden festive lights";
      break;
    case "Poila Baisakh":
      seasonPhrase =
        "during Poila Baisakh (Bengali New Year) with fresh auspicious marigold garlands and festive cultural banners";
      break;
    case "Winter Season":
      seasonPhrase =
        "in crisp Kolkata winter morning mist, soft golden sunlight, and nostalgic colonial atmosphere";
      break;
    case "Monsoon Rain":
      seasonPhrase =
        "in dramatic Kolkata monsoon rain with reflective wet pavement, colorful umbrellas, and monsoon clouds";
      break;
    case "Spring Breeze":
      seasonPhrase =
        "in pleasant spring season with blooming red krishnachura trees, gentle breeze, and clear skies";
      break;
  }

  let vibePhrase =
    "cinematic 35mm film photography, classic Kolkata nostalgia, warm earthy terracotta and soft gold tones";
  switch (vibe) {
    case "Aesthetic":
      vibePhrase =
        "artistic cinematic 35mm film grain, classic Kolkata nostalgia, warm earthy terracotta and soft gold palette, editorial heritage photography";
      break;
    case "Melancholy":
      vibePhrase =
        "moody atmospheric shadows, vintage sepia tint, quiet contemplative heritage architecture, poetic nostalgia";
      break;
    case "Dazzling":
      vibePhrase =
        "luminous festive illumination, radiant golden lights, sparkling celebration, dynamic colors, breathtaking visual splendor";
      break;
    case "Party":
      vibePhrase =
        "high-energy festive celebration, carnival lights, joyful crowds, vibrant celebration, rich cultural colors";
      break;
    case "Sad":
      vibePhrase =
        "poetic monochrome and muted vintage tones, poignant architectural shadows, quiet emotional stillness";
      break;
    case "Happy":
      vibePhrase =
        "warm radiant daylight, cheerful Kolkata daily life, vibrant yellow taxis, smiling street atmosphere";
      break;
  }

  const promptParts = [
    `An authentic 1:1 square masterpiece photograph of ${placeName} in Kolkata`,
    timePhrase,
    seasonPhrase,
    vibePhrase,
    userPromptNotes ? `featuring artistic elements: ${userPromptNotes}` : "",
    "photorealistic, sharp focus, iconic Kolkata cultural heritage, award-winning photography, rich textures, perfectly framed 1:1 square aspect ratio",
  ].filter(Boolean);

  return promptParts.join(", ");
}

/**
 * Generates an authentic Kolkata memory image using Stability AI's base model (SD 3.5 Medium)
 * with automatic fallback to Stability Core.
 */
export async function generateKolkataArtworkWithStability(
  params: GenerateKolkataArtworkParams,
): Promise<StabilityArtworkResult> {
  const apiKey = getStabilityApiKey();
  const prompt = buildKolkataArtworkPrompt(params);

  const negativePrompt =
    "blurry, low quality, distorted, extra limbs, cartoon, 3d render, anime, illustration, oversaturated, watermark, signature, ugly, text, frame, border, cropped";

  // 1. Primary generation via SD 3.5 Medium (the official base model from Stability documentation)
  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("model", "sd3.5-medium");
    formData.append("aspect_ratio", "1:1");
    formData.append("mode", "text-to-image");
    formData.append("output_format", "jpeg");

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/*",
        },
        body: formData,
      },
    );

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      return {
        imageBuffer: Buffer.from(arrayBuffer),
        mimeType: "image/jpeg",
        promptUsed: prompt,
      };
    }

    console.warn(
      `Stability SD 3.5 Medium responded with status ${response.status}. Falling back to Core generation.`,
      await response.text().catch(() => ""),
    );
  } catch (err) {
    console.warn(
      "Stability SD 3.5 Medium failed, attempting fallback to Core:",
      err,
    );
  }

  // 2. Fallback to Stability Core (flagship fast 1:1 generation)
  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("negative_prompt", negativePrompt);
    formData.append("aspect_ratio", "1:1");
    formData.append("style_preset", "photographic");
    formData.append("output_format", "jpeg");

    const response = await fetch(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/*",
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Stability Core error (${response.status}): ${errorText || response.statusText}`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return {
      imageBuffer: Buffer.from(arrayBuffer),
      mimeType: "image/jpeg",
      promptUsed: prompt,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stability AI generation failed.";
    throw new Error(`Stability image synthesis failed: ${message}`, {
      cause: error,
    });
  }
}
