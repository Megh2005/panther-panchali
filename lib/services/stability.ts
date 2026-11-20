import { uploadToCloudinary } from "./cloudinary";

export interface StabilityArtResult {
  imageUrl: string;
  publicId: string;
  finishReason?: string;
}

export async function generateStabilityArtwork(params: {
  prompt: string;
  aspectRatio?: "16:9" | "1:1" | "4:3";
}): Promise<StabilityArtResult> {
  const { prompt, aspectRatio = "16:9" } = params;

  if (!prompt.trim() || prompt.length > 2000) {
    throw new Error(
      "Stability AI prompt must be between 1 and 2000 characters.",
    );
  }

  if (!process.env.STABILITY_API_KEY) {
    throw new Error(
      "STABILITY_API_KEY is not defined in environment variables.",
    );
  }

  const formData = new FormData();
  formData.append("prompt", prompt);
  formData.append("aspect_ratio", aspectRatio);
  formData.append("output_format", "webp");
  formData.append("mode", "text-to-image");

  const response = await fetch(
    "https://api.stability.ai/v2beta/stable-image/generate/core",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        Accept: "image/*",
      },
      body: formData,
      signal: AbortSignal.timeout(60_000),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Stability AI generation failed (${response.status}): ${errorBody}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64DataUri = `data:image/webp;base64,${buffer.toString("base64")}`;

  // Ingest immediately into Cloudinary for real-time generative transformations
  const cloudinaryUpload = await uploadToCloudinary(
    base64DataUri,
    "pather_panchali/scenes",
  );

  return {
    imageUrl: cloudinaryUpload.url,
    publicId: cloudinaryUpload.publicId,
    finishReason: "SUCCESS",
  };
}
