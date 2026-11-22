"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaCircleExclamation,
  FaFilm,
  FaPlay,
  FaRotateRight,
  FaSpinner,
  FaSun,
  FaVolumeHigh,
  FaVolumeXmark,
  FaWandMagicSparkles,
  FaWind,
} from "react-icons/fa6";
import type { VideoVariant } from "@/lib/models/guide";

/**
 * BINARY FEATURE TRIGGER:
 * 0 = "Coming Soon" preview mode
 * 1 = "Live" generation & playback mode
 *
 * Simply change this value to 1 to activate live video generation and playback.
 */
export const VIDEO_FEATURE_TRIGGER: 0 | 1 = 0;

interface JourneyVideoPlayerProps {
  placeId: string;
  placeName: string;
  district: string;
  imageUrl: string;
  initialVideos?: {
    variant1?: VideoVariant;
    variant2?: VideoVariant;
  };
}

type VariantKey = "variant1" | "variant2";

interface VariantMeta {
  key: VariantKey;
  label: string;
  shortTitle: string;
  icon: typeof FaWind;
  description: string;
  tagline: string;
}

const VARIANTS: VariantMeta[] = [
  {
    key: "variant1",
    label: "Variant 1",
    shortTitle: "Serene Drift",
    icon: FaWind,
    description:
      "Gentle morning breeze, soft ambient lighting, and slow tranquil motion drifting across the landscape.",
    tagline: "Serene morning mist & subtle natural breeze",
  },
  {
    key: "variant2",
    label: "Variant 2",
    shortTitle: "Golden Hour",
    icon: FaSun,
    description:
      "Warm sunset radiance, rich golden sun rays, and vibrant evening motion with cinematic depth.",
    tagline: "Warm dusk illumination & dramatic sky",
  },
];

