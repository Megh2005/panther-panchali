import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { JourneyThread } from "@/lib/models/journey";
import { getDatabase } from "@/lib/mongodb";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/threads/[id]">,
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  if (!id || id.length > 100) {
    return NextResponse.json({ error: "Invalid thread id." }, { status: 400 });
  }

  try {
    const db = await getDatabase();
    const thread = await db
      .collection<JourneyThread>("journey_threads")
      .findOne({ id, userId: user.email });

    if (!thread) {
      return NextResponse.json(
        { error: "Journey thread not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, thread });
  } catch (error) {
    console.error("Fetch thread error:", error);
    return NextResponse.json(
      { error: "Could not retrieve this journey at this time." },
      { status: 500 },
    );
  }
}
