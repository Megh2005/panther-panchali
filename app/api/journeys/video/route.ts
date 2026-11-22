import { NextResponse } from "next/server";
import type { ExploredPlace, VideoVariant } from "@/lib/models/guide";
import { getDatabase } from "@/lib/mongodb";
import {
  checkImageToVideoStatus,
  generateImageToVideo,
  getVariantPrompts,
  resolveCloudinaryAssetId,
} from "@/lib/services/cloudinary";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { placeId, variantId = "variant1", prompt: customPrompt } = body as {
      placeId?: string;
      variantId?: "variant1" | "variant2";
      prompt?: string;
    };

    if (!placeId) {
      return NextResponse.json(
        { error: "placeId is required to generate a video." },
        { status: 400 },
      );
    }

    if (variantId !== "variant1" && variantId !== "variant2") {
      return NextResponse.json(
        { error: "variantId must be 'variant1' or 'variant2'." },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const collection = db.collection<ExploredPlace>("explored_places");

    const place = await collection.findOne({ id: placeId });
    if (!place) {
      return NextResponse.json({ error: "Place not found." }, { status: 404 });
    }

    // Resolve image asset ID
    let assetId = place.imageAssetId;
    if (!assetId) {
      const identifier = place.publicId || place.imageUrl;
      if (identifier) {
        assetId = (await resolveCloudinaryAssetId(identifier)) || undefined;
      }
    }

    if (!assetId) {
      return NextResponse.json(
        {
          error:
            "Could not resolve the Cloudinary image asset ID for this picture. Please ensure the image is uploaded to your Media Library.",
        },
        { status: 422 },
      );
    }

    // Determine prompt based on chosen variant
    const variantPresets = getVariantPrompts(
      place.placeName || "Bengal landmark",
      place.district || "West Bengal",
    );
    const preset = variantPresets[variantId];
    const prompt = (customPrompt?.trim() || preset.prompt).trim();

    // Call Cloudinary v2 image-to-video endpoint
    const result = await generateImageToVideo({
      imageAssetId: assetId,
      prompt,
      aspectRatio: "16:9",
      resolution: "1080p",
      duration: 8,
      generateAudio: true,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Failed to start video generation job.",
          raw: result.raw,
        },
        { status: 502 },
      );
    }

    const isDirectlyReady = Boolean(result.videoUrl);
    const initialStatus: VideoVariant["status"] = isDirectlyReady
      ? "completed"
      : "generating";

    const variantRecord: VideoVariant = {
      variantId,
      name: preset.name,
      prompt,
      jobId: result.jobId,
      videoUrl: result.videoUrl,
      status: initialStatus,
      updatedAt: new Date(),
    };

    // Update place in MongoDB with asset ID and video variant
    await collection.updateOne(
      { id: placeId },
      {
        $set: {
          imageAssetId: assetId,
          [`videos.${variantId}`]: variantRecord,
        },
      },
    );

    return NextResponse.json({
      success: true,
      variant: variantRecord,
      jobId: result.jobId,
      status: initialStatus,
      videoUrl: result.videoUrl,
    });
  } catch (error) {
    console.error("Error generating image to video:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate video.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("placeId");
    const variantId = (searchParams.get("variantId") || "variant1") as
      | "variant1"
      | "variant2";
    const jobId = searchParams.get("jobId");

    if (!placeId) {
      return NextResponse.json(
        { error: "placeId is required." },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const collection = db.collection<ExploredPlace>("explored_places");

    // If jobId is provided, poll Cloudinary API
    if (jobId) {
      const statusRes = await checkImageToVideoStatus(jobId);

      if (statusRes.status === "completed" && statusRes.videoUrl) {
        await collection.updateOne(
          { id: placeId },
          {
            $set: {
              [`videos.${variantId}.status`]: "completed",
              [`videos.${variantId}.videoUrl`]: statusRes.videoUrl,
              [`videos.${variantId}.updatedAt`]: new Date(),
            },
          },
        );

        return NextResponse.json({
          success: true,
          status: "completed",
          videoUrl: statusRes.videoUrl,
        });
      }

      if (statusRes.status === "failed") {
        await collection.updateOne(
          { id: placeId },
          {
            $set: {
              [`videos.${variantId}.status`]: "failed",
              [`videos.${variantId}.error`]:
                statusRes.error || "Generation failed",
              [`videos.${variantId}.updatedAt`]: new Date(),
            },
          },
        );

        return NextResponse.json({
          success: false,
          status: "failed",
          error: statusRes.error || "Video generation failed.",
        });
      }

      return NextResponse.json({
        success: true,
        status: "generating",
      });
    }

    // Otherwise, fetch current state from DB
    const place = await collection.findOne({ id: placeId });
    if (!place) {
      return NextResponse.json({ error: "Place not found." }, { status: 404 });
    }

    const variantData = place.videos?.[variantId] || null;
    return NextResponse.json({
      success: true,
      variant: variantData,
    });
  } catch (error) {
    console.error("Error retrieving video status:", error);
    const message =
      error instanceof Error ? error.message : "Failed to retrieve video status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
