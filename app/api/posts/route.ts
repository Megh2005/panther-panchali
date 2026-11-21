import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { KOLKATA_PLACES } from "@/lib/constants/kolkata-places";
import type { KolkataPost } from "@/lib/models/post";
import { getDatabase } from "@/lib/mongodb";
import { sendPostPublishedEmail } from "@/lib/services/mailer";

export async function GET() {
  try {
    const db = await getDatabase();
    const postsCol = db.collection<KolkataPost>("kolkata_posts");

    const posts = await postsCol
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // No dummy data — only real user-created posts are returned
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching Kolkata posts:", error);
    return NextResponse.json(
      { error: "Could not retrieve the Kolkata feed." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to publish a post." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      originalImageUrl,
      revampedImageUrl,
      imageUrl,
      placeId,
      placeName,
      bengaliName,
      district,
      state,
      detailedAddress,
      placeCoords,
      timeOfDay,
      yearSpan,
      vibe,
      caption,
      plainTextSummary,
      scenicBeauty,
      historicalSignificance,
      predictedMood,
      hashtags,
      extractedColors,
    } = body as Partial<KolkataPost> & {
      imageUrl?: string;
    };

    const finalImageUrl = revampedImageUrl || originalImageUrl || imageUrl;
    if (!finalImageUrl) {
      return NextResponse.json(
        { error: "An image URL is required to publish a discovery." },
        { status: 400 },
      );
    }

    const place =
      KOLKATA_PLACES.find((p) => p.id === placeId) || KOLKATA_PLACES[0];

    const finalPlaceName = placeName?.trim() || place.name;
    const finalCoords =
      placeCoords && typeof placeCoords.lat === "number" && typeof placeCoords.lng === "number"
        ? placeCoords
        : { lat: place.lat, lng: place.lng };

    const finalCaption =
      caption?.trim() ||
      (plainTextSummary
        ? plainTextSummary.slice(0, 180).trim() + "..."
        : `Discovered in ${finalPlaceName}, ${district || "West Bengal"}`);

    const postDoc: KolkataPost = {
      id: randomUUID(),
      userId: user.id || user.email,
      userEmail: user.email,
      userName: user.name || "Bengal Explorer",
      userAvatar: user.image || undefined,
      originalImageUrl: originalImageUrl || finalImageUrl,
      revampedImageUrl: finalImageUrl,
      placeId: placeId || `discovery-${Date.now()}`,
      placeName: finalPlaceName,
      bengaliName: bengaliName?.trim() || undefined,
      district: district?.trim() || "West Bengal",
      state: state?.trim() || "West Bengal",
      detailedAddress: detailedAddress?.trim() || undefined,
      placeCoords: finalCoords,
      timeOfDay: timeOfDay || "Twilight",
      yearSpan: yearSpan || "Pooja",
      vibe: vibe || "Aesthetic",
      caption: finalCaption,
      plainTextSummary: plainTextSummary?.trim() || undefined,
      scenicBeauty: scenicBeauty?.trim() || undefined,
      historicalSignificance: historicalSignificance?.trim() || undefined,
      predictedMood: predictedMood || undefined,
      hashtags: Array.isArray(hashtags)
        ? hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`))
        : [
            `#${finalPlaceName.replace(/\s+/g, "")}`,
            `#${(district || "WestBengal").replace(/\s+/g, "")}`,
            "#PantherPanchali",
            "#BengalHeritage",
          ],
      extractedColors:
        Array.isArray(extractedColors) && extractedColors.length > 0
          ? extractedColors
          : ["#B5532F", "#EDE4D3", "#1B1A17", "#E3C27A", "#6B6458"],
      likesCount: 0,
      likedBy: [],
      comments: [],
      sharesCount: 0,
      createdAt: new Date(),
    };

    const db = await getDatabase();
    await db.collection<KolkataPost>("kolkata_posts").insertOne(postDoc);

    // Send email notification to user upon successful post publishing
    if (user.email) {
      void sendPostPublishedEmail({
        to: user.email,
        userName: postDoc.userName,
        placeName: postDoc.placeName,
        yearSpan: postDoc.yearSpan,
        vibe: postDoc.vibe,
        timeOfDay: postDoc.timeOfDay,
        caption: postDoc.caption,
        hashtags: postDoc.hashtags,
        revampedImageUrl: postDoc.revampedImageUrl,
        extractedColors: postDoc.extractedColors,
        postId: postDoc.id,
      });
    }

    return NextResponse.json({ success: true, post: postDoc });
  } catch (error) {
    console.error("Error publishing Kolkata post:", error);
    const message =
      error instanceof Error ? error.message : "Could not publish your post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
