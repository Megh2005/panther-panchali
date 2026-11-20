import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { JourneyThread } from "@/lib/models/journey";
import { getDatabase } from "@/lib/mongodb";
import { sendJourneyEmail } from "@/lib/services/mailer";
import { isValidEmail } from "@/lib/validation";

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
    const { threadId, recipientEmail } = body as Record<string, unknown>;

    if (
      typeof threadId !== "string" ||
      threadId.length > 100 ||
      !isValidEmail(recipientEmail)
    ) {
      return NextResponse.json(
        { error: "threadId and recipientEmail are required." },
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

    const firstChapter = thread.chapters[0];
    const storyExcerpt = firstChapter?.storyProse
      ? `${firstChapter.storyProse.slice(0, 180)}...`
      : "An odyssey through the memory of Kolkata.";

    await sendJourneyEmail({
      to: recipientEmail,
      subject: `Your Kolkata Journey: ${thread.title} — Pather Panchali`,
      threadTitle: thread.title,
      storyExcerpt,
      videoReelUrl: thread.videoReelUrl || firstChapter?.currentImageUrl,
    });

    return NextResponse.json({
      success: true,
      message: `Journey dispatched to ${recipientEmail}.`,
    });
  } catch (error) {
    console.error("Email export error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch email. Please try again later." },
      { status: 500 },
    );
  }
}
