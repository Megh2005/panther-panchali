import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { Chapter, JourneyThread } from "@/lib/models/journey";
import { getDatabase } from "@/lib/mongodb";
import { generateMicroStory } from "@/lib/services/gemini";
import { generateStabilityArtwork } from "@/lib/services/stability";
import { isCulturalCuriosity, isEmotion, isTimeOfDay } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const body = (await req.json()) as Record<string, unknown>;
    const {
      emotion,
      timeOfDay,
      location,
      threadId,
      parentChapterId,
      previousSummary,
      branchPromptSeed,
    } = body;

    if (
      !isEmotion(emotion) ||
      !isTimeOfDay(timeOfDay) ||
      !isCulturalCuriosity(location)
    ) {
      return NextResponse.json(
        { error: "Emotion, timeOfDay, and location are required." },
        { status: 400 },
      );
    }

    if (
      (threadId !== undefined &&
        (typeof threadId !== "string" || threadId.length > 100)) ||
      (parentChapterId !== undefined &&
        (typeof parentChapterId !== "string" ||
          parentChapterId.length > 100)) ||
      (previousSummary !== undefined &&
        (typeof previousSummary !== "string" ||
          previousSummary.length > 2000)) ||
      (branchPromptSeed !== undefined &&
        (typeof branchPromptSeed !== "string" || branchPromptSeed.length > 500))
    ) {
      return NextResponse.json(
        { error: "Invalid story request." },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const threadsCol = db.collection<JourneyThread>("journey_threads");
    const existing = threadId
      ? await threadsCol.findOne({ id: threadId, userId: user.email })
      : null;

    if (threadId && !existing) {
      return NextResponse.json(
        { error: "Journey thread not found." },
        { status: 404 },
      );
    }

    // 1. Generate branching micro-story and visual prompt via Gemini
    const story = await generateMicroStory({
      emotion,
      timeOfDay,
      location,
      previousContext: [previousSummary, branchPromptSeed]
        .filter(Boolean)
        .join("\n"),
    });

    // 2. Generate atmospheric Kolkata visual artwork via Stability AI
    const art = await generateStabilityArtwork({
      prompt: story.visualPrompt,
      aspectRatio: "16:9",
    });

    // Stability artwork is already persisted to Cloudinary by the service.
    const chapterId = `ch_${randomUUID()}`;
    const newChapter: Chapter = {
      chapterIndex: 1,
      chapterId,
      parentChapterId,
      emotion,
      timeOfDay,
      location,
      storyProse: story.storyProse,
      visualPrompt: story.visualPrompt,
      originalImageUrl: art.imageUrl,
      currentImageUrl: art.imageUrl,
      transformations: [],
      branches: story.branches,
      createdAt: new Date(),
    };

    let thread: JourneyThread;

    if (threadId && existing) {
      newChapter.chapterIndex = existing.chapters.length + 1;
      const updatedAt = new Date();
      await threadsCol.updateOne(
        { id: threadId, userId: user.email },
        {
          $push: { chapters: newChapter },
          $set: { updatedAt },
        },
      );
      thread = {
        ...existing,
        chapters: [...existing.chapters, newChapter],
        updatedAt,
      };
    } else {
      const newThreadId = `thread_${randomUUID()}`;
      thread = {
        id: newThreadId,
        userId: user.email,
        userEmail: user.email,
        userName: user.name,
        title: story.title || `${location} at ${timeOfDay}`,
        forkCount: 0,
        chapters: [newChapter],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await threadsCol.insertOne(thread);
    }

    return NextResponse.json({
      success: true,
      thread,
      chapter: newChapter,
    });
  } catch (error) {
    console.error("Story generation route error:", error);
    return NextResponse.json(
      { error: "Failed to create chapter. Please try again." },
      { status: 500 },
    );
  }
}
