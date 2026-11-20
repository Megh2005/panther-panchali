"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  LuCalendar,
  LuClock,
  LuImagePlus,
  LuLoaderCircle,
  LuMapPin,
  LuSparkles,
} from "react-icons/lu";
import OpenStreetMapModal from "@/components/open-street-map-modal";
import type { KolkataPost } from "@/lib/models/post";

export default function MyArchivePage() {
  const { data: session } = useSession();
  const [myPosts, setMyPosts] = useState<KolkataPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMapPost, setActiveMapPost] = useState<KolkataPost | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.posts) {
        const userEmail = session?.user?.email?.toLowerCase();
        // Show only the user's authentic posts
        const filtered = userEmail
          ? data.posts.filter(
              (p: KolkataPost) => p.userEmail?.toLowerCase() === userEmail,
            )
          : [];
        setMyPosts(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch user archive:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  return (
    <main className="relative min-h-screen bg-paper-bg text-paper-text pt-12 pb-28 px-4 overflow-hidden">
      {/* Warm ambient background glow consistent with Homepage */}
      <div
        className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 h-[60vw] max-h-[600px] w-[60vw] max-w-[800px] rounded-full bg-radial from-[#E3C27A]/20 via-[#E3C27A]/5 to-transparent blur-3xl opacity-75"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center mb-8">
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Personal Chronicle
        </span>
        <h1
          className="mt-2 text-3xl sm:text-5xl font-light tracking-normal text-paper-text"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
          }}
        >
          My Kolkata Archive
        </h1>
        <p
          className="mt-2 text-base italic text-paper-muted max-w-lg"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          All your synthesized memories, heritage landmarks, and sensory snapshots
          preserved across the seasons of the city.
        </p>

        <Link
          href="/canvas"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-xs hover:bg-paper-text hover:scale-105 transition-all duration-300"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          <LuImagePlus size={15} />
          <span>Create New Post</span>
        </Link>
      </div>

      {loading ? (
        <div className="relative z-10 mt-16 flex flex-col items-center justify-center gap-3">
          <LuLoaderCircle size={28} className="animate-spin text-terracotta" />
          <p
            className="text-sm italic text-paper-muted"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Loading your archive…
          </p>
        </div>
      ) : myPosts.length === 0 ? (
        <div className="relative z-10 mt-12 max-w-md mx-auto rounded-3xl border border-paper-muted/20 bg-paper-card p-8 text-center shadow-sm">
          <LuMapPin size={32} className="mx-auto text-terracotta" />
          <h2
            className="mt-3 text-2xl font-light text-paper-text"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
            }}
          >
            No Archive Posts Yet
          </h2>
          <p
            className="mt-1.5 text-sm italic text-paper-muted"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Synthesize a memory to craft your first Kolkata moment.
          </p>
          <Link
            href="/canvas"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-paper-text hover:scale-105 transition-all duration-300"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <span>Create Post</span>
          </Link>
        </div>
      ) : (
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col gap-6">
          {myPosts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl border border-paper-muted/20 bg-paper-card shadow-xs transition-shadow hover:shadow-sm p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-paper-muted/15">
                <div className="flex items-center gap-2">
                  <LuMapPin size={16} className="text-terracotta shrink-0" />
                  <span
                    className="text-base font-light text-paper-text"
                    style={{ fontFamily: "var(--font-fraunces), serif" }}
                  >
                    {post.placeName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-paper-bg px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-terracotta border border-paper-muted/20">
                    <LuCalendar size={10} />
                    <span>{post.yearSpan}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveMapPost(post)}
                    className="inline-flex items-center gap-1 rounded-full border border-paper-muted/25 bg-paper-bg px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-paper-text hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer"
                  >
                    <LuMapPin size={10} />
                    <span>Map</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-paper-bg border border-paper-muted/20">
                  <Image
                    src={post.revampedImageUrl || post.originalImageUrl}
                    alt={post.placeName}
                    fill
                    sizes="(max-width: 640px) 100vw, 250px"
                    className="object-cover"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col justify-between h-full">
                  <p
                    className="text-sm italic text-paper-text leading-relaxed line-clamp-4"
                    style={{ fontFamily: "var(--font-newsreader), serif" }}
                  >
                    {post.caption}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {post.hashtags?.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] text-terracotta font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Colors */}
                  {Array.isArray(post.extractedColors) && (
                    <div className="mt-3 pt-3 border-t border-paper-muted/15 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-paper-muted">
                        Palette:
                      </span>
                      <div className="flex items-center gap-1">
                        {post.extractedColors.slice(0, 5).map((c) => (
                          <div
                            key={c}
                            className="h-3.5 w-3.5 rounded-full border border-paper-text/20"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Map Modal */}
      {activeMapPost && (
        <OpenStreetMapModal
          isOpen={!!activeMapPost}
          onClose={() => setActiveMapPost(null)}
          placeName={activeMapPost.placeName}
          lat={activeMapPost.placeCoords?.lat || 22.5726}
          lng={activeMapPost.placeCoords?.lng || 88.3639}
        />
      )}
    </main>
  );
}
