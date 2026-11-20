import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { KOLKATA_PLACES } from "@/lib/constants/kolkata-places";
import type { PostVibe, TimeOfDay, YearSpan } from "@/lib/models/post";
import { createKolkataCompositeMemory } from "@/lib/services/cloudinary";
import { generateKolkataPostCaption } from "@/lib/services/gemini";

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

    // 1. Synthesize Kolkata graphic memory combining the landmark scene, festival lighting, and user portrait
    const compositeResult = await createKolkataCompositeMemory({
      userImageSource: imageSource,
      place,
      vibe: selectedVibe,
      yearSpan: selectedYearSpan,
      timeOfDay: selectedTime,
    });

    // 2. Command Gemini to synthesize an evocative plain-text caption and hashtags
    const captionResult = await generateKolkataPostCaption({
      placeName: place.name,
      timeOfDay: selectedTime,
      yearSpan: selectedYearSpan,
      vibe: selectedVibe,
      userPromptNotes,
    });

    return NextResponse.json({
      success: true,
      originalImageUrl: compositeResult.originalImageUrl,
      revampedImageUrl: compositeResult.revampedImageUrl,
      extractedColors: compositeResult.extractedColors,
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
