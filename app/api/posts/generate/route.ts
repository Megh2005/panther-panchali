import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { KOLKATA_PLACES } from "@/lib/constants/kolkata-places";
import type { PostVibe, TimeOfDay, YearSpan } from "@/lib/models/post";
import {
  revampKolkataImageAtmosphere,
  uploadPostImageWithColors,
  uploadToCloudinary,
} from "@/lib/services/cloudinary";
import { generateKolkataPostCaption } from "@/lib/services/gemini";
import {
  generateKolkataImageWithStability,
  type StabilityGenerationResult,
} from "@/lib/services/stability";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to create a post." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      imageSource,
      placeId,
      timeOfDay,
      yearSpan,
      vibe = "Aesthetic",
      userPromptNotes,
    } = body as {
      imageSource?: string;
      placeId?: string;
      timeOfDay?: TimeOfDay;
      yearSpan?: YearSpan;
      vibe?: PostVibe;
      userPromptNotes?: string;
    };

    if (!imageSource || typeof imageSource !== "string") {
      return NextResponse.json(
        { error: "An image is required to craft a Kolkata post." },
        { status: 400 },
      );
    }

    const place =
      KOLKATA_PLACES.find((p) => p.id === placeId) || KOLKATA_PLACES[0];
    const selectedTime = timeOfDay || "Twilight";
    const selectedYearSpan = yearSpan || "Pooja";
    const selectedVibe = vibe || "Aesthetic";

    // 1. Generate or revamp the photograph using Stability AI API
    let stabilityResult: StabilityGenerationResult | null = null;
    try {
      stabilityResult = await generateKolkataImageWithStability({
        imageSource,
        placeName: place.name,
        timeOfDay: selectedTime,
        yearSpan: selectedYearSpan,
        vibe: selectedVibe,
        userPromptNotes,
      });
    } catch (stabErr) {
      console.warn(
        "Stability AI generation warning (proceeding with direct atmosphere revamp):",
        stabErr instanceof Error ? stabErr.message : stabErr,
      );
    }

    // 2. Upload generated or revamped image to Cloudinary with AI color extraction
    let finalImageUrl: string;
    let originalImageUrl: string;
    let extractedColors: string[];

    if (stabilityResult) {
      // Convert Stability image buffer to data URI for Cloudinary ingestion & color extraction
      const stabilityDataUri = `data:${stabilityResult.mimeType};base64,${stabilityResult.imageBuffer.toString("base64")}`;

      const [stabilityUpload, originalUpload] = await Promise.all([
        uploadPostImageWithColors(stabilityDataUri),
        uploadToCloudinary(imageSource).catch(() => null),
      ]);

      finalImageUrl = revampKolkataImageAtmosphere(
        stabilityUpload.url,
        selectedVibe,
        selectedYearSpan,
        selectedTime,
      );
      originalImageUrl = originalUpload?.url || stabilityUpload.url;
      extractedColors = stabilityUpload.colors;
    } else {
      // Fallback: direct Cloudinary upload with atmospheric color revamp
      const directUpload = await uploadPostImageWithColors(imageSource);
      finalImageUrl = revampKolkataImageAtmosphere(
        directUpload.url,
        selectedVibe,
        selectedYearSpan,
        selectedTime,
      );
      originalImageUrl = directUpload.url;
      extractedColors = directUpload.colors;
    }

    // 3. Command Gemini to synthesize a specific plain text caption and hashtags
    const captionResult = await generateKolkataPostCaption({
      placeName: place.name,
      timeOfDay: selectedTime,
      yearSpan: selectedYearSpan,
      vibe: selectedVibe,
      userPromptNotes,
    });

    return NextResponse.json({
      success: true,
      originalImageUrl,
      revampedImageUrl: finalImageUrl,
      extractedColors,
      caption: captionResult.caption,
      hashtags: captionResult.hashtags,
      place,
    });
  } catch (error) {
    console.error("Error generating Kolkata post:", error);
    const message =
      error instanceof Error ? error.message : "Failed to synthesize post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
