"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LuFileText, LuGitFork, LuLoaderCircle, LuRoute } from "react-icons/lu";
import type { JourneyThread } from "@/lib/models/journey";

export default function JourneysPage() {
  const [threads, setThreads] = useState<JourneyThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [forkingId, setForkingId] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/threads");
      const data = await res.json();
      if (data.threads) {
        setThreads(data.threads);
      }
    } catch (err) {
      console.error("Failed to load threads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchThreads();
  }, [fetchThreads]);

  const handleFork = async (threadId: string) => {
    setForkingId(threadId);
    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forkThreadId: threadId,
          reviewerName: "Explorer",
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchThreads();
      }
    } catch (err) {
      console.error("Forking failed:", err);
    } finally {
      setForkingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F1E6] text-[#1B1A17] pt-12 pb-28 px-4">
      <div className="max-w-[80vw] mx-auto flex flex-col items-center text-center">
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Archived Journey Threads
        </span>
        <h1
          className="mt-3 text-4xl sm:text-6xl font-light tracking-normal text-[#1B1A17]"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
          }}
        >
          My Journeys
        </h1>
        <p
          className="mt-3 text-lg italic text-[#6B6458] max-w-[560px]"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          Every chapter, sensory impression, and transformed scene is preserved
          in your chronicle. Fork another path to explore alternative narrative
          branches.
        </p>

        {loading ? (
          <div className="mt-16 flex flex-col items-center gap-3">
            <LuLoaderCircle size={24} className="animate-spin text-[#B5532F]" />
            <p
              className="text-sm italic text-[#6B6458]"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Retrieving your journeys…
            </p>
          </div>
        ) : threads.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-[#6B6458]/20 bg-[#EDE4D3] p-10 max-w-[480px]">
            <LuRoute size={32} className="mx-auto text-[#B5532F]" />
            <h2
              className="mt-4 text-2xl font-light text-[#1B1A17]"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              No Journeys Recorded Yet
            </h2>
            <p
              className="mt-2 text-sm italic text-[#6B6458]"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Calibrate the step-by-step compass to create your first Kolkata
              chapter.
            </p>
            <Link
              href="/canvas"
              className="mt-6 inline-flex rounded-full bg-[#B5532F] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#FFFFFF] shadow-sm transition-all hover:bg-[#1B1A17]"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Start First Journey
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid w-full max-w-[860px] grid-cols-1 gap-5 text-left">
            {threads.map((thread) => (
              <article
                key={thread.id}
                className="rounded-2xl border border-[#6B6458]/20 bg-[#EDE4D3] p-6 sm:p-8 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#6B6458]/15 pb-4">
                  <div>
                    <span
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
                      style={{
                        fontFamily: "var(--font-instrument), sans-serif",
                      }}
                    >
                      Thread · {thread.id}
                    </span>
                    <h2
                      className="mt-1 text-2xl font-light text-[#1B1A17]"
                      style={{ fontFamily: "var(--font-fraunces), serif" }}
                    >
                      {thread.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/thread/${thread.id}/export`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#6B6458]/25 bg-[#F6F1E6] px-3.5 py-1.5 text-xs text-[#1B1A17] hover:border-[#B5532F] transition-colors"
                      style={{
                        fontFamily: "var(--font-instrument), sans-serif",
                      }}
                    >
                      <LuFileText size={14} className="text-[#B5532F]" />
                      <span>PDF Storybook</span>
                    </a>

                    <button
                      type="button"
                      disabled={forkingId === thread.id}
                      onClick={() => handleFork(thread.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#6B6458]/25 bg-[#F6F1E6] px-3.5 py-1.5 text-xs text-[#1B1A17] hover:border-[#B5532F] disabled:opacity-50 transition-colors cursor-pointer"
                      style={{
                        fontFamily: "var(--font-instrument), sans-serif",
                      }}
                    >
                      <LuGitFork size={14} className="text-[#B5532F]" />
                      <span>
                        {forkingId === thread.id
                          ? "Forking…"
                          : `Fork (${thread.forkCount || 0})`}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Chapters Snippet */}
                <div className="mt-4 space-y-3">
                  <p
                    className="text-sm italic text-[#6B6458]"
                    style={{ fontFamily: "var(--font-newsreader), serif" }}
                  >
                    Recorded by {thread.userName || "Explorer"} on{" "}
                    {new Date(thread.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    · {thread.chapters?.length || 0} chapter(s)
                  </p>

                  {thread.chapters?.[0]?.currentImageUrl && (
                    <div className="overflow-hidden rounded-xl border border-[#6B6458]/18">
                      <Image
                        src={thread.chapters[0].currentImageUrl}
                        alt={thread.title}
                        width={860}
                        height={176}
                        className="w-full h-44 object-cover"
                      />
                    </div>
                  )}

                  <p
                    className="text-sm italic text-[#1B1A17] line-clamp-3"
                    style={{ fontFamily: "var(--font-newsreader), serif" }}
                  >
                    {thread.chapters?.[0]?.storyProse}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
