import type { Metadata } from "next";
import LivingCanvasExperience from "@/components/living-canvas";
import ProductTour from "@/components/product-tour";

export const metadata: Metadata = {
  title: "The Living Canvas — Pather Panchali",
  description:
    "Explore and co-create the sensory soul of Kolkata through interactive storytelling.",
};

export default function CanvasPage() {
  return (
    <main className="min-h-screen bg-[#F6F1E6] text-[#1B1A17] pt-12 pb-28 px-4">
      <div
        id="tour-canvas-heading"
        className="max-w-[80vw] mx-auto flex flex-col items-center text-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            Sensory Co-Creation
          </span>
          <ProductTour />
        </div>

        <h1
          className="mt-3 text-4xl sm:text-6xl font-light tracking-normal text-[#1B1A17]"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
          }}
        >
          The Living Canvas
        </h1>
        <p
          className="mt-3 text-lg italic text-[#6B6458] max-w-140"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          Follow the step-by-step compass below to calibrate your mood, time of
          day, and landmark.
        </p>
      </div>

      <div className="mt-8">
        <LivingCanvasExperience />
      </div>
    </main>
  );
}
