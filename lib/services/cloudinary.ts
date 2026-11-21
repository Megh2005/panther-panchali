import { v2 as cloudinary } from "cloudinary";

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

const DEFAULT_BENGAL_PALETTE = [
  "#B5532F",
  "#EDE4D3",
  "#1B1A17",
  "#E3C27A",
  "#6B6458",
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

    for (const fallback of DEFAULT_BENGAL_PALETTE) {
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
 * Helper to upload a base64 buffer with dominant 5-color palette extraction.
 */
export async function uploadGeneratedBufferWithColors(
  buffer: Buffer,
  folder = "pather_panchali/discoveries",
): Promise<CloudinaryUploadResult> {
  const dataUri = `data:image/jpeg;base64,${buffer.toString("base64")}`;
  return uploadPostImageWithColors(dataUri, folder);
}

