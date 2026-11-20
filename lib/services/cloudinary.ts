import { v2 as cloudinary } from "cloudinary";
import type { PostVibe, TimeOfDay, YearSpan } from "@/lib/models/post";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

function assertCloudinaryConfigured(): void {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary server credentials are missing from environment configuration.",
    );
  }
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  colors: string[];
}

export async function uploadToCloudinary(
  imageSource: string,
  folder = "pather_panchali",
): Promise<{ url: string; publicId: string }> {
  assertCloudinaryConfigured();

  try {
    const uploadRes = await cloudinary.uploader.upload(imageSource, {
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
  assertCloudinaryConfigured();

  try {
    const uploadRes = await cloudinary.uploader.upload(imageSource, {
      folder,
      resource_type: "image",
      colors: true,
    });

    // Extract dominant hex colors analyzed by Cloudinary AI
    const extractedColors: string[] = [];
    if (Array.isArray(uploadRes.colors)) {
      for (const item of uploadRes.colors) {
        if (Array.isArray(item) && typeof item[0] === "string") {
          extractedColors.push(item[0]);
        }
      }
    }

    if (extractedColors.length === 0) {
      extractedColors.push("#B5532F", "#EDE4D3", "#1B1A17", "#E3C27A");
    }

    return {
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      colors: extractedColors.slice(0, 6),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Cloudinary upload failed";
    throw new Error(`Cloudinary color extraction failed: ${message}`, {
      cause: error,
    });
  }
}

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

  const transforms: string[] = ["q_auto", "f_auto"];

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
