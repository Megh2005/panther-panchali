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
 * Revamps an image with atmospheric Kolkata tones, strictly locked to a 1:1 square aspect ratio.
 */
export function revampKolkataImageAtmosphere(
  baseCloudinaryUrl: string,
  vibe: PostVibe = "Aesthetic",
  yearSpan: YearSpan = "Pooja",
  timeOfDay: TimeOfDay = "Twilight",
): string {
  if (!baseCloudinaryUrl.includes("res.cloudinary.com")) {
    return baseCloudinaryUrl;
  }

  const parts = baseCloudinaryUrl.split("/upload/");
  if (parts.length !== 2) {
    return baseCloudinaryUrl;
  }

  // Enforce true 1:1 square crop with smart auto gravity
  const transforms: string[] = ["c_fill,ar_1:1,g_auto", "q_auto", "f_auto"];

  // 1. Atmosphere based on vibe
  switch (vibe) {
    case "Aesthetic":
      transforms.push("e_art:film_grain,co_rgb:1B1A17,e_tint:50:F6F1E6:EDE4D3");
      break;
    case "Melancholy":
      transforms.push("e_contrast:25,e_vignette:40,co_rgb:6B6458,e_tint:30:F6F1E6");
      break;
    case "Dazzling":
      transforms.push("e_vibrance:40,e_contrast:20,e_saturation:25");
      break;
    case "Party":
      transforms.push("e_saturation:35,e_vibrance:30,e_tint:20:B5532F:E3C27A");
      break;
    case "Sad":
      transforms.push("e_grayscale,e_contrast:15,e_tint:30:EDE4D3:1B1A17");
      break;
    case "Happy":
      transforms.push("e_contrast:10,e_saturation:20,e_vibrance:25");
      break;
  }

  // 2. Festival / Season lighting nuances
  switch (yearSpan) {
    case "Pooja":
      transforms.push("co_rgb:B5532F,e_tint:15:FFFFFF");
      break;
    case "Deepavali":
      transforms.push("co_rgb:E3C27A,e_tint:20:1B1A17");
      break;
    case "Poila Baisakh":
      transforms.push("co_rgb:E3C27A,e_tint:10:F6F1E6");
      break;
    case "Monsoon Rain":
      transforms.push("e_contrast:20,e_vignette:30");
      break;
    default:
      break;
  }

  // 3. Time of day ambient adjustment
  if (timeOfDay === "Twilight" || timeOfDay === "Evening") {
    transforms.push("e_vignette:25");
  } else if (timeOfDay === "Midnight") {
    transforms.push("e_contrast:25,e_vignette:45");
  } else if (timeOfDay === "Dawn") {
    transforms.push("e_tint:15:E3C27A:F6F1E6");
  }

  const transformClause = transforms.join(",");
  return `${parts[0]}/upload/${transformClause}/${parts[1]}`;
}
