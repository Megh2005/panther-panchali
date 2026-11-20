import type { Metadata } from "next";
import CreatePostStudio from "@/components/create-post-studio";

export const metadata: Metadata = {
  title: "Create Post — Panther Panchali",
  description:
    "Choose a landmark, season, and vibe to synthesize a memory and publish to the Kolkata Feed.",
};

export default function CanvasPage() {
  return (
    <main className="relative min-h-screen bg-paper-bg text-paper-text pt-12 pb-28 px-4 sm:px-6 overflow-hidden">
      {/* Warm ambient background glow consistent with Homepage */}
      <div
        className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 h-[60vw] max-h-150 w-[60vw] max-w-200 rounded-full bg-radial from-[#E3C27A]/20 via-[#E3C27A]/5 to-transparent blur-3xl opacity-75"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[92vw] lg:max-w-[70vw] mx-auto flex flex-col items-center text-center mb-6">
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Panther Panchali · Post Studio
        </span>

        <h1
          className="mt-2 text-3xl sm:text-5xl font-light tracking-normal text-paper-text"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
          }}
        >
          Create a Kolkata Post
        </h1>
        <p
          className="mt-2 text-base sm:text-lg italic text-paper-muted max-w-2xl leading-relaxed"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          Choose an iconic landmark, season, and atmospheric vibe. Your memory
          will be synthesized with authentic photography, color palettes,
          and poetic reflections.
        </p>
      </div>

      <CreatePostStudio />
    </main>
  );
}
