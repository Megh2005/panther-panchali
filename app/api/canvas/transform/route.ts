import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { JourneyThread } from "@/lib/models/journey";
import { getDatabase } from "@/lib/mongodb";
import { buildCloudinaryTransformationUrl } from "@/lib/services/cloudinary";
import { isTransformationType } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { threadId, chapterId, transformationType, prompt } = body as Record<
      string,
      unknown
    >;

    if (
      typeof threadId !== "string" ||
      typeof chapterId !== "string" ||
      !isTransformationType(transformationType) ||
      (prompt !== undefined &&
        (typeof prompt !== "string" || prompt.length > 500))
    ) {
      return NextResponse.json(
        { error: "threadId, chapterId, and transformationType are required." },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const threadsCol = db.collection<JourneyThread>("journey_threads");

    const thread = await threadsCol.findOne({
      id: threadId,
      userId: user.email,
    });
    if (!thread) {
      return NextResponse.json(
        { error: "Journey thread not found." },
        { status: 404 },
      );
    }

    const chapterIndex = thread.chapters.findIndex(
      (chapter) => chapter.chapterId === chapterId,
    );
    if (chapterIndex === -1) {
      return NextResponse.json(
        { error: "Chapter not found in thread." },
        { status: 404 },
      );
    }

    const currentChapter = thread.chapters[chapterIndex];
    const sourceUrl = currentChapter.originalImageUrl;

    // Apply Cloudinary generative fill, generative replace, or atmospheric overlay
    const transformedUrl = buildCloudinaryTransformationUrl(
      sourceUrl,
      transformationType,
      prompt,
    );

    const newAction = {
      type: transformationType,
      prompt: typeof prompt === "string" ? prompt : undefined,
      appliedAt: new Date(),
      resultUrl: transformedUrl,
    };

    // Update in MongoDB
    await threadsCol.updateOne(
      { id: threadId, "chapters.chapterId": chapterId },
      {
        $set: {
          "chapters.$.currentImageUrl": transformedUrl,
          updatedAt: new Date(),
        },
        $push: {
          "chapters.$.transformations": newAction,
        },
      },
    );

    return NextResponse.json({
      success: true,
      transformedUrl,
      action: newAction,
    });
  } catch (error) {
    console.error("Canvas transformation route error:", error);
    return NextResponse.json(
      { error: "Failed to apply transformation. Please try again." },
      { status: 500 },
    );
  }
}
