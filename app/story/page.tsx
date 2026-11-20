import type { Metadata } from "next";
import LivingCanvasExperience from "@/components/living-canvas";

export const metadata: Metadata = {
  title: "Begin a Story — Pather Panchali",
  description: "Compose dynamic first-person micro-stories across Kolkata.",
};

export default function StoryPage() {
  return (
    <main className="min-h-screen bg-[#F6F1E6] text-[#1B1A17] pt-12 pb-28 px-4">
      <div className="max-w-[80vw] mx-auto flex flex-col items-center text-center">
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Narrative Synthesis
        </span>
        <h1
          className="mt-3 text-4xl sm:text-6xl font-light tracking-normal text-[#1B1A17]"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
          }}
        >
          Begin a Story
        </h1>
        <p
          className="mt-3 text-lg italic text-[#6B6458] max-w-[540px]"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          Every journey begins with a choice of feeling. The sensory engine
          crafts first-person literary prose and 35mm atmospheric imagery.
        </p>
      </div>

      <div className="mt-8">
        <LivingCanvasExperience />
      </div>
    </main>
  );
}
