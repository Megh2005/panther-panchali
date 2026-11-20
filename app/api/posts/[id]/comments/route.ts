import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { KolkataPost, PostComment } from "@/lib/models/post";
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

    return NextResponse.json({
      success: true,
      comments: post.comments || [],
    });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    return NextResponse.json(
      { error: "Could not retrieve comments." },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to post a comment." },
        { status: 401 },
      );
    }

    const { id } = await props.params;
    if (!id) {
      return NextResponse.json({ error: "Post ID is required." }, { status: 400 });
    }

    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return NextResponse.json(
        { error: "Comment text cannot be empty." },
        { status: 400 },
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: "Comment must be 500 characters or fewer." },
        { status: 400 },
      );
    }

    const commentDoc: PostComment = {
      id: randomUUID(),
      userId: user.id || user.email,
      userEmail: user.email,
      userName: user.name || "Kolkata Citizen",
      userAvatar: user.image || undefined,
      text,
      createdAt: new Date(),
    };

    const db = await getDatabase();
    const postsCol = db.collection<KolkataPost>("kolkata_posts");

    const result = await postsCol.updateOne(
      { $or: [{ id }, { _id: id as any }] },
      {
        $push: {
          comments: commentDoc,
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      comment: commentDoc,
    });
  } catch (error) {
    console.error("Error adding comment to post:", error);
    return NextResponse.json(
      { error: "Could not add comment." },
      { status: 500 },
    );
  }
}
