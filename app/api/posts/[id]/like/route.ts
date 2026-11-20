import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { KolkataPost } from "@/lib/models/post";
import { getDatabase } from "@/lib/mongodb";

export async function POST(
  _req: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to like a post." },
        { status: 401 },
      );
    }

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

    const userKey = user.email || user.id || "anonymous";
    const currentLikedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    const isAlreadyLiked = currentLikedBy.includes(userKey);

    let updatedLikesCount = post.likesCount || 0;
    let newLikedBy: string[];

    if (isAlreadyLiked) {
      newLikedBy = currentLikedBy.filter((k) => k !== userKey);
      updatedLikesCount = Math.max(0, updatedLikesCount - 1);
    } else {
      newLikedBy = [...currentLikedBy, userKey];
      updatedLikesCount += 1;
    }

    await postsCol.updateOne(
      { $or: [{ id }, { _id: id as any }] },
      {
        $set: {
          likedBy: newLikedBy,
          likesCount: updatedLikesCount,
        },
      },
    );

    return NextResponse.json({
      success: true,
      liked: !isAlreadyLiked,
      likesCount: updatedLikesCount,
    });
  } catch (error) {
    console.error("Error toggling like on post:", error);
    return NextResponse.json(
      { error: "Could not update like status." },
      { status: 500 },
    );
  }
}
