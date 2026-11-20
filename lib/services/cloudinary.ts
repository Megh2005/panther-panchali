import { v2 as cloudinary } from "cloudinary";
import type { TransformationType } from "../models/journey";

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

export function buildCloudinaryTransformationUrl(
  baseCloudinaryUrl: string,
  type: TransformationType,
  prompt?: string,
): string {
  if (!baseCloudinaryUrl.includes("res.cloudinary.com")) {
    throw new Error(
      "Target image must be a valid Cloudinary asset to apply transformations.",
    );
  }

  const parts = baseCloudinaryUrl.split("/upload/");
  if (parts.length !== 2) {
    throw new Error("Invalid Cloudinary asset URL structure.");
  }

  let transformClause = "";

  switch (type) {
    case "gen_fill":
      // Endless alleyway panning using Cloudinary Generative Fill
      transformClause = prompt
        ? `c_pad,ar_21:9,b_gen_fill:${encodeURIComponent(prompt)}`
        : "c_pad,ar_21:9,b_gen_fill:extend historic North Kolkata mossy alley with wrought iron balconies";
      break;

    case "gen_replace":
      // Generative Replace (e.g. Durga Puja festivities with dhak drums)
      transformClause = prompt
        ? `e_gen_replace:${encodeURIComponent(prompt)}`
        : "e_gen_replace:from_empty street;to_vibrant Durga Puja festival with vermilion powder and ceremonial umbrellas";
      break;

    case "celluloid":
      // Vintage 1950s Satyajit Ray 35mm celluloid film grain
      transformClause =
        "e_art:film_grain,co_rgb:1B1A17,e_tint:60:F6F1E6:EDE4D3";
      break;

    case "monsoon_overlay":
      // Moody monsoon rainfall and river mist contrast
      transformClause =
        "e_contrast:30,e_vignette:40,co_rgb:6B6458,e_tint:30:F6F1E6";
      break;

    case "smart_crop":
      // AI focal point tracking for artisans and cultural landmarks
      transformClause = "c_fill,g_auto,w_900,h_900,q_auto";
      break;

    default:
      transformClause = "q_auto,f_auto";
      break;
  }

  return `${parts[0]}/upload/${transformClause}/${parts[1]}`;
}

export function generateCloudinaryVideoReelUrl(publicIds: string[]): string {
  const currentCloud = process.env.CLOUDINARY_CLOUD_NAME;

  if (!currentCloud) {
    throw new Error(
      "CLOUDINARY_CLOUD_NAME is missing from environment configuration.",
    );
  }

  if (!publicIds || publicIds.length === 0) {
    throw new Error("Cannot compile video reel: publicIds array is empty.");
  }

  // Construct Cloudinary video slideshow concatenation URL
  const primary = publicIds[0];
  return `https://res.cloudinary.com/${currentCloud}/image/upload/c_fill,w_1080,h_1920,du_4,e_fade:1000/${primary}.mp4`;
}