export default function JourneyVideoPlayer({
  placeId,
  placeName,
  district,
  imageUrl,
  initialVideos,
}: JourneyVideoPlayerProps) {
  const isLive =
    VIDEO_FEATURE_TRIGGER === 1 ||
    process.env.NEXT_PUBLIC_VIDEO_FEATURE_TRIGGER === "1";

  const [activeVariant, setActiveVariant] = useState<VariantKey>("variant1");
  const [videos, setVideos] = useState<{
    variant1?: VideoVariant;
    variant2?: VideoVariant;
  }>(initialVideos || {});

  useEffect(() => {
    if (initialVideos) {
      setVideos((prev) => ({
        ...prev,
        ...initialVideos,
      }));
    }
  }, [initialVideos]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentVideo = videos[activeVariant];
  const activeMeta = VARIANTS.find((v) => v.key === activeVariant) || VARIANTS[0];

  const clearPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  // Poll video status if active variant is currently generating
  const startPolling = useCallback(
    (variantKey: VariantKey, jobId?: string) => {
      clearPolling();
      setIsGenerating(true);
      setErrorMessage(null);

      pollTimerRef.current = setInterval(async () => {
        try {
          const query = jobId
            ? `/api/journeys/video?placeId=${encodeURIComponent(placeId)}&variantId=${variantKey}&jobId=${encodeURIComponent(jobId)}`
            : `/api/journeys/video?placeId=${encodeURIComponent(placeId)}&variantId=${variantKey}`;

          const res = await fetch(query);
          const data = await res.json();

          if (data.status === "completed" && data.videoUrl) {
            clearPolling();
            setIsGenerating(false);
            setVideos((prev) => ({
              ...prev,
              [variantKey]: {
                variantId: variantKey,
                name: activeMeta.shortTitle,
                prompt: "",
                videoUrl: data.videoUrl,
                status: "completed",
                updatedAt: new Date(),
              },
            }));
          } else if (data.status === "failed") {
            clearPolling();
            setIsGenerating(false);
            setErrorMessage(data.error || "Video generation could not be completed.");
            setVideos((prev) => ({
              ...prev,
              [variantKey]: {
                ...(prev[variantKey] || {
                  variantId: variantKey,
                  name: activeMeta.shortTitle,
                  prompt: "",
                }),
                status: "failed",
                error: data.error,
              },
            }));
          }
        } catch {
          // Keep polling on temporary network hiccups
        }
      }, 4000);
    },
    [placeId, activeMeta.shortTitle, clearPolling],
  );

  // If initial state for this variant was already generating, resume polling
  useEffect(() => {
    const variantData = videos[activeVariant];
    if (variantData?.status === "generating") {
      startPolling(activeVariant, variantData.jobId);
    } else {
      clearPolling();
      setIsGenerating(false);
      setErrorMessage(variantData?.error || null);
    }
  }, [activeVariant, videos, startPolling, clearPolling]);

  const handleGenerate = async (variantKey: VariantKey) => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/journeys/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId,
          variantId: variantKey,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate video generation.");
      }

      if (data.status === "completed" && data.videoUrl) {
        setIsGenerating(false);
        setVideos((prev) => ({
          ...prev,
          [variantKey]: {
            variantId: variantKey,
            name: activeMeta.shortTitle,
            prompt: data.variant?.prompt || "",
            videoUrl: data.videoUrl,
            status: "completed",
            updatedAt: new Date(),
          },
        }));
      } else {
        // Asynchronous job initiated, start polling
        setVideos((prev) => ({
          ...prev,
          [variantKey]: {
            variantId: variantKey,
            name: activeMeta.shortTitle,
            prompt: data.variant?.prompt || "",
            jobId: data.jobId,
            status: "generating",
            updatedAt: new Date(),
          },
        }));
        startPolling(variantKey, data.jobId);
      }
    } catch (err) {
      setIsGenerating(false);
      const msg = err instanceof Error ? err.message : "Error creating video.";
      setErrorMessage(msg);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    } else {
      setIsMuted((prev) => !prev);
    }
  };

  const videoUrl = currentVideo?.videoUrl;
  const hasVideo = Boolean(videoUrl);

  return (
    <div className="rounded-3xl border border-paper-muted/20 bg-paper-card p-5 sm:p-7 shadow-[0_8px_30px_rgba(27,26,23,0.06)] flex flex-col space-y-5">
      {/* Header & Variant Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-paper-muted/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta text-white shadow-xs">
            <FaFilm size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className="text-xl sm:text-2xl font-light text-paper-text"
                style={{ fontFamily: "var(--font-fraunces), serif" }}
              >
                Living Motion Video
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isLive
                    ? "bg-gold-glow/40 text-terracotta"
                    : "bg-terracotta/15 text-terracotta border border-terracotta/25"
                }`}
              >
                {isLive ? "AI Synthesis" : "Coming Soon"}
              </span>
            </div>
            <p className="text-xs text-paper-muted">
              Transform this photograph into cinematic video with 2 atmospheric motion styles
            </p>
          </div>
        </div>

        {/* Changeable Variant Selector */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-paper-bg p-1 border border-paper-muted/20 self-start sm:self-auto shadow-xs">
          {VARIANTS.map((v) => {
            const Icon = v.icon;
            const isSelected = activeVariant === v.key;
            const isReady = videos[v.key]?.status === "completed";
            const isProc = videos[v.key]?.status === "generating";

            return (
              <button
                key={v.key}
                type="button"
                onClick={() => setActiveVariant(v.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-terracotta text-white shadow-xs"
                    : "text-paper-muted hover:text-paper-text hover:bg-paper-card/70"
                }`}
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                <Icon size={12} className={isSelected ? "text-white" : "text-terracotta"} />
                <span>{v.shortTitle}</span>
                {isReady && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isSelected ? "bg-gold-glow" : "bg-emerald-500"
                    }`}
                    title="Video Ready"
                  />
                )}
                {isProc && (
                  <FaSpinner
                    size={10}
                    className={`animate-spin ${isSelected ? "text-white" : "text-terracotta"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Variant Info Banner */}
      <div className="flex items-center justify-between rounded-xl bg-paper-bg/60 border border-paper-muted/15 px-3.5 py-2 text-xs text-paper-muted">
        <div className="flex items-center gap-2">
          <span
            className="font-semibold uppercase tracking-wider text-terracotta text-[10px]"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            {activeMeta.label}: {activeMeta.shortTitle}
          </span>
          <span className="hidden sm:inline text-paper-muted/50">•</span>
          <span className="hidden sm:inline italic text-paper-text/80 text-[11px]">
            {activeMeta.tagline}
          </span>
        </div>
        <span className="text-[10px] font-mono text-paper-muted font-medium">
          16:9 · 1080p · 8s Motion
        </span>
      </div>

      {/* Video / Generation Area */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-paper-muted/20 bg-black/90 aspect-video flex items-center justify-center shadow-inner group">
        {!isLive ? (
          /* Coming Soon Preview State (Trigger = 0) */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={placeName}
              className="w-full h-full object-cover opacity-75 group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-transparent" />

            {/* Centered Coming Soon Card */}
            <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-md">
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-terracotta/20 backdrop-blur-md px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-glow border border-gold-glow/30 mb-3"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                <FaWandMagicSparkles size={11} />
                <span>Feature Arriving Soon</span>
              </span>
              <h4
                className="text-xl sm:text-2xl font-light text-white mb-2"
                style={{ fontFamily: "var(--font-fraunces), serif" }}
              >
                {activeMeta.shortTitle} Motion
              </h4>
              <p
                className="text-xs sm:text-sm text-white/90 mb-5 leading-relaxed italic"
                style={{ fontFamily: "var(--font-newsreader), serif" }}
              >
                {activeMeta.description}
              </p>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 backdrop-blur-md px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg cursor-default">
                <FaFilm size={12} className="text-gold-glow" />
                <span>Coming Soon · 8s 1080p AI Video</span>
              </div>
            </div>
          </div>
        ) : hasVideo && videoUrl ? (
          /* Live Video Playback State (Trigger = 1) */
          <>
            <video
              key={videoUrl}
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              controls
              className="w-full h-full object-cover"
            />

            {/* Audio Toggle Floating Overlay */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition-colors shadow-xs cursor-pointer border border-white/20"
                title={isMuted ? "Unmute audio" : "Mute audio"}
              >
                {isMuted ? <FaVolumeXmark size={13} /> : <FaVolumeHigh size={13} />}
              </button>

              <button
                type="button"
                onClick={() => handleGenerate(activeVariant)}
                disabled={isGenerating}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition-colors shadow-xs cursor-pointer border border-white/20"
                title="Regenerate video for this variant"
              >
                <FaRotateRight size={12} className={isGenerating ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Style Badge */}
            <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
              <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-semibold text-white/90 border border-white/15">
                {activeMeta.shortTitle} · Living Video
              </span>
            </div>
          </>
        ) : isGenerating ? (
          /* Generating State */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
            {/* Background Image Blurred Preview */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={placeName}
              className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
            />
            <div className="relative z-10 flex flex-col items-center space-y-3 max-w-sm">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta text-white shadow-lg animate-pulse">
                <FaSpinner size={24} className="animate-spin text-white" />
              </div>
              <h4
                className="text-lg font-light text-white"
                style={{ fontFamily: "var(--font-fraunces), serif" }}
              >
                Synthesizing Living Motion...
              </h4>
              <p
                className="text-xs text-white/80 leading-relaxed italic"
                style={{ fontFamily: "var(--font-newsreader), serif" }}
              >
                Applying AI motion camera paths and atmospheric audio for {activeMeta.shortTitle}...
              </p>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold-glow animate-pulse">
                Processing video frames (approx. 10-30s)
              </span>
            </div>
          </div>
        ) : (
          /* Idle / Not Yet Generated State */
          <div className="relative w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={placeName}
              className="w-full h-full object-cover opacity-75 group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />

            {/* Centered Action */}
            <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-md">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-glow mb-2"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                {activeMeta.label} · {activeMeta.shortTitle}
              </span>
              <p
                className="text-xs sm:text-sm text-white/90 mb-4 line-clamp-2 italic"
                style={{ fontFamily: "var(--font-newsreader), serif" }}
              >
                {activeMeta.description}
              </p>

              <button
                type="button"
                onClick={() => handleGenerate(activeVariant)}
                disabled={isGenerating}
                className="inline-flex items-center gap-2.5 rounded-full bg-terracotta px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg hover:bg-terracotta/90 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                <FaWandMagicSparkles size={13} />
                <span>Generate {activeMeta.shortTitle} Video</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Notice (shown only when live) */}
      {isLive && errorMessage && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-700 flex items-start gap-2.5">
          <FaCircleExclamation size={14} className="mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold">Video Generation Notice</p>
            <p className="mt-0.5 text-red-600/90">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => handleGenerate(activeVariant)}
            className="shrink-0 text-xs font-semibold underline hover:text-red-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Footer Instructions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-paper-muted gap-2 pt-1 border-t border-paper-muted/10">
        <span>
          {isLive ? (
            <>
              Click between <strong>Serene Drift</strong> and <strong>Golden Hour</strong> above to view or switch motion styles.
            </>
          ) : (
            <>
              Explore <strong>Serene Drift</strong> and <strong>Golden Hour</strong> above for a preview of the upcoming living motion variants.
            </>
          )}
        </span>
        <span className="font-mono text-[10px] text-terracotta">
          {placeName}, {district}
        </span>
      </div>
    </div>
  );
}
