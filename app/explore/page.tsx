"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  LuCalendar,
  LuClock,
  LuHeart,
  LuImagePlus,
  LuLoaderCircle,
  LuMapPin,
  LuShare2,
  LuSparkles,
  LuUser,
} from "react-icons/lu";
import OpenStreetMapModal from "@/components/open-street-map-modal";
import type { KolkataPost } from "@/lib/models/post";

export default function ExploreFeedPage() {
  const [posts, setPosts] = useState<KolkataPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Active Map Modal Target
  const [activeMapPost, setActiveMapPost] = useState<KolkataPost | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleShare = async (post: KolkataPost) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${post.placeName} — Facebook of Kolkata`,
          text: post.caption,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(
        `${post.caption}\n\n📍 ${post.placeName}\n${window.location.href}`,
      );
      alert("Post link copied to clipboard!");
    }
  };

  return (
    <main className="min-h-screen bg-paper-bg text-paper-text pt-10 pb-28 px-4">
      {/* Feed Header */}
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center mb-8">
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Community Feed · Facebook of Kolkata
        </span>
        <h1
          className="mt-2 text-3xl sm:text-5xl font-light tracking-normal text-paper-text"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
          }}
        >
          Kolkata Chronicle
        </h1>
        <p
          className="mt-2 text-base italic text-paper-muted max-w-lg"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          Every corner of the city, captured and revamping through living memories,
          festivals, and heritage atmospheres.
        </p>

        {/* Quick Create Post Bar */}
        <div className="mt-6 w-full rounded-2xl border border-paper-muted/20 bg-paper-card p-4 shadow-sm flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-bg border border-terracotta/30 text-terracotta">
              <LuImagePlus size={18} />
            </div>
            <span
              className="text-sm italic text-paper-muted"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Have a moment in Kolkata? Share your story...
            </span>
          </div>

          <Link
            href="/canvas"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-terracotta px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-xs hover:bg-paper-text transition-colors"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <span>Create Post</span>
          </Link>
        </div>
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-3">
          <LuLoaderCircle size={28} className="animate-spin text-terracotta" />
          <p
            className="text-sm italic text-paper-muted"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Gathering stories from the city…
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-12 max-w-md mx-auto rounded-2xl border border-paper-muted/20 bg-paper-card p-8 text-center shadow-sm">
          <LuMapPin size={32} className="mx-auto text-terracotta" />
          <h2
            className="mt-3 text-2xl font-light text-paper-text"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            No Posts in the Feed Yet
          </h2>
          <p
            className="mt-1.5 text-sm italic text-paper-muted"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Be the first to upload a photo and publish a moment of Kolkata.
          </p>
          <Link
            href="/canvas"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-paper-text transition-colors"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <span>Create First Post</span>
          </Link>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          {posts.map((post) => {
            const isLiked = likedPosts[post.id];
            const displayLikes = (post.likesCount || 0) + (isLiked ? 1 : 0);

            return (
              <article
                key={post.id}
                className="overflow-hidden rounded-3xl border border-paper-muted/20 bg-paper-card shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Post Header: User info, timestamp, tagged place */}
                <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper-bg border border-terracotta/40 overflow-hidden shadow-xs">
                      {post.userAvatar ? (
                        <Image
                          src={post.userAvatar}
                          alt={post.userName}
                          width={44}
                          height={44}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <LuUser size={20} className="text-terracotta" />
                      )}
                    </div>
                    <div>
                      <h3
                        className="text-base font-medium text-paper-text leading-tight"
                        style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                      >
                        {post.userName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-paper-muted">
                        <span>
                          {new Date(post.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span>·</span>
                        <span className="text-terracotta font-medium">
                          {post.vibe}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges: Festival & Time */}
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-paper-muted/20 bg-paper-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-terracotta">
                      <LuCalendar size={11} />
                      <span>{post.yearSpan}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-paper-muted/20 bg-paper-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-muted">
                      <LuClock size={11} />
                      <span>{post.timeOfDay}</span>
                    </span>
                  </div>
                </div>

                {/* Tagged Location Bar */}
                <div className="px-5 sm:px-6 pb-3 flex items-center justify-between text-xs text-paper-muted">
                  <div className="flex items-center gap-1.5 font-medium">
                    <LuMapPin size={14} className="text-terracotta shrink-0" />
                    <span className="text-paper-text">{post.placeName}</span>
                  </div>

                  {/* OpenStreetMap Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setActiveMapPost(post)}
                    className="inline-flex items-center gap-1 rounded-full border border-paper-muted/30 bg-paper-bg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-terracotta hover:bg-terracotta hover:text-white transition-all cursor-pointer"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <LuMapPin size={12} />
                    <span>View on Map</span>
                  </button>
                </div>

                {/* Revamped Image */}
                <div className="relative w-full aspect-video sm:aspect-16/10 bg-paper-bg overflow-hidden border-y border-paper-muted/15">
                  <Image
                    src={post.revampedImageUrl || post.originalImageUrl}
                    alt={post.placeName}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                  />
                </div>

                {/* Cloudinary AI Extracted Color Palette */}
                {Array.isArray(post.extractedColors) &&
                  post.extractedColors.length > 0 && (
                    <div className="px-5 sm:px-6 py-2.5 bg-paper-bg/60 border-b border-paper-muted/15 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-paper-muted">
                        <LuSparkles size={13} className="text-terracotta" />
                        <span
                          className="font-semibold uppercase tracking-[0.16em] text-[10px]"
                          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                        >
                          Atmospheric Palette:
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {post.extractedColors.map((color) => (
                          <div
                            key={color}
                            className="group relative flex items-center justify-center"
                          >
                            <div
                              className="h-5 w-5 rounded-full border border-paper-text/15 shadow-2xs hover:scale-125 transition-transform cursor-pointer"
                              style={{ backgroundColor: color }}
                            />
                            <span className="pointer-events-none absolute -bottom-6 rounded-md bg-paper-text px-1.5 py-0.5 text-[9px] font-mono text-paper-bg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {color}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Post Body: Plain text caption & Hashtags */}
                <div className="p-5 sm:p-6 pt-4">
                  <p
                    className="text-base sm:text-lg italic text-paper-text leading-relaxed whitespace-pre-line"
                    style={{ fontFamily: "var(--font-newsreader), serif" }}
                  >
                    {post.caption}
                  </p>

                  {/* Hashtags */}
                  {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium text-terracotta hover:underline cursor-pointer"
                          style={{
                            fontFamily: "var(--font-instrument), sans-serif",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Interaction Bar */}
                  <div className="mt-5 pt-4 border-t border-paper-muted/15 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all cursor-pointer ${
                        isLiked
                          ? "bg-terracotta/15 text-terracotta border border-terracotta/40"
                          : "text-paper-muted hover:text-terracotta hover:bg-paper-bg"
                      }`}
                      style={{
                        fontFamily: "var(--font-instrument), sans-serif",
                      }}
                    >
                      <LuHeart
                        size={15}
                        className={isLiked ? "fill-terracotta" : ""}
                      />
                      <span>{displayLikes} Likes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShare(post)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs text-paper-muted hover:text-paper-text hover:bg-paper-bg transition-colors cursor-pointer"
                      style={{
                        fontFamily: "var(--font-instrument), sans-serif",
                      }}
                    >
                      <LuShare2 size={14} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* OpenStreetMap Modal */}
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
