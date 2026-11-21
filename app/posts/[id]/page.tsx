"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarDays,
  FaClock,
  FaHeart,
  FaLayerGroup,
  FaLocationDot,
  FaMessage,
  FaPaperPlane,
  FaShareNodes,
  FaSpinner,
  FaTree,
  FaUser,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import OpenStreetMapModal from "@/components/open-street-map-modal";
import type { BengalPost, PostComment } from "@/lib/models/post";

export default function SinglePostPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const [post, setPost] = useState<BengalPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const data = await res.json();
        if (data.post) {
          setPost(data.post);
          setLikeCount(data.post.likesCount || 0);
        }
      } catch (err) {
        console.error("Failed to load post:", err);
      } finally {
        setLoading(false);
      }
    }
    void loadPost();
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleLike = async () => {
    if (!post) return;
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setIsLiked(data.liked);
        setLikeCount(data.likesCount);
      }
    } catch {
      setIsLiked(!nextLiked);
      setLikeCount((prev) => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText.trim() }),
      });
      const data = await res.json();
      if (data.success && data.comment) {
        setPost((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            comments: [...(prev.comments || []), data.comment as PostComment],
          };
        });
        setCommentText("");
        showToast("Reflection added!");
      }
    } catch {
      showToast("Could not publish comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    const shareUrl = window.location.href;

    try {
      await fetch(`/api/posts/${post.id}/share`, { method: "POST" });
    } catch {
      // non-blocking
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${post.placeName} — Panther Panchali`,
          text: `"${post.caption}"`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-paper-bg text-paper-text flex flex-col items-center justify-center gap-3">
        <FaSpinner size={24} className="animate-spin text-terracotta" />
        <p
          className="text-sm italic text-paper-muted"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          Loading discovery…
        </p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-paper-bg text-paper-text pt-20 px-4 text-center">
        <h1
          className="text-3xl font-light text-paper-text"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          Post Not Found
        </h1>
        <p
          className="mt-2 text-sm italic text-paper-muted"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          This record may have been removed or does not exist.
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Return to Feed
        </Link>
      </main>
    );
  }

  const comments = post.comments || [];

  return (
    <main className="relative min-h-screen bg-paper-bg text-paper-text pt-8 pb-28 px-4 overflow-hidden">
      <div
        className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 h-[60vw] max-h-150 w-[60vw] max-w-200 rounded-full bg-radial from-[#E3C27A]/20 via-[#E3C27A]/5 to-transparent blur-3xl opacity-75"
        aria-hidden="true"
      />

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full border border-terracotta/40 bg-paper-text text-paper-bg px-6 py-2 text-xs font-semibold tracking-wider shadow-lg">
          {toastMessage}
        </div>
      )}

      <div className="relative z-10 max-w-3xl mx-auto">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-paper-muted hover:text-terracotta transition-colors mb-6"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          <FaArrowLeft size={13} />
          <span>Back to Bengal Feed</span>
        </Link>

        <article className="overflow-hidden rounded-3xl border border-paper-muted/20 bg-paper-card shadow-sm">
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
                  <FaUser size={18} className="text-terracotta" />
                )}
              </div>
              <div>
                <h2
                  className="text-base font-medium text-paper-text leading-tight"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  {post.userName}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-paper-muted">
                  <span>
                    {new Date(post.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  {post.vibe && (
                    <>
                      <span>·</span>
                      <span className="text-terracotta font-medium">{post.vibe}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {post.district && (
                <span className="inline-flex items-center gap-1 rounded-full border border-terracotta/30 bg-terracotta/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-terracotta">
                  <FaLocationDot size={10} />
                  <span>{post.district}</span>
                </span>
              )}
              {post.predictedMood?.moodName ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-paper-muted/20 bg-paper-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-text">
                  <FaWandMagicSparkles size={10} className="text-terracotta" />
                  <span>{post.predictedMood.moodName}</span>
                </span>
              ) : post.timeOfDay ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-paper-muted/20 bg-paper-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper-muted">
                  <FaClock size={10} />
                  <span>{post.timeOfDay}</span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="px-5 sm:px-6 pb-3 flex items-center justify-between text-xs text-paper-muted">
            <div className="flex items-center gap-1.5 font-medium">
              <FaLocationDot size={13} className="text-terracotta shrink-0" />
              <span className="text-paper-text font-semibold">{post.placeName}</span>
              {post.bengaliName && (
                <span className="text-terracotta font-normal">
                  ({post.bengaliName})
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="inline-flex items-center gap-1 rounded-full border border-paper-muted/30 bg-paper-bg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-terracotta hover:bg-terracotta hover:text-white transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <FaLocationDot size={10} />
              <span>View Map Radar</span>
            </button>
          </div>

          <div className="relative w-full aspect-square bg-paper-bg overflow-hidden border-y border-paper-muted/15">
            <Image
              src={post.revampedImageUrl || post.originalImageUrl || ""}
              alt={post.placeName}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>

          {Array.isArray(post.extractedColors) && post.extractedColors.length > 0 && (
            <div className="px-5 sm:px-6 py-2.5 bg-paper-bg/60 border-b border-paper-muted/15 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-paper-muted">
                <FaWandMagicSparkles size={11} className="text-terracotta" />
                <span
                  className="font-semibold uppercase tracking-[0.16em] text-[10px]"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  Atmospheric Palette:
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {post.extractedColors.map((color) => (
                  <div key={color} className="group relative flex items-center justify-center">
                    <div
                      className="h-5 w-5 rounded-full border border-paper-text/15 shadow-2xs hover:scale-125 transition-transform"
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

          <div className="p-5 sm:p-6 pt-4 space-y-6">
            <div>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta block mb-2"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Panther Panchali · Literary Memoir
              </span>
              <p
                className="text-base sm:text-lg italic text-paper-text leading-relaxed whitespace-pre-line"
                style={{ fontFamily: "var(--font-newsreader), serif" }}
              >
                {post.plainTextSummary || post.caption}
              </p>
            </div>

            {(post.scenicBeauty || post.historicalSignificance) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-paper-muted/15">
                {post.scenicBeauty && (
                  <div className="rounded-2xl bg-paper-bg p-5 border border-paper-muted/20">
                    <div className="flex items-center gap-2 mb-2 text-terracotta text-xs font-semibold uppercase tracking-wider">
                      <FaTree size={14} />
                      <span>Scenic Beauty</span>
                    </div>
                    <div className="prose prose-sm text-paper-text leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.scenicBeauty}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {post.historicalSignificance && (
                  <div className="rounded-2xl bg-paper-bg p-5 border border-paper-muted/20">
                    <div className="flex items-center gap-2 mb-2 text-terracotta text-xs font-semibold uppercase tracking-wider">
                      <FaLayerGroup size={14} />
                      <span>Historical Heritage</span>
                    </div>
                    <div className="prose prose-sm text-paper-text leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.historicalSignificance}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {post.predictedMood && (
              <div className="rounded-2xl bg-paper-bg p-5 border border-paper-muted/20">
                <div className="flex items-center justify-between text-xs font-semibold text-terracotta mb-2">
                  <span className="uppercase tracking-wider">
                    Predicted Atmosphere: {post.predictedMood.moodName}
                  </span>
                  <span className="text-paper-muted">
                    {post.predictedMood.bestTimeToVisit}
                  </span>
                </div>
                <p
                  className="text-sm italic text-paper-muted mb-3"
                  style={{ fontFamily: "var(--font-newsreader), serif" }}
                >
                  {post.predictedMood.moodDescription}
                </p>
                {Array.isArray(post.predictedMood.whatToExpect) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-paper-text">
                    {post.predictedMood.whatToExpect.map((exp, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
                        <span>{exp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-terracotta"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-paper-muted/15 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all cursor-pointer ${
                    isLiked
                      ? "bg-terracotta text-white shadow-xs"
                      : "bg-paper-bg border border-paper-muted/20 text-paper-muted hover:text-terracotta"
                  }`}
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  <FaHeart size={12} className={isLiked ? "fill-white" : ""} />
                  <span>{likeCount}</span>
                </button>
                <span
                  className="inline-flex items-center gap-1.5 text-xs text-paper-muted px-2"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  <FaMessage size={12} />
                  <span>{comments.length} Comments</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-full bg-paper-bg border border-paper-muted/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-paper-muted hover:text-terracotta transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                <FaShareNodes size={12} />
                <span>Share</span>
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-paper-muted/15 space-y-4">
              <h3
                className="text-xs font-semibold uppercase tracking-[0.16em] text-paper-muted"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Reflections ({comments.length})
              </h3>

              {comments.length === 0 ? (
                <p
                  className="text-xs italic text-paper-muted/80 py-2"
                  style={{ fontFamily: "var(--font-newsreader), serif" }}
                >
                  No reflections yet. Add yours below.
                </p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {comments.map((c) => (
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

              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share a thought about this memory..."
                  className="flex-1 rounded-full border border-paper-muted/25 bg-paper-bg px-4 py-2 text-xs text-paper-text focus:outline-none focus:ring-2 focus:ring-terracotta"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terracotta text-white shadow-xs hover:bg-paper-text transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <FaPaperPlane size={11} />
                </button>
              </form>
            </div>
          </div>
        </article>
      </div>

      {showMap && (
        <OpenStreetMapModal
          isOpen={showMap}
          onClose={() => setShowMap(false)}
          placeName={post.placeName}
          lat={post.placeCoords?.lat || 22.5726}
          lng={post.placeCoords?.lng || 88.3639}
        />
      )}
    </main>
  );
}
