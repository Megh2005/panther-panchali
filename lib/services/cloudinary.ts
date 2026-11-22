import * as cloudinaryPackage from "cloudinary";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  assetId?: string;
  colors?: string[];
}

export function getCloudinaryConfig() {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

  return { cloudName, apiKey, apiSecret };
}

export function getCloudinary() {
  const cld = (
    (cloudinaryPackage as any).v2 ||
    (cloudinaryPackage as any).default?.v2 ||
    (cloudinaryPackage as any).default ||
    cloudinaryPackage
  ) as typeof import("cloudinary").v2;

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

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
 * Uploads an image to Cloudinary storage and returns its secure URL, public ID, and asset ID.
 */
export async function uploadGuideImage(
  imageSource: string,
  folder = "panther_panchali/guide",
): Promise<CloudinaryUploadResult> {
  const cld = getCloudinary();

  if (!cld || typeof cld.uploader?.upload !== "function") {
    console.warn("Cloudinary credentials not configured; using fallback storage.");
    return {
      url: imageSource,
      publicId: `local-${Date.now()}`,
    };
  }

  try {
    const uploadRes = await cld.uploader.upload(imageSource, {
      folder,
      resource_type: "image",
    });

    return {
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      assetId: uploadRes.asset_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed, falling back to original source:", error);
    return {
      url: imageSource,
      publicId: `fallback-${Date.now()}`,
    };
  }
}

/**
 * Backwards compatible alias for uploadGuideImage.
 */
export async function uploadGuideImageWithColors(
  imageSource: string,
  folder = "panther_panchali/guide",
): Promise<CloudinaryUploadResult> {
  const result = await uploadGuideImage(imageSource, folder);
  return {
    ...result,
    colors: [],
  };
}

export const uploadToCloudinary = async (
  imageSource: string,
  folder = "panther_panchali/guide",
): Promise<{ url: string; publicId: string; assetId?: string }> => {
  const res = await uploadGuideImage(imageSource, folder);
  return { url: res.url, publicId: res.publicId, assetId: res.assetId };
};

/**
 * Resolves or fetches the Cloudinary asset_id for a given public ID or URL.
 */
export async function resolveCloudinaryAssetId(
  publicIdOrUrl: string,
): Promise<string | null> {
  const cld = getCloudinary();
  if (!cld) return null;

  // If publicIdOrUrl is already an asset_id (32-char hex), return it
  if (/^[0-9a-fA-F]{32}$/.test(publicIdOrUrl.trim())) {
    return publicIdOrUrl.trim();
  }

  try {
    // 1. Try querying resource by public_id directly
    const res = await cld.api.resource(publicIdOrUrl, { resource_type: "image" });
    if (res?.asset_id) {
      return res.asset_id;
    }
  } catch {
    // Not found by direct public ID, continue to fallback attempts
  }

  try {
    // 2. If it is a full Cloudinary URL, extract publicId
    const match = publicIdOrUrl.match(/\/upload\/(?:v\d+\/)?([^\.\?#]+)/);
    if (match?.[1]) {
      const extractedPublicId = decodeURIComponent(match[1]);
      const res = await cld.api.resource(extractedPublicId, { resource_type: "image" });
      if (res?.asset_id) {
        return res.asset_id;
      }
    }
  } catch {
    // Continue to upload attempt
  }

  try {
    // 3. Fallback: upload the URL to Cloudinary to acquire an asset_id
    if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://") || publicIdOrUrl.startsWith("data:")) {
      const uploadRes = await cld.uploader.upload(publicIdOrUrl, {
        folder: "panther_panchali/guide",
        resource_type: "image",
      });
      if (uploadRes?.asset_id) {
        return uploadRes.asset_id;
      }
    }
  } catch (err) {
    console.error("Failed to resolve Cloudinary asset_id:", err);
  }

  return null;
}

export interface ImageToVideoParams {
  imageAssetId: string;
  prompt: string;
  aspectRatio?: string;
  resolution?: string;
  duration?: number;
  generateAudio?: boolean;
}

export interface ImageToVideoResponse {
  success: boolean;
  jobId?: string;
  status: string;
  videoUrl?: string;
  error?: string;
  raw?: unknown;
}

/**
 * Triggers Cloudinary Image-to-Video generation using the v2 endpoint:
 * POST https://api.cloudinary.com/v2/video/CLOUD_NAME/image_to_video/generate
 */
export async function generateImageToVideo(
  params: ImageToVideoParams,
): Promise<ImageToVideoResponse> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      success: false,
      status: "failed",
      error: "Cloudinary credentials are not configured in environment.",
    };
  }

  const endpoint = `https://api.cloudinary.com/v2/video/${cloudName}/image_to_video/generate`;
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  const payload = {
    prompt: params.prompt,
    image_asset_id: params.imageAssetId,
    aspect_ratio: params.aspectRatio || "16:9",
    resolution: params.resolution || "1080p",
    duration: params.duration ?? 8,
    generate_audio: params.generateAudio ?? true,
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg =
        data.error?.message ||
        data.message ||
        `Video generation request failed with status ${res.status}`;
      return {
        success: false,
        status: "failed",
        error: errMsg,
        raw: data,
      };
    }

    const jobId =
      data.jobId ||
      data.job_id ||
      data.id ||
      data.data?.job_id ||
      data.data?.id;

    const status = data.status || "processing";
    const videoUrl =
      data.data?.output?.secure_url ||
      data.output?.secure_url ||
      data.secure_url ||
      data.data?.secure_url ||
      data.data?.output?.playback_url ||
      data.playback_url;

    return {
      success: true,
      jobId: jobId ? String(jobId) : undefined,
      status,
      videoUrl,
      raw: data,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network error calling image_to_video API";
    return {
      success: false,
      status: "failed",
      error: message,
    };
  }
}

/**
 * Checks status of an asynchronous Cloudinary Image-to-Video generation job:
 * GET https://api.cloudinary.com/v2/video/CLOUD_NAME/image_to_video/generate/{jobId}
 */
export async function checkImageToVideoStatus(
  jobId: string,
): Promise<{
  status: "completed" | "processing" | "pending" | "failed";
  videoUrl?: string;
  error?: string;
  raw?: unknown;
}> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      status: "failed",
      error: "Cloudinary credentials are not configured in environment.",
    };
  }

  const endpoint = `https://api.cloudinary.com/v2/video/${cloudName}/image_to_video/generate/${encodeURIComponent(jobId)}`;
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg =
        data.error?.message ||
        data.message ||
        `Status check failed with status ${res.status}`;
      return {
        status: "failed",
        error: errMsg,
        raw: data,
      };
    }

    const rawStatus = String(data.status || "processing").toLowerCase();
    const isCompleted =
      rawStatus === "completed" ||
      rawStatus === "complete" ||
      rawStatus === "success" ||
      rawStatus === "ready";
    const isFailed = rawStatus === "failed" || rawStatus === "error";

    const videoUrl =
      data.data?.output?.secure_url ||
      data.output?.secure_url ||
      data.secure_url ||
      data.data?.secure_url ||
      data.data?.output?.playback_url ||
      data.playback_url;

    return {
      status: isCompleted ? "completed" : isFailed ? "failed" : "processing",
      videoUrl,
      error: isFailed ? data.error?.message || data.message || "Generation failed" : undefined,
      raw: data,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network error checking video status";
    return {
      status: "failed",
      error: message,
    };
  }
}

/**
 * Provides cinematic prompt templates for the two motion variants.
 */
export function getVariantPrompts(placeName: string, district: string) {
  return {
    variant1: {
      variantId: "variant1" as const,
      name: "Serene Atmosphere",
      description: "Gentle morning mist, slow cinematic drift, and soft ambient light",
      prompt: `A serene, cinematic slow-motion drone fly-through over ${placeName} in ${district}, West Bengal, with gentle morning breeze rustling through trees and soft natural atmospheric light`,
    },
    variant2: {
      variantId: "variant2" as const,
      name: "Golden Hour Sunset",
      description: "Warm sunset glow, vibrant golden rays, and lively evening motion",
      prompt: `A magnificent golden hour cinematic video of ${placeName} in ${district}, West Bengal, bathed in warm sunset glow with dramatic skies and gentle evening ambient movement`,
    },
  };
}
