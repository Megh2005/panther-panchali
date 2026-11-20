import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { KOLKATA_PLACES } from "@/lib/constants/kolkata-places";
import type { KolkataPost } from "@/lib/models/post";
import { getDatabase } from "@/lib/mongodb";

const SEED_POSTS: KolkataPost[] = [
  {
    id: "seed-kumartuli-1",
    userId: "curator@patherpanchali.in",
    userEmail: "curator@patherpanchali.in",
    userName: "Ananya Mukherjee",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    originalImageUrl: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1000&q=80",
    revampedImageUrl: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1000&q=80",
    placeId: "kumartuli",
    placeName: "Kumartuli Clay Artisans Quarter",
    placeCoords: { lat: 22.5997, lng: 88.3662 },
    timeOfDay: "Twilight",
    yearSpan: "Pooja",
    vibe: "Aesthetic",
    caption: "The earthen fragrance of fresh river silt mingling with raw straw armatures in the narrow lanes of Kumartuli. Every sculptor ties centuries of devotion into the eyes of the mother, as twilight bells begin to echo from the ghats.",
    hashtags: ["#Kolkata", "#KumartuliDiaries", "#DurgaPujaMagic", "#CityOfJoy", "#CalcuttaAesthetic"],
    extractedColors: ["#B5532F", "#EDE4D3", "#1B1A17", "#E3C27A", "#6B6458"],
    likesCount: 42,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: "seed-college-street-2",
    userId: "heritage@patherpanchali.in",
    userEmail: "heritage@patherpanchali.in",
    userName: "Debashis Sen",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    originalImageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80",
    revampedImageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80",
    placeId: "college-street",
    placeName: "College Street (Boi Para & Coffee House)",
    placeCoords: { lat: 22.5744, lng: 88.3629 },
    timeOfDay: "Afternoon",
    yearSpan: "Winter Season",
    vibe: "Happy",
    caption: "Sunlight slanting across towers of vintage poetry and yellowed history treatises. A warm cup of infusion on the first-floor balcony while spirited voices debate politics and literature below.",
    hashtags: ["#CollegeStreet", "#BoiPara", "#CoffeeHouseKolkata", "#WinterInCalcutta", "#KolkataGram"],
    extractedColors: ["#6B6458", "#EDE4D3", "#B5532F", "#1B1A17", "#E3C27A"],
    likesCount: 38,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: "seed-prinsep-ghat-3",
    userId: "wanderer@patherpanchali.in",
    userEmail: "wanderer@patherpanchali.in",
    userName: "Rhea Banerjee",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    originalImageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    revampedImageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
    placeId: "prinsep-ghat",
    placeName: "Prinsep Ghat & Strand Road Promenade",
    placeCoords: { lat: 22.5558, lng: 88.3327 },
    timeOfDay: "Evening",
    yearSpan: "Deepavali",
    vibe: "Dazzling",
    caption: "The Hooghly carrying shimmering golden lamp reflections past the Gothic colonnade of Prinsep Ghat. A gentle river breeze while Vidyasagar Setu glitters like a necklace in the night sky.",
    hashtags: ["#PrinsepGhat", "#HooghlyRiver", "#DeepavaliNight", "#KolkataDiaries", "#CityOfJoy"],
    extractedColors: ["#E3C27A", "#1B1A17", "#B5532F", "#EDE4D3", "#6B6458"],
    likesCount: 65,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
  },
];

export async function GET() {
  try {
    const db = await getDatabase();
    const postsCol = db.collection<KolkataPost>("kolkata_posts");

    const posts = await postsCol
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    if (posts.length === 0) {
      // Return curated seed posts so the feed is lively
      return NextResponse.json({ success: true, posts: SEED_POSTS });
    }

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("Error fetching Kolkata posts:", error);
    return NextResponse.json(
      { error: "Could not retrieve the Kolkata feed." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to publish a post." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      originalImageUrl,
      revampedImageUrl,
      placeId,
      timeOfDay,
      yearSpan,
      vibe,
      caption,
      hashtags,
      extractedColors,
    } = body as Partial<KolkataPost>;

    if (!revampedImageUrl || !placeId || !caption) {
      return NextResponse.json(
        { error: "revampedImageUrl, placeId, and caption are required." },
        { status: 400 },
      );
    }

    const place = KOLKATA_PLACES.find((p) => p.id === placeId) || KOLKATA_PLACES[0];

    const postDoc: KolkataPost = {
      id: randomUUID(),
      userId: user.id || user.email,
      userEmail: user.email,
      userName: user.name || "Kolkata Explorer",
      userAvatar: user.image || undefined,
      originalImageUrl: originalImageUrl || revampedImageUrl,
      revampedImageUrl,
      placeId: place.id,
      placeName: place.name,
      placeCoords: {
        lat: place.lat,
        lng: place.lng,
      },
      timeOfDay: timeOfDay || "Twilight",
      yearSpan: yearSpan || "Pooja",
      vibe: vibe || "Aesthetic",
      caption: caption.trim(),
      hashtags: Array.isArray(hashtags)
        ? hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`))
        : [],
      extractedColors: Array.isArray(extractedColors) && extractedColors.length > 0
        ? extractedColors
        : ["#B5532F", "#EDE4D3", "#1B1A17", "#E3C27A"],
      likesCount: 0,
      createdAt: new Date(),
    };

    const db = await getDatabase();
    await db.collection<KolkataPost>("kolkata_posts").insertOne(postDoc);

    return NextResponse.json({ success: true, post: postDoc });
  } catch (error) {
    console.error("Error publishing Kolkata post:", error);
    return NextResponse.json(
      { error: "Could not publish your post." },
      { status: 500 },
    );
  }
}
