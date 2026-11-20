import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LuCompass } from "react-icons/lu";

export const metadata: Metadata = {
  title: "Explore the City — Pather Panchali",
  description:
    "Sensory cartography of Kolkata's cultural landmarks and historic quarters.",
};

const LANDMARKS = [
  {
    name: "Kumartuli Clay Sculptors",
    tagline: "Where river mud is transformed into sacred idols",
    desc: "A labyrinth of narrow workshops along the Hooghly where generational sculptors tie straw armatures and smooth alluvial clay into the faces of Durga.",
    imageUrl:
      "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80",
    curiosity: "Kumartuli Clay Sculptors",
  },
  {
    name: "College Street Bookstalls",
    tagline: "The largest second-hand book market in the world",
    desc: "Wooden stalls stacked ten feet high with rare first editions, poetry pamphlets, and university treatises, steeped in the aroma of slow roasted filter coffee.",
    imageUrl:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
    curiosity: "College Street Old Bookstalls",
  },
  {
    name: "Bagbazar Ghat Ferry Bells",
    tagline: "Life perched upon the wet stone steps of the Hooghly",
    desc: "The wooden ferries rock against heavy iron moorings as morning bathers, morning bells, and distant siren horns greet the waking river.",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    curiosity: "Bagbazar Ghat Ferry Bells",
  },
  {
    name: "Midnight Adda at Shyambazar",
    tagline: "Where the tea kettle is never extinguished",
    desc: "Under yellow sodium lights, clay cups are smashed onto wet cobblestone as students, poets, and tram conductors debate politics into the dawn.",
    imageUrl:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    curiosity: "Midnight Chai at Shyambazar",
  },
];

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#F6F1E6] text-[#1B1A17] pt-12 pb-28 px-4">
      <div className="max-w-[80vw] mx-auto flex flex-col items-center text-center">
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Cultural Cartography
        </span>
        <h1
          className="mt-3 text-4xl sm:text-6xl font-light tracking-normal text-[#1B1A17]"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
          }}
        >
          Explore Kolkata
        </h1>
        <p
          className="mt-3 text-lg italic text-[#6B6458] max-w-[560px]"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          Inspect the focal landmarks of the city. Every site can be dynamically
          summoned into a first-person branching micro-story.
        </p>

        <div className="mt-12 grid w-full max-w-[860px] grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          {LANDMARKS.map((item) => (
            <article
              key={item.name}
              className="rounded-2xl border border-[#6B6458]/20 bg-[#EDE4D3] overflow-hidden flex flex-col justify-between shadow-sm transition-all hover:shadow-md"
            >
              <div className="overflow-hidden aspect-[16/10] bg-[#F6F1E6]">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={800}
                  height={500}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <h2
                    className="text-2xl font-light text-[#1B1A17]"
                    style={{ fontFamily: "var(--font-fraunces), serif" }}
                  >
                    {item.name}
                  </h2>
                  <p
                    className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[#B5532F]"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    {item.tagline}
                  </p>
                  <p
                    className="mt-3 text-sm italic text-[#6B6458] leading-relaxed"
                    style={{ fontFamily: "var(--font-newsreader), serif" }}
                  >
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#6B6458]/15 flex items-center justify-between">
                  <span
                    className="text-xs text-[#6B6458]"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    Focal Perspective
                  </span>
                  <Link
                    href={`/canvas`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#6B6458]/25 bg-[#F6F1E6] px-3.5 py-1.5 text-xs text-[#1B1A17] hover:border-[#B5532F] transition-colors"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <LuCompass size={14} className="text-[#B5532F]" />
                    <span>Experience Scene</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
