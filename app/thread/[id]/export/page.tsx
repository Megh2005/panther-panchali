"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { JourneyThread } from "@/lib/models/journey";
import { LuArrowLeft, LuLoaderCircle, LuPrinter } from "react-icons/lu";
import Link from "next/link";

function ThreadExportContent() {
  const params = useParams();
  const threadId = params?.id as string;
  const [thread, setThread] = useState<JourneyThread | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!threadId) return;

    fetch("/api/threads")
      .then((res) => res.json())
      .then((data) => {
        if (data.threads) {
          const found = data.threads.find(
            (t: JourneyThread) => t.id === threadId,
          );
          if (found) {
            setThread(found);
          }
        }
      })
      .catch((err) => console.error("Failed to load thread:", err))
      .finally(() => setLoading(false));
  }, [threadId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F1E6] flex items-center justify-center p-8 text-[#1B1A17]">
        <LuLoaderCircle size={28} className="animate-spin text-[#B5532F]" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-[#F6F1E6] flex flex-col items-center justify-center p-8 text-[#1B1A17]">
        <h1
          className="text-2xl font-light"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          Journey Not Found
        </h1>
        <Link
          href="/"
          className="mt-4 text-xs uppercase tracking-widest text-[#B5532F] underline"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Return to Canvas
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F1E6] text-[#1B1A17] p-6 sm:p-12 print:p-0 print:bg-white">
      {/* Top action bar - Hidden during print / export */}
      <div className="max-w-3xl mx-auto flex items-center justify-between pb-8 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#6B6458] hover:text-[#1B1A17] transition-colors"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          <LuArrowLeft size={16} />
          <span>Back to Living Canvas</span>
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] text-white bg-[#B5532F] hover:bg-[#1B1A17] shadow-sm transition-colors cursor-pointer"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          <LuPrinter size={15} />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Archival Storybook Document (Morning Paper styling) */}
      <article className="max-w-3xl mx-auto bg-[#EDE4D3] border border-[#6B6458]/20 rounded-2xl p-8 sm:p-14 shadow-md print:shadow-none print:border-none print:p-0 print:bg-transparent">
        {/* Header */}
        <header className="border-b border-[#6B6458]/20 pb-8 text-center">
          <span
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B5532F]"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            Pather Panchali: The Living Canvas
          </span>
          <h1
            className="mt-3 text-3xl sm:text-5xl font-light tracking-normal text-[#1B1A17]"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontVariationSettings: '"opsz" 48, "SOFT" 85, "WONK" 1',
            }}
          >
            {thread.title}
          </h1>
          <p
            className="mt-2 text-sm sm:text-base italic text-[#6B6458]"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            An archival journey curated for review · Recorded on{" "}
            {new Date(thread.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </header>

        {/* Chapters */}
        <div className="mt-8 space-y-12">
          {thread.chapters.map((chapter, idx) => (
            <section key={chapter.chapterId || idx} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#6B6458]/15 pb-2">
                <span
                  className="text-xs uppercase tracking-[0.2em] text-[#B5532F]"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  Chapter 0{idx + 1} · {chapter.location}
                </span>
                <span
                  className="text-xs italic text-[#6B6458]"
                  style={{ fontFamily: "var(--font-newsreader), serif" }}
                >
                  {chapter.timeOfDay} · {chapter.emotion}
                </span>
              </div>

              {/* Scene Artwork */}
              {chapter.currentImageUrl && (
                <div className="overflow-hidden rounded-xl border border-[#6B6458]/20 bg-[#F6F1E6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={chapter.currentImageUrl}
                    alt={chapter.location}
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}

              {/* Prose */}
              <div
                className="text-base sm:text-lg italic tracking-normal leading-relaxed text-[#1B1A17] whitespace-pre-line pt-2"
                style={{ fontFamily: "var(--font-newsreader), serif" }}
              >
                {chapter.storyProse}
              </div>

              {/* Transformation History Footnote */}
              {chapter.transformations && chapter.transformations.length > 0 && (
                <div
                  className="mt-3 text-xs text-[#6B6458]"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  <span className="font-semibold text-[#1B1A17]">
                    Atmospheric Shifts:{" "}
                  </span>
                  {chapter.transformations.map((t) => t.type).join(", ")}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Colophon Footer */}
        <footer
          className="mt-14 pt-8 border-t border-[#6B6458]/20 text-center text-xs uppercase tracking-[0.18em] text-[#6B6458]"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          <p>End of Journey Thread · Pather Panchali: The Living Canvas</p>
        </footer>
      </article>
    </div>
  );
}

export default function ThreadExportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F1E6] flex items-center justify-center p-8 text-[#1B1A17]">
          <LuLoaderCircle size={28} className="animate-spin text-[#B5532F]" />
        </div>
      }
    >
      <ThreadExportContent />
    </Suspense>
  );
}
