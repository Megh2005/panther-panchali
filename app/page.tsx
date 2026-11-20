import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#F6F1E6] text-[#1B1A17] px-6 py-12 overflow-hidden text-center">
      {/* Warm ambient background glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[70vw] max-h-[700px] w-[70vw] max-w-[880px] rounded-full bg-radial from-[#E3C27A]/25 via-[#E3C27A]/5 to-transparent blur-3xl opacity-75"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto my-auto">
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Panther Panchali
        </span>

        <h1
          id="page-title"
          className="mt-4 text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-normal leading-[1.02] text-[#1B1A17]"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontVariationSettings: '"opsz" 144, "SOFT" 85, "WONK" 1',
          }}
        >
          The Living Canvas
        </h1>

        <p
          className="mt-6 max-w-xl text-lg sm:text-xl md:text-2xl italic text-[#6B6458] leading-relaxed"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          For those who have never seen the city, feel Kolkata through a story
          that moves like memory.
        </p>

        <div className="mt-10">
          <Link
            href="/auth"
            className="inline-flex items-center justify-center rounded-full bg-[#B5532F] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition-all duration-300 hover:bg-[#1B1A17] hover:scale-105 cursor-pointer"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            Begin your journey
          </Link>
        </div>
      </div>
    </main>
  );
}
