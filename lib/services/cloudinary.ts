import * as cloudinaryPackage from "cloudinary";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  colors: string[];
}

const DEFAULT_BENGAL_PALETTE = [
  "#B5532F",
  "#EDE4D3",
  "#1B1A17",
  "#E3C27A",
  "#6B6458",
];

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

function getCloudinary() {
  const cld = (
    (cloudinaryPackage as any).v2 ||
    (cloudinaryPackage as any).default?.v2 ||
    (cloudinaryPackage as any).default ||
    cloudinaryPackage
  ) as typeof import("cloudinary").v2;

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
    return null;
  }

  cld.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cld;
}

/**
 * Uploads an image to Cloudinary storage and extracts its 5-color atmospheric palette.
 */
export async function uploadGuideImageWithColors(
  imageSource: string,
  folder = "panther_panchali/guide",
): Promise<CloudinaryUploadResult> {
  const cld = getCloudinary();

  if (!cld || typeof cld.uploader?.upload !== "function") {
    console.warn("Cloudinary credentials not configured; using fallback storage.");
    return {
      url: imageSource,
      publicId: `local-${Date.now()}`,
      colors: DEFAULT_BENGAL_PALETTE,
    };
  }

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
          if (hex && !candidateColors.includes(hex)) candidateColors.push(hex);
        } else if (item && typeof item === "object") {
          const raw = (item as { color?: unknown }).color;
          const hex = normalizeHexColor(raw);
          if (hex && !candidateColors.includes(hex)) candidateColors.push(hex);
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
          if (hex && !candidateColors.includes(hex)) candidateColors.push(hex);
        }
      }
    }

    for (const fallback of DEFAULT_BENGAL_PALETTE) {
      if (candidateColors.length >= 5) break;
      if (!candidateColors.includes(fallback)) candidateColors.push(fallback);
    }

    return {
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      colors: candidateColors.slice(0, 5),
    };
  } catch (error) {
    console.error("Cloudinary upload failed, falling back to original source:", error);
    return {
      url: imageSource,
      publicId: `fallback-${Date.now()}`,
      colors: DEFAULT_BENGAL_PALETTE,
    };
  }
}

export const uploadToCloudinary = async (
  imageSource: string,
  folder = "panther_panchali/guide",
): Promise<{ url: string; publicId: string }> => {
  const res = await uploadGuideImageWithColors(imageSource, folder);
  return { url: res.url, publicId: res.publicId };
};
