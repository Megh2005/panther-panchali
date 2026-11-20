import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { KOLKATA_PLACES } from "@/lib/constants/kolkata-places";
import type { PostVibe, TimeOfDay, YearSpan } from "@/lib/models/post";
import { uploadGeneratedBufferWithColors } from "@/lib/services/cloudinary";
import { generateKolkataPostCaption } from "@/lib/services/gemini";
import { generateKolkataArtworkWithStability } from "@/lib/services/stability";

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
      placeId,
      timeOfDay,
      yearSpan,
      vibe = "Aesthetic",
      userPromptNotes,
    } = body as {
      placeId?: string;
      timeOfDay?: TimeOfDay;
      yearSpan?: YearSpan;
      vibe?: PostVibe;
      userPromptNotes?: string;
    };

    const place =
      KOLKATA_PLACES.find((p) => p.id === placeId) || KOLKATA_PLACES[0];
    const selectedTime = timeOfDay || "Twilight";
    const selectedYearSpan = yearSpan || "Pooja";
    const selectedVibe = vibe || "Aesthetic";

    // 1. Generate authentic Kolkata memory photograph from scratch using Stability AI (SD 3.5 Medium base model)
    const stabilityResult = await generateKolkataArtworkWithStability({
      placeName: place.name,
      timeOfDay: selectedTime,
      yearSpan: selectedYearSpan,
      vibe: selectedVibe,
      userPromptNotes,
    });

    // 2. Ingest generated artwork to media repository and extract authentic color palette
    const uploadResult = await uploadGeneratedBufferWithColors(
      stabilityResult.imageBuffer,
      "pather_panchali/posts",
    );

    // 3. Command Gemini to synthesize an evocative plain-text caption and hashtags
    const captionResult = await generateKolkataPostCaption({
      placeName: place.name,
      timeOfDay: selectedTime,
      yearSpan: selectedYearSpan,
      vibe: selectedVibe,
      userPromptNotes,
    });

    return NextResponse.json({
      success: true,
      originalImageUrl: uploadResult.url,
      revampedImageUrl: uploadResult.url,
      extractedColors: uploadResult.colors,
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
