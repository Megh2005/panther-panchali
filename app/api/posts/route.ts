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
      placeId,
      timeOfDay,
      yearSpan,
      vibe,
      caption,
      hashtags,
      extractedColors,
    } = body as Partial<KolkataPost>;

    if (!revampedImageUrl || !placeId || !caption) {
      return NextResponse.json(
        { error: "revampedImageUrl, placeId, and caption are required." },
        { status: 400 },
      );
    }

    const place =
      KOLKATA_PLACES.find((p) => p.id === placeId) || KOLKATA_PLACES[0];

    const postDoc: KolkataPost = {
      id: randomUUID(),
      userId: user.id || user.email,
      userEmail: user.email,
      userName: user.name || "Kolkata Explorer",
      userAvatar: user.image || undefined,
      originalImageUrl: originalImageUrl || revampedImageUrl,
      revampedImageUrl,
      placeId: place.id,
      placeName: place.name,
      placeCoords: {
        lat: place.lat,
        lng: place.lng,
      },
      timeOfDay: timeOfDay || "Twilight",
      yearSpan: yearSpan || "Pooja",
      vibe: vibe || "Aesthetic",
      caption: caption.trim(),
      hashtags: Array.isArray(hashtags)
        ? hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`))
        : [],
      extractedColors:
        Array.isArray(extractedColors) && extractedColors.length > 0
          ? extractedColors
          : ["#B5532F", "#EDE4D3", "#1B1A17", "#E3C27A"],
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
