import type { PostVibe, TimeOfDay, YearSpan } from "@/lib/models/post";

export interface GenerateKolkataArtworkParams {
  placeId?: string;
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

/**
 * Rich architectural and visual descriptors for every iconic Kolkata landmark.
 * Text-to-image diffusion models (SD 3.5 / Core) require concrete visual keywords
 * (cantilever steel trusses, white Makrana marble dome, Navaratna nine spires, etc.)
 * rather than bare regional place names to generate authentic locations.
 */
export const PLACE_VISUAL_PROMPTS: Record<string, string> = {
  "howrah-bridge":
    "the world-famous Howrah Bridge (Rabindra Setu) in Kolkata, the iconic massive steel cantilever truss bridge spanning across the Hooghly River, historic riveted steel architecture, wooden country ferry boats on the river below, classic yellow Ambassador taxis crossing",
  "victoria-memorial":
    "the majestic Victoria Memorial monument in Kolkata, grand white Makrana marble palace with its iconic central dome and bronze angel of victory atop, neoclassical royal colonnades, grand reflecting water pool in front, sprawling gardens",
  kumartuli:
    "Kumartuli artisan quarter in North Kolkata, narrow rustic potter alleys filled with generational sculptors shaping straw and clay idols of goddess Durga and Kali, bamboo armatures, clay pots, wet river silt sculptures in traditional open-front workshops",
  "college-street":
    "the historic College Street (Boi Para) in Kolkata, iconic second-hand book market with wooden stalls stacked high with thousands of books, vintage colonial academic buildings, Presidency University gates, yellow taxis on vintage tramway streets",
  "prinsep-ghat":
    "historic Prinsep Ghat on the Hooghly riverfront in Kolkata, British Palladian neoclassical monument with grand white Greek-Ionian arches and columns, wooden country rowboats on the river water, Vidyasagar Setu cable-stayed bridge spanning in the background",
  "park-street":
    "famous Park Street in Kolkata, grand heritage avenue lined with British colonial architecture, iconic legacy dining facades including Flurys and Peter Cat, illuminated vintage street lamps, yellow ambassador cabs, and bustling Kolkata evening life",
  "sovabazar-rajbari":
    "the aristocratic 18th-century Sovabazar Rajbari palace in North Kolkata, magnificent open-air thakurdalan courtyard with classical Roman-Corinthian pillars, antique hanging lanterns, red-oxide verandas, and classical Bengali aristocratic royal heritage architecture",
  dakshineswar:
    "the sacred Dakshineswar Kali Temple in Kolkata on the bank of the Hooghly River, grand traditional Bengal Navaratna nine-spire terracotta temple architecture, twelve Shiva shrines with curved roofs, stone river bathing ghat steps",
  kalighat:
    "the ancient sacred Kalighat Kali Temple in Kolkata on the Adi Ganga canal, iconic Hindu pilgrimage site with traditional curved Bengali chala roof architecture, marigold flower garlands, sacred red vermilion altars, and heritage temple courtyards",
  shyambazar:
    "the famous Shyambazar five-point crossing in North Kolkata, iconic electric blue and white tram tracks with vintage streetcars, the historic bronze equestrian statue of Netaji Subhas Chandra Bose, heritage colonial balconies, and roadside clay tea stalls",
  gariahat:
    "bustling Gariahat shopping crossing in South Kolkata, famous vibrant avenue lined with roadside stalls, traditional Bengali handloom saree shops with vibrant colorful fabrics, street vendors, and lively city sidewalks",
  "new-market":
    "historic New Market (Sir Stuart Hogg Market) in Central Kolkata, iconic Victorian red-brick Gothic shopping arcade with its central red-brick clock tower, arched colonnaded entrances, and vintage market passages",
};

export function buildKolkataArtworkPrompt(
  params: GenerateKolkataArtworkParams,
): string {
  const { placeId, placeName, timeOfDay, yearSpan, vibe, userPromptNotes } =
    params;

  // Resolve the exact visual descriptor using placeId or placeName
  const normalizedKey =
    placeId || placeName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const visualDescriptor =
    PLACE_VISUAL_PROMPTS[normalizedKey] ||
    PLACE_VISUAL_PROMPTS[placeId || ""] ||
    `${placeName} in Kolkata, authentic iconic Indian heritage architecture and city atmosphere`;

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

  // Anchor visual descriptor at the absolute front of the prompt for maximum attention weight
  const promptParts = [
    `A photorealistic 1:1 square photograph of ${visualDescriptor}`,
    timePhrase,
    seasonPhrase,
    vibePhrase,
    userPromptNotes ? `featuring details: ${userPromptNotes}` : "",
    "masterpiece photography, highly detailed, sharp focus, 35mm lens, authentic Kolkata cultural textures, award-winning composition, perfectly framed 1:1 aspect ratio",
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
    "blurry, low quality, distorted, extra limbs, cartoon, 3d render, anime, painting, illustration, oversaturated, watermark, signature, ugly, text, frame, border, cropped, modern generic skyscraper, western city, futuristic buildings";

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
