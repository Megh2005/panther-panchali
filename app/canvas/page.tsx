import type { Metadata } from "next";
import CreatePostStudio from "@/components/create-post-studio";

export const metadata: Metadata = {
  title: "Create Post — Pather Panchali",
  description:
    "Upload your photo, set the landmark, festival, and vibe to publish to the Kolkata Feed.",
};

export default function CanvasPage() {
  return (
    <main className="min-h-screen bg-paper-bg text-paper-text pt-12 pb-28 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center mb-6">
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Facebook of Kolkata · Post Studio
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
          className="mt-2 text-base sm:text-lg italic text-paper-muted max-w-xl"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          Upload your photo, choose a landmark, span of the year, and vibe.
          Your post will be revamping with authentic atmospheric color palettes
          and poetic captions.
        </p>
      </div>

      <CreatePostStudio />
    </main>
  );
}
