import { NextResponse } from "next/server";
import type { KolkataPost } from "@/lib/models/post";
import { getDatabase } from "@/lib/mongodb";

export async function GET(
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

    const post = await postsCol.findOne({
      $or: [{ id }, { _id: id as any }],
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Error retrieving post:", error);
    return NextResponse.json(
      { error: "Could not retrieve the post." },
      { status: 500 },
    );
  }
}
