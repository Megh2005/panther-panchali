"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBookOpen,
  FaCalendarDays,
  FaCheck,
  FaCopy,
  FaImage,
  FaLayerGroup,
  FaLocationDot,
  FaSatellite,
  FaShareNodes,
  FaSpinner,
  FaTrashCan,
  FaTree,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AudioPlayerButton from "@/components/audio-player-button";
import SatelliteMapView from "@/components/satellite-map-view";
import type { ExploredPlace } from "@/lib/models/guide";

function JourneyDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [place, setPlace] = useState<ExploredPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const isOwner = Boolean(
    session?.user &&
      place &&
      (session.user.email === place.userEmail || session.user.id === place.userId),
  );

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    async function loadPlaceDetails() {
      try {
        const res = await fetch(`/api/journeys?id=${encodeURIComponent(id as string)}`);
        const data = await res.json();
        if (!res.ok || !data.success || !data.place) {
          throw new Error(data.error || "Place not found in your journey.");
        }
        if (isMounted) {
          setPlace(data.place);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load place.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadPlaceDetails();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const copyToClipboard = (text: string, sectionId: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2500);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to remove this place from your journey?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/journeys?id=${encodeURIComponent(id as string)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        router.push("/journeys");
      } else {
        alert(data.error || "Failed to remove place.");
      }
    } catch {
      alert("Error removing place.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const shareUrl = window.location.href;
    const shareData = {
      title: `${place?.placeName || "Landmark"} · Panther Panchali`,
      text: `Explore ${place?.placeName || "this landmark"} in ${place?.district || "West Bengal"} on Panther Panchali.`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.warn("Share failed, falling back to clipboard copy:", err);
        }
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopiedLink(true);
      setShareToast("Link copied to clipboard!");
      setTimeout(() => {
        setIsCopiedLink(false);
        setShareToast(null);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-paper-bg text-paper-text flex flex-col items-center justify-center p-4">
        <FaSpinner size={32} className="animate-spin text-terracotta mb-4" />
        <h2
          className="text-xl font-light text-paper-text"
          style={{ fontFamily: "var(--font-fraunces), serif" }}
        >
          Retrieving Landmark Archive…
        </h2>
        <p
          className="text-xs italic text-paper-muted mt-1"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          Loading high-resolution satellite imagery and memoirs
        </p>
      </main>
    );
  }

  if (error || !place) {
    return (
      <main className="min-h-screen bg-paper-bg text-paper-text flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-paper-muted/20 bg-paper-card p-8 text-center shadow-sm space-y-4">
          <FaLocationDot size={32} className="mx-auto text-terracotta" />
          <h2
            className="text-2xl font-light text-paper-text"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Landmark Not Found
          </h2>
          <p
            className="text-sm italic text-paper-muted"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            {error || "This place could not be located in your personal chronicle."}
          </p>
          <Link
            href={session?.user ? "/journeys" : "/guide"}
            className="inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-paper-text transition-colors"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <FaArrowLeft size={11} />
            <span>{session?.user ? "Return to Gallery" : "Explore Places on Guide"}</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-paper-bg text-paper-text pt-8 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Soft Glow */}
      <div
        className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 h-[60vw] max-h-150 w-[60vw] max-w-200 rounded-full bg-radial from-[#E3C27A]/20 via-[#E3C27A]/5 to-transparent blur-3xl opacity-75"
        aria-hidden="true"
      />

      {shareToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full border border-terracotta/40 bg-paper-text text-paper-bg px-6 py-2.5 text-xs font-semibold tracking-wider shadow-lg flex items-center gap-2">
          <FaCheck size={12} className="text-gold-glow" />
          <span>{shareToast}</span>
        </div>
      )}

      <div className="relative z-10 w-full max-w-[94vw] lg:max-w-[85vw] mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={session?.user ? "/journeys" : "/guide"}
            className="inline-flex items-center gap-2 rounded-full border border-paper-muted/30 bg-paper-card px-4 py-2 text-xs font-semibold uppercase tracking-wider text-paper-text hover:border-terracotta hover:text-terracotta transition-colors shadow-2xs"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <FaArrowLeft size={11} />
            <span>{session?.user ? "Back to Gallery" : "Explore on Bengal Guide"}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-paper-muted/30 bg-paper-card px-4 py-2 text-xs font-semibold uppercase tracking-wider text-paper-text hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer shadow-2xs"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              title="Copy link to share this landmark"
            >
              {isCopiedLink ? (
                <>
                  <FaCheck size={11} className="text-terracotta" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <FaShareNodes size={11} />
                  <span>Share Link</span>
                </>
              )}
            </button>

            {isOwner && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-paper-card px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                <FaTrashCan size={11} />
                <span>{isDeleting ? "Removing…" : "Remove"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Place Header Card */}
        <div className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full border border-terracotta/30 bg-terracotta/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-terracotta">
                <FaLocationDot size={11} />
                <span>{place.district} District</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-paper-muted/20 bg-paper-bg px-3 py-1 text-xs font-semibold uppercase tracking-wider text-paper-text">
                <span>{place.state}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-paper-muted ml-1">
                <FaCalendarDays size={10} />
                <span>
                  Explored{" "}
                  {new Date(place.exploredAt).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>

            <h1
              className="mt-3 text-3xl sm:text-5xl font-light text-paper-text"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
              }}
            >
              {place.placeName}
            </h1>

            <p
              className="mt-2 text-xs sm:text-sm text-paper-muted max-w-2xl"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              {place.detailedAddress}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-paper-muted/30 bg-paper-bg px-4 py-2 text-xs font-semibold uppercase tracking-wider text-paper-text hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer shadow-2xs"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              title="Copy link to share this landmark"
            >
              {isCopiedLink ? (
                <>
                  <FaCheck size={11} className="text-terracotta" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <FaShareNodes size={11} />
                  <span>Share Link</span>
                </>
              )}
            </button>
            <AudioPlayerButton text={place.plainTextSummary} label="Listen to Memoir" />
          </div>
        </div>

        {/* Captured Photograph Full View */}
        {place.imageUrl && (
          <div className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-paper-muted/15">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
                  <FaImage size={14} />
                </div>
                <h3
                  className="text-xl sm:text-2xl font-light text-paper-text"
                  style={{ fontFamily: "var(--font-fraunces), serif" }}
                >
                  Captured Photograph
                </h3>
              </div>
              <span
                className="text-[11px] font-semibold uppercase tracking-wider text-paper-muted"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Original View
              </span>
            </div>
            <div className="relative max-w-full overflow-hidden rounded-2xl border border-paper-muted/20 bg-paper-bg p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={place.imageUrl}
                alt={place.placeName}
                className="max-h-96 sm:max-h-125 w-auto max-w-full rounded-xl object-contain block mx-auto shadow-xs"
              />
            </div>
          </div>
        )}

        {/* Satellite Map & Overview Memoir Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Satellite View Map */}
          <div className="lg:col-span-7 flex flex-col space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
                  <FaSatellite size={13} />
                </div>
                <h3
                  className="text-xl sm:text-2xl font-light text-paper-text"
                  style={{ fontFamily: "var(--font-fraunces), serif" }}
                >
                  Satellite View
                </h3>
              </div>
              <span className="text-xs font-mono text-terracotta font-semibold">
                {place.coordinates.lat.toFixed(4)}°N, {place.coordinates.lng.toFixed(4)}°E
              </span>
            </div>

            {/* Satellite Map - Nothing else, only Satellite View */}
            <SatelliteMapView
              lat={place.coordinates.lat}
              lng={place.coordinates.lng}
              placeName={place.placeName}
              district={place.district}
              detailedAddress={place.detailedAddress}
            />
          </div>

          {/* Overview Memoir */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
                  <FaBookOpen size={14} />
                </div>
                <h3
                  className="text-xl sm:text-2xl font-light text-paper-text"
                  style={{ fontFamily: "var(--font-fraunces), serif" }}
                >
                  Overview Summary
                </h3>
              </div>
              <AudioPlayerButton text={place.plainTextSummary} label="Listen" />
            </div>

            <div className="relative flex-1 rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-7 shadow-[0_8px_30px_rgba(27,26,23,0.08)] flex flex-col justify-between overflow-hidden">
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-terracotta block mb-3"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  Panther Panchali · Literary Memoir
                </span>
                <p
                  className="text-base sm:text-lg italic text-paper-text leading-relaxed whitespace-pre-line text-balance"
                  style={{ fontFamily: "var(--font-newsreader), serif" }}
                >
                  {place.plainTextSummary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-paper-muted/15 flex items-center justify-between">
                <AudioPlayerButton text={place.plainTextSummary} label="Listen" />
                <button
                  type="button"
                  onClick={() => copyToClipboard(place.plainTextSummary, "summary")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-paper-muted/30 bg-paper-bg px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-paper-text hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  {copiedSection === "summary" ? (
                    <>
                      <FaCheck size={11} className="text-terracotta" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <FaCopy size={11} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scenic Beauty & Historical Significance */}
        {(place.scenicBeauty || place.historicalSignificance) && (
          <div
            className={`grid gap-8 items-start ${
              place.scenicBeauty && place.historicalSignificance
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {place.scenicBeauty && (
              <div className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-paper-muted/15">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
                      <FaTree size={14} />
                    </div>
                    <h3
                      className="text-xl sm:text-2xl font-light text-paper-text"
                      style={{ fontFamily: "var(--font-fraunces), serif" }}
                    >
                      Scenic Beauty & Landscape
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <AudioPlayerButton text={place.scenicBeauty} label="Listen" />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(place.scenicBeauty || "", "scenic")}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-paper-muted hover:text-terracotta transition-colors"
                    >
                      {copiedSection === "scenic" ? (
                        <FaCheck size={11} className="text-terracotta" />
                      ) : (
                        <FaCopy size={11} />
                      )}
                      <span>{copiedSection === "scenic" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
                <div
                  className="prose prose-paper max-w-none text-paper-text text-base sm:text-lg italic leading-relaxed"
                  style={{ fontFamily: "var(--font-newsreader), serif" }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {place.scenicBeauty}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {place.historicalSignificance && (
              <div className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-paper-muted/15">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
                      <FaLayerGroup size={14} />
                    </div>
                    <h3
                      className="text-xl sm:text-2xl font-light text-paper-text"
                      style={{ fontFamily: "var(--font-fraunces), serif" }}
                    >
                      Historical Heritage & Architecture
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <AudioPlayerButton
                      text={place.historicalSignificance}
                      label="Listen"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(place.historicalSignificance || "", "history")
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-paper-muted hover:text-terracotta transition-colors"
                    >
                      {copiedSection === "history" ? (
                        <FaCheck size={11} className="text-terracotta" />
                      ) : (
                        <FaCopy size={11} />
                      )}
                      <span>{copiedSection === "history" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
                <div
                  className="prose prose-paper max-w-none text-paper-text text-base sm:text-lg italic leading-relaxed"
                  style={{ fontFamily: "var(--font-newsreader), serif" }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {place.historicalSignificance}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Predicted Travel Mood */}
        {place.predictedMood && (
          <div className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-paper-muted/15">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
                  <FaWandMagicSparkles size={14} />
                </div>
                <h3
                  className="text-xl sm:text-2xl font-light text-paper-text"
                  style={{ fontFamily: "var(--font-fraunces), serif" }}
                >
                  Predicted Travel Mood & Mindset
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AudioPlayerButton
                  text={
                    place.predictedMood.moodParagraph ||
                    place.predictedMood.moodDescription ||
                    ""
                  }
                  label="Listen"
                />
                <span className="inline-flex items-center rounded-full bg-paper-bg border border-terracotta/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-terracotta">
                  Atmosphere: {place.predictedMood.moodName}
                </span>
                {place.predictedMood.bestTimeToVisit && (
                  <span className="inline-flex items-center rounded-full bg-paper-bg border border-paper-muted/25 px-3 py-1 text-xs font-medium text-paper-muted">
                    {place.predictedMood.bestTimeToVisit}
                  </span>
                )}
              </div>
            </div>

            <div
              className="prose prose-paper max-w-none text-paper-text text-base sm:text-lg italic leading-relaxed"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {place.predictedMood.moodParagraph ||
                  place.predictedMood.moodDescription ||
                  ""}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* 5-Color Atmospheric Palette */}
        {Array.isArray(place.extractedColors) && place.extractedColors.length > 0 && (
          <div className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
                <FaImage size={14} />
              </div>
              <div>
                <h4
                  className="text-base font-semibold text-paper-text"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  Atmospheric 5-Color Palette
                </h4>
                <p className="text-xs text-paper-muted">
                  Extracted directly from the landscape tones of this site
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {place.extractedColors.slice(0, 5).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => copyToClipboard(color, `color-${color}`)}
                  className="group relative flex items-center justify-center cursor-pointer"
                  title={`Copy ${color}`}
                >
                  <div
                    className="h-8 w-8 rounded-full border border-paper-text/20 shadow-xs hover:scale-115 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                  <span className="pointer-events-none absolute -bottom-7 rounded-md bg-paper-text px-1.5 py-0.5 text-[9px] font-mono text-paper-bg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {copiedSection === `color-${color}` ? "Copied" : color}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function JourneyDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-paper-bg text-paper-text flex flex-col items-center justify-center p-4">
          <FaSpinner size={32} className="animate-spin text-terracotta mb-4" />
          <h2
            className="text-xl font-light text-paper-text"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Retrieving Landmark Archive…
          </h2>
          <p
            className="text-xs italic text-paper-muted mt-1"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Loading high-resolution satellite imagery and memoirs
          </p>
        </main>
      }
    >
      <JourneyDetailsContent />
    </Suspense>
  );
}
