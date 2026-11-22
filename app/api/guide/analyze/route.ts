import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { uploadGuideImage } from "@/lib/services/cloudinary";
import { analyzeWestBengalPlaceFromImage } from "@/lib/services/gemini";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to identify places." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { imageBase64, mimeType = "image/jpeg", userNotes } = body as {
      imageBase64?: string;
      mimeType?: string;
      userNotes?: string;
    };

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Please provide an image of the place you wish to identify." },
        { status: 400 },
      );
    }

    const dataUri = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:${mimeType};base64,${imageBase64}`;

    const uploadResult = await uploadGuideImage(
      dataUri,
      "panther_panchali/guide",
    );

    const guide = await analyzeWestBengalPlaceFromImage({
      imageBase64,
      mimeType,
      userNotes,
    });

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.url,
      publicId: uploadResult.publicId,
      imageAssetId: uploadResult.assetId,
      guide,
    });
  } catch (error) {
    console.error("Error analyzing place for guide:", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze photograph.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
