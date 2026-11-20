import { NextResponse } from "next/server";
import type { KolkataPost } from "@/lib/models/post";
import { getDatabase } from "@/lib/mongodb";

export async function POST(
  _req: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ error: "Post ID is required." }, { status: 400 });
    }

    const db = await getDatabase();
    const postsCol = db.collection<KolkataPost>("kolkata_posts");

    const result = await postsCol.findOneAndUpdate(
      { $or: [{ id }, { _id: id as any }] },
      { $inc: { sharesCount: 1 } },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const appBaseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const shareUrl = `${appBaseUrl}/explore?post=${result.id}`;

    return NextResponse.json({
      success: true,
      sharesCount: result.sharesCount || 1,
      shareUrl,
      post: result,
    });
  } catch (error) {
    console.error("Error sharing post:", error);
    return NextResponse.json(
      { error: "Could not record share." },
      { status: 500 },
    );
  }
}
