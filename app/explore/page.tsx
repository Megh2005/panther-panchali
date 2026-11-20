"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  LuCalendar,
  LuCheck,
  LuClock,
  LuHeart,
  LuImagePlus,
  LuLoaderCircle,
  LuMapPin,
  LuMessageSquare,
  LuSend,
  LuShare2,
  LuSparkles,
  LuUser,
} from "react-icons/lu";
import OpenStreetMapModal from "@/components/open-street-map-modal";
import type { KolkataPost, PostComment } from "@/lib/models/post";

export default function ExploreFeedPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<KolkataPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Interaction State
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({});
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({});

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Map Modal Target
  const [activeMapPost, setActiveMapPost] = useState<KolkataPost | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (Array.isArray(data.posts)) {
        setPosts(data.posts);

        // Pre-populate likes, counts, and shares
        const userEmail = session?.user?.email?.toLowerCase();
        const initialLikes: Record<string, boolean> = {};
        const initialCounts: Record<string, number> = {};
        const initialShares: Record<string, number> = {};

        for (const p of data.posts) {
          initialLikes[p.id] = userEmail && Array.isArray(p.likedBy)
            ? p.likedBy.some((k: string) => k.toLowerCase() === userEmail)
            : false;
          initialCounts[p.id] = p.likesCount || 0;
          initialShares[p.id] = p.sharesCount || 0;
        }

        setLikedPosts(initialLikes);
        setLikeCounts(initialCounts);
        setShareCounts(initialShares);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  // Deep-link auto-scroll on mount if ?post=id is provided
  useEffect(() => {
    if (typeof window === "undefined" || posts.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const targetPostId = params.get("post");
    if (targetPostId) {
      const el = document.getElementById(`post-${targetPostId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-[#B5532F]", "ring-offset-4");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-[#B5532F]", "ring-offset-4");
        }, 3000);
      }
    }
  }, [posts]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleLike = async (postId: string) => {
    const isCurrentlyLiked = likedPosts[postId] || false;
    const currentCount = likeCounts[postId] || 0;

    // Optimistic UI update
    setLikedPosts((prev) => ({ ...prev, [postId]: !isCurrentlyLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [postId]: isCurrentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
    }));

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback on failure
        setLikedPosts((prev) => ({ ...prev, [postId]: isCurrentlyLiked }));
        setLikeCounts((prev) => ({ ...prev, [postId]: currentCount }));
        if (data.error) showToast(data.error);
      } else {
        setLikedPosts((prev) => ({ ...prev, [postId]: data.liked }));
        setLikeCounts((prev) => ({ ...prev, [postId]: data.likesCount }));
      }
    } catch (error) {
      console.error("Like toggle error:", error);
      // Rollback
      setLikedPosts((prev) => ({ ...prev, [postId]: isCurrentlyLiked }));
      setLikeCounts((prev) => ({ ...prev, [postId]: currentCount }));
    }
  };

  const handleToggleComments = (postId: string) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setIsSubmittingComment((prev) => ({ ...prev, [postId]: true }));

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast(data.error || "Could not publish comment.");
        return;
      }

      // Add comment to local post state
      setPosts((prevPosts) =>
        prevPosts.map((p) => {
          if (p.id === postId) {
            const currentComments = Array.isArray(p.comments) ? p.comments : [];
            return {
              ...p,
              comments: [...currentComments, data.comment as PostComment],
            };
          }
          return p;
        }),
      );

      // Clear input
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      showToast("Comment published!");
    } catch (err) {
      console.error("Comment submit error:", err);
      showToast("Failed to add comment.");
    } finally {
      setIsSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleShare = async (post: KolkataPost) => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const shareUrl = `${origin}/explore?post=${post.id}`;

    // Call share endpoint to record counter
    try {
      const res = await fetch(`/api/posts/${post.id}/share`, { method: "POST" });
      const data = await res.json();
      if (data.success && typeof data.sharesCount === "number") {
        setShareCounts((prev) => ({ ...prev, [post.id]: data.sharesCount }));
      }
    } catch {
      // Non-blocking
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${post.placeName} — Facebook of Kolkata`,
          text: `"${post.caption}"\n\nExperience this memory of Kolkata:`,
          url: shareUrl,
        });
        showToast("Shared successfully!");
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Post link copied to clipboard!");
      } catch {
        showToast("Could not copy link.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-paper-bg text-paper-text pt-10 pb-28 px-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full border border-terracotta/40 bg-paper-text text-paper-bg px-6 py-2.5 text-xs font-semibold tracking-wider shadow-lg flex items-center gap-2 animate-bounce">
          <LuCheck size={14} className="text-gold-glow" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            const isLiked = likedPosts[post.id] || false;
            const currentLikes = likeCounts[post.id] ?? post.likesCount ?? 0;
            const commentsList = Array.isArray(post.comments) ? post.comments : [];
            const isCommentDrawerOpen = openComments[post.id] || false;
            const currentShares = shareCounts[post.id] ?? post.sharesCount ?? 0;

            return (
              <article
                key={post.id}
                id={`post-${post.id}`}
                className="overflow-hidden rounded-3xl border border-paper-muted/20 bg-paper-card shadow-sm transition-all hover:shadow-md"
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

                {/* Revamped Image: Always Square Aspect Ratio */}
                <div className="relative w-full aspect-square bg-paper-bg overflow-hidden border-y border-paper-muted/15">
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
                      <div className="flex items-center gap-2">
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

                  {/* Interaction Bar: Likes, Comments, Share */}
                  <div className="mt-5 pt-4 border-t border-paper-muted/15 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleLike(post.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all cursor-pointer ${
                          isLiked
                            ? "bg-terracotta text-white shadow-xs"
                            : "bg-paper-bg border border-paper-muted/20 text-paper-muted hover:text-terracotta hover:border-terracotta/40"
                        }`}
                        style={{
                          fontFamily: "var(--font-instrument), sans-serif",
                        }}
                      >
                        <LuHeart
                          size={14}
                          className={isLiked ? "fill-white" : ""}
                        />
                        <span>{currentLikes}</span>
                      </button>

                      {/* Comment Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleComments(post.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-paper-bg border border-paper-muted/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-paper-muted hover:text-paper-text hover:border-paper-muted/40 transition-colors cursor-pointer"
                        style={{
                          fontFamily: "var(--font-instrument), sans-serif",
                        }}
                      >
                        <LuMessageSquare size={14} />
                        <span>{commentsList.length}</span>
                      </button>
                    </div>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={() => handleShare(post)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-paper-bg border border-paper-muted/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-paper-muted hover:text-terracotta hover:border-terracotta/40 transition-colors cursor-pointer"
                      style={{
                        fontFamily: "var(--font-instrument), sans-serif",
                      }}
                    >
                      <LuShare2 size={13} />
                      <span>{currentShares > 0 ? `${currentShares} Shares` : "Share"}</span>
                    </button>
                  </div>

                  {/* Expandable Comments Drawer */}
                  {isCommentDrawerOpen && (
                    <div className="mt-4 pt-4 border-t border-paper-muted/15 space-y-4 animate-fadeIn">
                      <h4
                        className="text-xs font-semibold uppercase tracking-[0.16em] text-paper-muted"
                        style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                      >
                        Reflections & Adda ({commentsList.length})
                      </h4>

                      {/* Comment List */}
                      {commentsList.length === 0 ? (
                        <p
                          className="text-xs italic text-paper-muted/80 py-1"
                          style={{ fontFamily: "var(--font-newsreader), serif" }}
                        >
                          No reflections yet. Add your voice to the adda below.
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {commentsList.map((c) => (
                            <div
                              key={c.id}
                              className="rounded-xl border border-paper-muted/15 bg-paper-bg/70 p-3 text-left"
                            >
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="font-semibold text-paper-text">
                                  {c.userName}
                                </span>
                                <span className="text-[10px] text-paper-muted">
                                  {new Date(c.createdAt).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                              <p
                                className="text-xs italic text-paper-text/90"
                                style={{ fontFamily: "var(--font-newsreader), serif" }}
                              >
                                {c.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          void handleAddComment(post.id);
                        }}
                        className="flex items-center gap-2 pt-1"
                      >
                        <input
                          type="text"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          placeholder="Write a reflection or memory of this place..."
                          className="flex-1 rounded-full border border-paper-muted/25 bg-paper-bg px-4 py-2 text-xs text-paper-text placeholder:text-paper-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta"
                          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                          maxLength={500}
                        />
                        <button
                          type="submit"
                          disabled={
                            isSubmittingComment[post.id] ||
                            !commentInputs[post.id]?.trim()
                          }
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta text-white shadow-xs hover:bg-paper-text transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {isSubmittingComment[post.id] ? (
                            <LuLoaderCircle size={14} className="animate-spin" />
                          ) : (
                            <LuSend size={13} />
                          )}
                        </button>
                      </form>
                    </div>
                  )}
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
