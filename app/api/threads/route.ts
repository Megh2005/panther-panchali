import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { JourneyThread } from "@/lib/models/journey";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const db = await getDatabase();
    const threadsCol = db.collection<JourneyThread>("journey_threads");

    const threads = await threadsCol
      .find({ userId: user.email })
      .project({
        chapters: { $slice: 1 },
      })
      .sort({ createdAt: -1 })
      .limit(25)
      .toArray();

    return NextResponse.json({ success: true, threads });
  } catch (error) {
    console.error("Fetch threads error:", error);
    return NextResponse.json(
      { error: "Could not retrieve journeys at this time." },
      { status: 500 },
    );
  }
}

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
    const { forkThreadId } = body as { forkThreadId?: unknown };

    if (
      typeof forkThreadId !== "string" ||
      forkThreadId.length === 0 ||
      forkThreadId.length > 100
    ) {
      return NextResponse.json(
        { error: "forkThreadId is required." },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const threadsCol = db.collection<JourneyThread>("journey_threads");

    const sourceThread = await threadsCol.findOne({
      id: forkThreadId,
      userId: user.email,
    });
    if (!sourceThread) {
      return NextResponse.json(
        { error: "Source thread not found." },
        { status: 404 },
      );
    }

    // Increment fork count on parent
    await threadsCol.updateOne(
      { id: forkThreadId },
      { $inc: { forkCount: 1 } },
    );

    // Create forked thread
    const newThreadId = `thread_fork_${randomUUID()}`;
    const forkedThread: JourneyThread = {
      id: newThreadId,
      userId: user.email,
      userEmail: user.email,
      userName: user.name,
      title: `${sourceThread.title} (Forked Branch)`,
      forkedFromThreadId: forkThreadId,
      forkCount: 0,
      chapters: [...sourceThread.chapters],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await threadsCol.insertOne(forkedThread);

    return NextResponse.json({ success: true, thread: forkedThread });
  } catch (error) {
    console.error("Fork thread error:", error);
    return NextResponse.json(
      { error: "Failed to fork journey thread." },
      { status: 500 },
    );
  }
}
