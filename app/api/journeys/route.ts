import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { ExploredPlace } from "@/lib/models/guide";
import { getDatabase } from "@/lib/mongodb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const db = await getDatabase();
    const collection = db.collection<ExploredPlace>("explored_places");

    // Public shared route: anyone with the shared ID can view landmark details
    if (id) {
      const place = await collection.findOne({ id });

      if (!place) {
        return NextResponse.json({ error: "Place not found." }, { status: 404 });
      }

      return NextResponse.json({ success: true, place });
    }

    // Listing personal gallery requires authentication
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to view your journey gallery." },
        { status: 401 },
      );
    }

    const userKey = user.email || user.id;

    const places = await collection
      .find({
        $or: [{ userEmail: userKey }, { userId: userKey }],
      })
      .sort({ exploredAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, places });
  } catch (error) {
    console.error("Error retrieving user journey:", error);
    return NextResponse.json(
      { error: "Failed to load explored places." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to save places to your journey." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      placeName,
      district,
      state,
      detailedAddress,
      coordinates,
      imageUrl,
      plainTextSummary,
      scenicBeauty,
      historicalSignificance,
      predictedMood,
      extractedColors,
    } = body as Partial<ExploredPlace>;

    if (!placeName || !district || !coordinates) {
      return NextResponse.json(
        { error: "Place name, district, and coordinates are required." },
        { status: 400 },
      );
    }

    const newExploredPlace: ExploredPlace = {
      id: randomUUID(),
      userId: user.id || user.email,
      userEmail: user.email,
      placeName: placeName.trim(),
      district: district.trim(),
      state: state?.trim() || "West Bengal",
      detailedAddress: detailedAddress?.trim() || "",
      coordinates: {
        lat: coordinates.lat,
        lng: coordinates.lng,
      },
      imageUrl: imageUrl || "",
      plainTextSummary: plainTextSummary?.trim() || "",
      scenicBeauty: scenicBeauty?.trim(),
      historicalSignificance: historicalSignificance?.trim(),
      predictedMood: predictedMood || undefined,
      extractedColors: Array.isArray(extractedColors) ? extractedColors : [],
      exploredAt: new Date(),
    };

    const db = await getDatabase();
    const collection = db.collection<ExploredPlace>("explored_places");
    await collection.insertOne(newExploredPlace);

    return NextResponse.json({ success: true, place: newExploredPlace });
  } catch (error) {
    console.error("Error saving explored place to journey:", error);
    return NextResponse.json(
      { error: "Failed to save place to your journey." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Place ID is required." }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection<ExploredPlace>("explored_places");

    const userKey = user.email || user.id;
    await collection.deleteOne({
      id,
      $or: [{ userEmail: userKey }, { userId: userKey }],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing explored place:", error);
    return NextResponse.json(
      { error: "Failed to remove place from your journey." },
      { status: 500 },
    );
  }
}
