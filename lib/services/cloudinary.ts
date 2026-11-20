import { v2 as cloudinary } from "cloudinary";
import type { PostVibe, TimeOfDay, YearSpan } from "@/lib/models/post";
import type { KolkataPlaceWithBackdrop } from "@/lib/constants/kolkata-places";

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

export interface KolkataCompositeParams {
  place: KolkataPlaceWithBackdrop;
  vibe: PostVibe;
  yearSpan: YearSpan;
  timeOfDay: TimeOfDay;
  userPromptNotes?: string;
}

function normalizeHexColor(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();

  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
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
 * Creates an authentic Kolkata graphic memory poster combining:
 * 1. Landmark scenic backdrop (e.g., Howrah Bridge, Victoria Memorial, Kumartuli)
 * 2. User's photo layered in the foreground
 * 3. Seasonal festival lighting (Durga Puja, Deepavali, etc.)
 * 4. Ambient time-of-day illumination and vintage vignette
 * 5. Strictly locked to 1:1 Square aspect ratio
 */
export async function createKolkataCompositeMemory(params: {
  userImageSource: string;
  place: KolkataPlaceWithBackdrop;
  vibe: PostVibe;
  yearSpan: YearSpan;
  timeOfDay: TimeOfDay;
}): Promise<{
  revampedImageUrl: string;
  originalImageUrl: string;
  extractedColors: string[];
}> {
  const cld = getCloudinary();

  // 1. Upload user's photo with color extraction
  const userUpload = await uploadPostImageWithColors(
    params.userImageSource,
    "pather_panchali/posts/users",
  );

  // 2. Upload or ensure landmark scenic background is in Cloudinary
  const landmarkUpload = await cld.uploader.upload(params.place.backdropUrl, {
    folder: "pather_panchali/landmarks",
    public_id: `landmark_${params.place.id}`,
    overwrite: false,
  });

  // 3. Build atmospheric color and lighting transformations
  const nuanceTransforms: Record<string, unknown>[] = [
    { quality: "auto", fetch_format: "auto" },
  ];

  switch (params.yearSpan) {
    case "Pooja":
      nuanceTransforms.push({
        color: "rgb:B5532F",
        effect: "tint:15:F6F1E6",
      });
      break;
    case "Deepavali":
      nuanceTransforms.push({
        color: "rgb:E3C27A",
        effect: "tint:20:1B1A17",
      });
      break;
    case "Poila Baisakh":
      nuanceTransforms.push({
        color: "rgb:E3C27A",
        effect: "tint:12:F6F1E6",
      });
      break;
    case "Monsoon Rain":
      nuanceTransforms.push({ effect: "contrast:20" });
      break;
    default:
      break;
  }

  switch (params.vibe) {
    case "Aesthetic":
      nuanceTransforms.push({ effect: "contrast:15" });
      break;
    case "Melancholy":
      nuanceTransforms.push({
        color: "rgb:6B6458",
        effect: "tint:20:F6F1E6",
      });
      break;
    case "Dazzling":
      nuanceTransforms.push({ effect: "vibrance:30" });
      break;
    case "Party":
      nuanceTransforms.push({ effect: "saturation:25" });
      break;
    case "Sad":
      nuanceTransforms.push({ effect: "grayscale" });
      break;
    case "Happy":
      nuanceTransforms.push({ effect: "contrast:10" }, { effect: "saturation:15" });
      break;
  }

  if (params.timeOfDay === "Twilight" || params.timeOfDay === "Evening") {
    nuanceTransforms.push({ effect: "vignette:25" });
  } else if (params.timeOfDay === "Midnight") {
    nuanceTransforms.push({ effect: "contrast:20" }, { effect: "vignette:35" });
  } else if (params.timeOfDay === "Dawn") {
    nuanceTransforms.push({
      color: "rgb:E3C27A",
      effect: "tint:10:E3C27A:F6F1E6",
    });
  }

  // 4. Construct graphic composite: Landmark scenic background + User portrait in foreground
  const compositeUrl = cld.url(landmarkUpload.public_id, {
    transformation: [
      {
        width: 1080,
        height: 1080,
        crop: "fill",
        aspect_ratio: "1:1",
        gravity: "auto",
      },
      { effect: "contrast:10" },
      {
        overlay: userUpload.publicId.replace(/\//g, ":"),
        width: 720,
        height: 720,
        crop: "fill",
        gravity: "south",
        y: 0,
      },
      ...nuanceTransforms,
    ],
    secure: true,
  });

  return {
    revampedImageUrl: compositeUrl,
    originalImageUrl: userUpload.url,
    extractedColors: userUpload.colors,
  };
}

/**
 * Backwards-compatible helper for revamping an existing Cloudinary URL with square framing and lighting.
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

  const transforms: string[] = ["ar_1:1,c_fill,g_auto", "q_auto", "f_auto"];

  if (yearSpan === "Pooja") {
    transforms.push("co_rgb:B5532F,e_tint:15:F6F1E6");
  } else if (yearSpan === "Deepavali") {
    transforms.push("co_rgb:E3C27A,e_tint:20:1B1A17");
  }

  if (vibe === "Aesthetic") {
    transforms.push("e_contrast:15");
  } else if (vibe === "Melancholy") {
    transforms.push("e_contrast:20,co_rgb:6B6458,e_tint:20:F6F1E6");
  } else if (vibe === "Dazzling") {
    transforms.push("e_vibrance:30");
  }

  if (timeOfDay === "Twilight" || timeOfDay === "Evening") {
    transforms.push("e_vignette:25");
  }

  return `${parts[0]}/upload/${transforms.join(",")}/${parts[1]}`;
}
