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
  FaXmark,
} from "react-icons/fa6";
import type { VideoVariant } from "@/lib/models/guide";

/**
 * 0 = "Coming Soon" preview mode
 * 1 = "Live" generation & playback mode
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
  fullName: string;
  icon: typeof FaWind;
  description: string;
  tagline: string;
}

const VARIANTS: VariantMeta[] = [
  {
    key: "variant1",
    label: "Variant 1",
    shortTitle: "Serene Drift",
    fullName: "Serene Drift Motion",
    icon: FaWind,
    description:
      "Gentle morning breeze, soft ambient lighting, and slow tranquil motion drifting across the landscape.",
    tagline: "Serene morning mist & subtle natural breeze",
  },
  {
    key: "variant2",
    label: "Variant 2",
    shortTitle: "Golden Hour",
    fullName: "Golden Hour Motion",
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

  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialVideos) {
      setVideos((prev) => ({
        ...prev,
        ...initialVideos,
      }));
    }
  }, [initialVideos]);

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
      setIsPlayerOpen(true);

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
    setIsPlayerOpen(true);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-muted/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-terracotta text-white shadow-xs">
            <FaFilm size={14} />
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

        <span className="text-[11px] font-mono text-paper-muted font-medium self-start sm:self-auto">
          16:9 · 1080p · 8s Motion
        </span>
      </div>

      {/* Two Distinct Variant Cards with Dedicated Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VARIANTS.map((v) => {
          const Icon = v.icon;
          const isSelected = activeVariant === v.key;
          const readyVideoUrl = videos[v.key]?.videoUrl;
          const isReady = Boolean(readyVideoUrl);
          const isProc = videos[v.key]?.status === "generating";

          return (
            <div
              key={v.key}
              onClick={() => {
                setActiveVariant(v.key);
                if (isLive && isReady) {
                  setIsPlayerOpen(true);
                }
              }}
              className={`group rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? "border-terracotta bg-paper-bg shadow-sm ring-1 ring-terracotta/30"
                  : "border-paper-muted/20 bg-paper-bg/60 hover:border-terracotta/40 hover:bg-paper-bg"
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                        isSelected
                          ? "bg-terracotta text-white shadow-xs"
                          : "bg-paper-card text-terracotta border border-paper-muted/20"
                      }`}
                    >
                      <Icon size={13} />
                    </div>
                    <div>
                      <h4
                        className="text-base sm:text-lg font-light text-paper-text"
                        style={{ fontFamily: "var(--font-fraunces), serif" }}
                      >
                        {v.fullName}
                      </h4>
                      <span className="text-[10px] text-terracotta font-semibold uppercase tracking-wider block">
                        {v.label}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isLive ? (
                    isReady ? (
                      <span className="rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Ready
                      </span>
                    ) : isProc ? (
                      <span className="rounded-full bg-terracotta/15 text-terracotta px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <FaSpinner size={9} className="animate-spin" /> Rendering
                      </span>
                    ) : (
                      <span className="rounded-full bg-paper-muted/15 text-paper-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                        Available
                      </span>
                    )
                  ) : (
                    <span className="rounded-full bg-gold-glow/40 text-terracotta px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-terracotta/20">
                      Coming Soon
                    </span>
                  )}
                </div>

                <p
                  className="text-xs text-paper-muted italic leading-relaxed"
                  style={{ fontFamily: "var(--font-newsreader), serif" }}
                >
                  {v.description}
                </p>
              </div>

              {/* Dedicated Card Action Button */}
              <div className="mt-4 pt-3 border-t border-paper-muted/15 flex items-center justify-between">
                <span className="text-[10px] font-mono text-paper-muted/80 uppercase tracking-wider">
                  {v.tagline}
                </span>

                {isLive ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVariant(v.key);
                      if (isReady) {
                        setIsPlayerOpen(true);
                      } else {
                        handleGenerate(v.key);
                      }
                    }}
                    disabled={isProc}
                    className="inline-flex items-center gap-1.5 rounded-full bg-terracotta px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs hover:bg-terracotta/90 transition-all cursor-pointer"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    {isReady ? (
                      <>
                        <FaPlay size={10} />
                        <span>Watch Video</span>
                      </>
                    ) : isProc ? (
                      <>
                        <FaSpinner size={10} className="animate-spin" />
                        <span>Rendering...</span>
                      </>
                    ) : (
                      <>
                        <FaWandMagicSparkles size={10} />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full border border-paper-muted/30 bg-paper-card px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-paper-muted cursor-default"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <FaWandMagicSparkles size={10} className="text-terracotta" />
                    <span>Coming Soon</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Live Video Player (Opens only when triggered in Live Mode) */}
      {isLive && isPlayerOpen && (
        <div className="relative w-full overflow-hidden rounded-2xl border border-paper-muted/20 bg-black/95 aspect-video flex items-center justify-center shadow-lg transition-all">
          {hasVideo && videoUrl ? (
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

              {/* Floating Top Controls */}
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

                <button
                  type="button"
                  onClick={() => setIsPlayerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition-colors shadow-xs cursor-pointer border border-white/20"
                  title="Close video player"
                >
                  <FaXmark size={13} />
                </button>
              </div>

              {/* Style Badge */}
              <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
                <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-semibold text-white/90 border border-white/15">
                  {activeMeta.fullName} · Living Video
                </span>
              </div>
            </>
          ) : isGenerating ? (
            /* Generating State */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
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
                  Applying AI camera paths and atmospheric audio for {activeMeta.shortTitle}...
                </p>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold-glow animate-pulse">
                  Processing video frames (approx. 10-30s)
                </span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Error Notice */}
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
              Click on <strong>Serene Drift Motion</strong> or <strong>Golden Hour Motion</strong> to generate or play videos.
            </>
          ) : (
            <>
              Previewing <strong>Serene Drift Motion</strong> and <strong>Golden Hour Motion</strong> — full AI generation arriving soon.
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
