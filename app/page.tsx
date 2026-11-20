import Link from "next/link";
import { LuCompass, LuImagePlus } from "react-icons/lu";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-paper-bg text-paper-text px-6 py-12 overflow-hidden text-center">
      {/* Warm ambient background glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[70vw] max-h-[700px] w-[70vw] max-w-[880px] rounded-full bg-radial from-[#E3C27A]/25 via-[#E3C27A]/5 to-transparent blur-3xl opacity-75"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto my-auto">
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Facebook of Kolkata · Pather Panchali
        </span>

        <h1
          id="page-title"
          className="mt-4 text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-normal leading-[1.02] text-paper-text"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontVariationSettings: '"opsz" 144, "SOFT" 85, "WONK" 1',
          }}
        >
          Kolkata Canvas
        </h1>

        <p
          className="mt-6 max-w-xl text-lg sm:text-xl md:text-2xl italic text-paper-muted leading-relaxed"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          The social chronicle of Kolkata. Upload your photo, set the heritage
          landmark, span of year, and vibe to transform your moment into the
          living spirit of the city.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full bg-terracotta px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition-all duration-300 hover:bg-paper-text hover:scale-105 cursor-pointer"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <LuCompass size={16} />
            <span>Explore Kolkata Feed</span>
          </Link>

          <Link
            href="/canvas"
            className="inline-flex items-center gap-2 rounded-full border border-paper-muted/30 bg-paper-card px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-paper-text transition-all duration-300 hover:border-terracotta hover:text-terracotta hover:scale-105 cursor-pointer"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <LuImagePlus size={16} />
            <span>Create Post</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
