export interface GenerateStabilityImageParams {
  imageSource?: string;
  placeName: string;
  timeOfDay: string;
  yearSpan: string;
  vibe: string;
  userPromptNotes?: string;
}

export interface StabilityGenerationResult {
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

function parseDataUri(
  dataUri: string,
): { buffer: Buffer; mimeType: string } | null {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

export function buildKolkataImagePrompt(params: {
  placeName: string;
  timeOfDay: string;
  yearSpan: string;
  vibe: string;
  userPromptNotes?: string;
}): string {
  const { placeName, timeOfDay, yearSpan, vibe, userPromptNotes } = params;

  let vibeDescription = "cinematic vintage lighting, muted film tones";
  switch (vibe) {
    case "Aesthetic":
      vibeDescription =
        "artistic cinematic film grain, classic Kolkata nostalgia, warm earthy palette";
      break;
    case "Melancholy":
      vibeDescription =
        "moody atmospheric shadows, sepia reflections, gentle rain-washed stones, quiet contemplative tone";
      break;
    case "Dazzling":
      vibeDescription =
        "luminous festive illumination, vibrant golden lights, sparkling celebration, dynamic colors";
      break;
    case "Party":
      vibeDescription =
        "energetic festive celebration, rich marigold garlands, celebratory carnival lights, lively ambiance";
      break;
    case "Sad":
      vibeDescription =
        "monochrome vintage film tones, poignant architectural shadows, quiet emotional stillness";
      break;
    case "Happy":
      vibeDescription =
        "warm radiant daylight, joyful street atmosphere, vibrant yellow taxis and flowering trees";
      break;
  }

  let seasonDescription = "during Durga Puja with traditional pandal lanterns";
  switch (yearSpan) {
    case "Pooja":
      seasonDescription =
        "during Durga Puja with festive illuminations, autumn sky, and traditional decorations";
      break;
    case "Deepavali":
      seasonDescription =
        "during Deepavali and Kali Puja with earthen diyas and golden night warmth";
      break;
    case "Poila Baisakh":
      seasonDescription =
        "during Poila Baisakh (Bengali New Year), auspicious festive banners and floral garlands";
      break;
    case "Winter Season":
      seasonDescription =
        "in crisp Calcutta winter morning mist and golden winter sunlight";
      break;
    case "Monsoon Rain":
      seasonDescription =
        "in Kolkata monsoon rain, glossy wet pavement reflections, dramatic clouds";
      break;
    case "Spring Breeze":
      seasonDescription =
        "in pleasant spring breeze with blooming krishnachura trees";
      break;
  }

  const promptParts = [
    `A 1:1 square authentic photograph of ${placeName} in Kolkata`,
    `captured at ${timeOfDay}`,
    seasonDescription,
    vibeDescription,
    userPromptNotes ? `featuring details: ${userPromptNotes}` : "",
    "masterpiece photography, authentic Indian heritage architecture, photorealistic, sharp focus, 1:1 square social post",
  ].filter(Boolean);

  return promptParts.join(", ");
}

/**
 * Generates or revamps a Kolkata photograph using Stability AI API.
 * Uses SD 3.5 Image-to-Image when an image is provided, with fallback to Stability Core / SD3 Text-to-Image.
 */
export async function generateKolkataImageWithStability(
  params: GenerateStabilityImageParams,
): Promise<StabilityGenerationResult> {
  const apiKey = getStabilityApiKey();
  const prompt = buildKolkataImagePrompt(params);

  // 1. Try Image-to-Image if imageSource is a valid base64 data URI
  if (params.imageSource && params.imageSource.startsWith("data:")) {
    const parsed = parseDataUri(params.imageSource);
    if (parsed && parsed.buffer.byteLength > 1024) {
      try {
        const blob = new Blob([new Uint8Array(parsed.buffer)], {
          type: parsed.mimeType || "image/jpeg",
        });

        const formData = new FormData();
        formData.append("image", blob, "user-photo.jpg");
        formData.append("prompt", prompt);
        formData.append("mode", "image-to-image");
        formData.append("strength", "0.62");
        formData.append("model", "sd3.5-large");
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
          "Stability SD3 Image-to-Image returned non-200, falling back to text-to-image:",
          response.status,
          await response.text().catch(() => ""),
        );
      } catch (err) {
        console.warn(
          "Stability Image-to-Image request failed, falling back to Core/SD3 text-to-image:",
          err,
        );
      }
    }
  }

  // 2. Text-to-Image via Stability Core (flagship fast 1:1 generation)
  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append(
      "negative_prompt",
      "blurry, low quality, distorted, extra limbs, cartoon, 3d render, illustration, oversaturated, watermark, signature",
    );
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
        `Stability API error (${response.status}): ${errorText || response.statusText}`,
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
    throw new Error(`Stability image generation error: ${message}`, {
      cause: error,
    });
  }
}
