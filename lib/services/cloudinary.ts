import { v2 as cloudinary } from "cloudinary";
import type { PostVibe, TimeOfDay, YearSpan } from "@/lib/models/post";

function getCloudinary() {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary server credentials are missing from environment configuration.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  colors: string[];
}

export interface KolkataAtmosphereParams {
  placeName: string;
  vibe: PostVibe;
  yearSpan: YearSpan;
  timeOfDay: TimeOfDay;
  userPromptNotes?: string;
}

function normalizeHexColor(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();

  // If already #RRGGBB
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // If RRGGBB without #
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }

  // If #RGB short form
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  // If RGB short form without #
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[0];
    const g = trimmed[1];
    const b = trimmed[2];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return null;
}

const DEFAULT_KOLKATA_PALETTE = [
  "#B5532F", // Terracotta
  "#EDE4D3", // Morning Paper Card
  "#1B1A17", // Vintage Ink
  "#E3C27A", // Soft Gold Glow
  "#6B6458", // Muted Sepia
];

export async function uploadToCloudinary(
  imageSource: string,
  folder = "pather_panchali",
): Promise<{ url: string; publicId: string }> {
  const cld = getCloudinary();

  try {
    const uploadRes = await cld.uploader.upload(imageSource, {
      folder,
      resource_type: "image",
    });

    return {
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Cloudinary error";
    throw new Error(`Cloudinary asset ingestion failed: ${message}`, {
      cause: error,
    });
  }
}

export async function uploadPostImageWithColors(
  imageSource: string,
  folder = "pather_panchali/posts",
): Promise<CloudinaryUploadResult> {
  const cld = getCloudinary();

  try {
    const uploadRes = await cld.uploader.upload(imageSource, {
      folder,
      resource_type: "image",
      colors: true,
      predominant: true,
    });

    const candidateColors: string[] = [];

    // 1. Extract from uploadRes.colors: typically [["#HEX", score], ...] or [{color: "#HEX", ...}]
    if (Array.isArray(uploadRes.colors)) {
      for (const item of uploadRes.colors) {
        if (Array.isArray(item)) {
          const hex = normalizeHexColor(item[0]);
          if (hex && !candidateColors.includes(hex)) {
            candidateColors.push(hex);
          }
        } else if (item && typeof item === "object") {
          const raw = (item as { color?: unknown }).color;
          const hex = normalizeHexColor(raw);
          if (hex && !candidateColors.includes(hex)) {
            candidateColors.push(hex);
          }
        }
      }
    }

    // 2. Extract from uploadRes.predominant?.cloudinary or google
    const predominant = uploadRes.predominant as
      | { cloudinary?: unknown[][]; google?: unknown[][] }
      | undefined;

    if (predominant?.cloudinary && Array.isArray(predominant.cloudinary)) {
      for (const item of predominant.cloudinary) {
        if (Array.isArray(item)) {
          const hex = normalizeHexColor(item[0]);
          if (hex && !candidateColors.includes(hex)) {
            candidateColors.push(hex);
          }
        }
      }
    }

    if (predominant?.google && Array.isArray(predominant.google)) {
      for (const item of predominant.google) {
        if (Array.isArray(item)) {
          const hex = normalizeHexColor(item[0]);
          if (hex && !candidateColors.includes(hex)) {
            candidateColors.push(hex);
          }
        }
      }
    }

    // 3. Complement with Kolkata heritage palette if fewer than 4 distinct colors
    for (const fallback of DEFAULT_KOLKATA_PALETTE) {
      if (candidateColors.length >= 5) break;
      if (!candidateColors.includes(fallback)) {
        candidateColors.push(fallback);
      }
    }

    return {
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      colors: candidateColors.slice(0, 5),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Cloudinary upload failed";
    throw new Error(`Cloudinary color extraction failed: ${message}`, {
      cause: error,
    });
  }
}

/**
 * Creates an authentic Kolkata memory image using Cloudinary's native image creation
 * and Generative AI background composition.
 *
 * Integrates:
 * 1. True 1:1 Square aspect ratio crop centered on the subject.
 * 2. Generative background replacement depicting the chosen landmark, festival, time of day, and mood.
 * 3. Atmospheric color grading and lighting filter nuances.
 */
export function revampKolkataImageAtmosphere(
  baseCloudinaryUrl: string,
  paramsOrVibe: PostVibe | KolkataAtmosphereParams = "Aesthetic",
  optionalYearSpan?: YearSpan,
  optionalTimeOfDay?: TimeOfDay,
  optionalPlaceName?: string,
  optionalUserNotes?: string,
): string {
  if (!baseCloudinaryUrl.includes("res.cloudinary.com")) {
    return baseCloudinaryUrl;
  }

  const parts = baseCloudinaryUrl.split("/upload/");
  if (parts.length !== 2) {
    return baseCloudinaryUrl;
  }

  // Parse parameters whether passed as object or individual arguments
  const params: KolkataAtmosphereParams =
    typeof paramsOrVibe === "object"
      ? paramsOrVibe
      : {
          vibe: paramsOrVibe,
          yearSpan: optionalYearSpan || "Pooja",
          timeOfDay: optionalTimeOfDay || "Twilight",
          placeName: optionalPlaceName || "Kolkata",
          userPromptNotes: optionalUserNotes,
        };

  const { placeName, vibe, yearSpan, timeOfDay, userPromptNotes } = params;

  // 1. Festival / Season scene description
  let seasonPhrase = "during Durga Puja festival with traditional pandal lanterns";
  switch (yearSpan) {
    case "Pooja":
      seasonPhrase =
        "during Durga Puja festival with traditional pandal lanterns and celebratory lights";
      break;
    case "Deepavali":
      seasonPhrase =
        "during Deepavali and Kali Puja festival illuminated with golden earthen diyas";
      break;
    case "Poila Baisakh":
      seasonPhrase =
        "during Poila Baisakh Bengali New Year with festive garlands and celebration";
      break;
    case "Winter Season":
      seasonPhrase =
        "in Calcutta winter morning mist and golden sunlight";
      break;
    case "Monsoon Rain":
      seasonPhrase =
        "in dramatic Kolkata monsoon rain with glossy street reflections";
      break;
    case "Spring Breeze":
      seasonPhrase =
        "in spring season with blossoming krishnachura trees and gentle breeze";
      break;
  }

  // 2. Time of day ambient lighting
  let timePhrase = "at atmospheric twilight dusk";
  switch (timeOfDay) {
    case "Dawn":
      timePhrase = "at soft golden dawn sunrise";
      break;
    case "Morning":
      timePhrase = "in crisp morning sunlight";
      break;
    case "Afternoon":
      timePhrase = "in warm afternoon light";
      break;
    case "Twilight":
      timePhrase = "at atmospheric twilight dusk";
      break;
    case "Evening":
      timePhrase = "in glowing evening with vintage streetlamps";
      break;
    case "Midnight":
      timePhrase = "at midnight with moody cinematic night lights";
      break;
  }

  // 3. Vibe description
  let vibePhrase = "cinematic vintage aesthetic mood";
  switch (vibe) {
    case "Aesthetic":
      vibePhrase = "artistic cinematic film grain and nostalgic Kolkata aesthetic";
      break;
    case "Melancholy":
      vibePhrase = "moody atmospheric shadows and contemplative sepia nostalgia";
      break;
    case "Dazzling":
      vibePhrase = "radiant golden illumination and sparkling celebration";
      break;
    case "Party":
      vibePhrase = "joyous festive celebration and vibrant colorful carnival lights";
      break;
    case "Sad":
      vibePhrase = "poetic vintage film tones and quiet nostalgic shadows";
      break;
    case "Happy":
      vibePhrase = "bright warm joyful colors and cheerful Kolkata city life";
      break;
  }

  // Sanitize scene prompt for Cloudinary Generative AI
  const cleanPrompt = `${placeName} Kolkata ${seasonPhrase} ${timePhrase} ${vibePhrase} ${userPromptNotes || ""}`
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_");

  // Step 1: Lock to true 1:1 square crop with content-aware framing
  // Step 2: Generative background replacement blending the landmark, season, and time
  // Step 3: Atmospheric color grading tailored to the vibe
  const transformSteps: string[] = [
    "ar_1:1,c_fill,g_auto",
    `e_gen_background_replace:prompt_${cleanPrompt}`,
  ];

  // Step 3: Color grading & lighting nuances
  const nuanceTransforms: string[] = ["q_auto", "f_auto"];

  switch (vibe) {
    case "Aesthetic":
      nuanceTransforms.push("co_rgb:1B1A17,e_tint:30:F6F1E6:EDE4D3");
      break;
    case "Melancholy":
      nuanceTransforms.push("e_contrast:20,e_vignette:30,co_rgb:6B6458,e_tint:20:F6F1E6");
      break;
    case "Dazzling":
      nuanceTransforms.push("e_vibrance:30,e_contrast:15,e_saturation:20");
      break;
    case "Party":
      nuanceTransforms.push("e_saturation:25,e_vibrance:20,e_tint:15:B5532F:E3C27A");
      break;
    case "Sad":
      nuanceTransforms.push("e_grayscale,e_contrast:10,e_tint:20:EDE4D3:1B1A17");
      break;
    case "Happy":
      nuanceTransforms.push("e_contrast:10,e_saturation:15,e_vibrance:20");
      break;
  }

  if (timeOfDay === "Twilight" || timeOfDay === "Evening") {
    nuanceTransforms.push("e_vignette:20");
  } else if (timeOfDay === "Midnight") {
    nuanceTransforms.push("e_contrast:20,e_vignette:35");
  } else if (timeOfDay === "Dawn") {
    nuanceTransforms.push("e_tint:10:E3C27A:F6F1E6");
  }

  transformSteps.push(nuanceTransforms.join(","));

  return `${parts[0]}/upload/${transformSteps.join("/")}/${parts[1]}`;
}
