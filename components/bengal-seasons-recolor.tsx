"use client";

import { useMemo, useState } from "react";
import {
  FaArrowsRotate,
  FaCamera,
  FaCheck,
  FaCloudShowersHeavy,
  FaCopy,
  FaSeedling,
  FaSnowflake,
  FaSpinner,
  FaSun,
  FaTree,
  FaWandMagicSparkles,
  FaWind,
} from "react-icons/fa6";
import {
  BENGAL_SEASONS,
  type BengalSeason,
  buildSeasonalCloudinaryUrl,
} from "@/lib/models/seasons";

interface BengalSeasonsRecolorProps {
  baseImageUrl: string;
  placeName: string;
  district?: string;
  className?: string;
}

export default function BengalSeasonsRecolor({
  baseImageUrl,
  placeName,
  district,
  className = "",
}: BengalSeasonsRecolorProps) {
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("original");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useCssFallback, setUseCssFallback] = useState<boolean>(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [showOriginalComparison, setShowOriginalComparison] = useState<boolean>(false);

  const activeSeason = useMemo<BengalSeason>(() => {
    return (
      BENGAL_SEASONS.find((s) => s.id === selectedSeasonId) || BENGAL_SEASONS[0]
    );
  }, [selectedSeasonId]);

  // Determine current image URL
  const currentImageUrl = useMemo(() => {
    if (showOriginalComparison || activeSeason.id === "original") {
      return baseImageUrl;
    }
    // If it's a Cloudinary URL and not in fallback mode, construct transformed URL
    if (baseImageUrl.includes("/image/upload/") && !useCssFallback) {
      return buildSeasonalCloudinaryUrl(baseImageUrl, activeSeason.transformation);
    }
    return baseImageUrl;
  }, [baseImageUrl, activeSeason, showOriginalComparison, useCssFallback]);

  const handleSeasonSelect = (seasonId: string) => {
    if (seasonId === selectedSeasonId) return;
    setIsLoading(true);
    setUseCssFallback(false);
    setSelectedSeasonId(seasonId);
    setShowOriginalComparison(false);
  };

  const copyHex = (hex: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(hex);
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 2500);
    }
  };

  const getSeasonIcon = (id: string) => {
    switch (id) {
      case "grishma":
        return <FaSun size={12} />;
      case "barsha":
        return <FaCloudShowersHeavy size={12} />;
      case "sharat":
        return <FaWind size={12} />;
      case "hemanta":
        return <FaSeedling size={12} />;
      case "sheet":
        return <FaSnowflake size={12} />;
      case "basanta":
        return <FaTree size={12} />;
      default:
        return <FaCamera size={12} />;
    }
  };

  return (
    <div
      className={`rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-sm space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-muted/15">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
              <FaWandMagicSparkles size={14} />
            </div>
            <h3
              className="text-xl sm:text-2xl font-light text-paper-text"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Six Seasons of Bengal · Atmospheric Simulation
            </h3>
          </div>
          <p
            className="mt-1 text-xs sm:text-sm italic text-paper-muted max-w-2xl"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Interactively simulate how {placeName || "this landmark"} breathes across Bengal&apos;s six seasonal atmospheres—from blazing summer heat to festive autumn reed fields and winter mist.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSeason.id !== "original" && (
            <button
              type="button"
              onMouseDown={() => setShowOriginalComparison(true)}
              onMouseUp={() => setShowOriginalComparison(false)}
              onTouchStart={() => setShowOriginalComparison(true)}
              onTouchEnd={() => setShowOriginalComparison(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-paper-muted/30 bg-paper-bg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-paper-text hover:border-terracotta hover:text-terracotta transition-all cursor-pointer shadow-2xs select-none"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              title="Hold to preview original photo"
            >
              <FaArrowsRotate size={11} />
              <span>{showOriginalComparison ? "Viewing Original" : "Hold for Original"}</span>
            </button>
          )}

          <span
            className="text-[11px] font-semibold uppercase tracking-wider text-terracotta"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            {activeSeason.seasonTag}
          </span>
        </div>
      </div>

      {/* Season Selection Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {BENGAL_SEASONS.map((season) => {
          const isSelected = selectedSeasonId === season.id;
          return (
            <button
              key={season.id}
              type="button"
              onClick={() => handleSeasonSelect(season.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer shadow-2xs ${
                isSelected
                  ? "bg-terracotta text-white border border-terracotta shadow-xs scale-105"
                  : "bg-paper-bg border border-paper-muted/30 text-paper-text hover:border-terracotta hover:text-terracotta"
              }`}
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <span className={isSelected ? "text-white" : "text-terracotta"}>
                {getSeasonIcon(season.id)}
              </span>
              <span>{season.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Season Atmosphere Card */}
      <div className="rounded-2xl border border-paper-muted/20 bg-paper-bg/70 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="text-base sm:text-lg font-medium text-terracotta"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              {activeSeason.name}
            </span>
            <span className="text-xs font-mono text-paper-muted font-medium">
              ({activeSeason.period})
            </span>
          </div>
          <p
            className="text-xs sm:text-sm font-semibold text-paper-text"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            {activeSeason.poeticAtmosphere}
          </p>
          <p
            className="text-xs sm:text-sm italic text-paper-muted leading-relaxed"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            {activeSeason.description}
          </p>
        </div>

        {/* 5-Color Seasonal Atmosphere Palette */}
        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
          <span
            className="text-[10px] font-bold uppercase tracking-wider text-paper-muted"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            Seasonal Palette
          </span>
          <div className="flex items-center gap-1.5">
            {activeSeason.paletteColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => copyHex(color)}
                className="group relative flex items-center justify-center cursor-pointer"
                title={`Copy ${color}`}
              >
                <div
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border border-paper-text/20 shadow-2xs hover:scale-120 transition-transform"
                  style={{ backgroundColor: color }}
                />
                <span className="pointer-events-none absolute -bottom-6 rounded bg-paper-text px-1 py-0.5 text-[8px] font-mono text-paper-bg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {copiedColor === color ? "Copied" : color}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Recolor Canvas */}
      <div className="relative max-w-full overflow-hidden rounded-2xl border border-paper-muted/20 bg-paper-bg p-2 flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-paper-card/75 backdrop-blur-xs gap-2 rounded-2xl">
            <FaSpinner size={24} className="animate-spin text-terracotta" />
            <span
              className="text-xs font-semibold uppercase tracking-wider text-paper-text"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Generating {activeSeason.name} Atmosphere…
            </span>
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImageUrl}
          alt={`${placeName} in ${activeSeason.name}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            // Gracefully switch to CSS filter fallback if Cloudinary Generative Recolor fails
            setIsLoading(false);
            setUseCssFallback(true);
          }}
          style={{
            filter:
              useCssFallback && !showOriginalComparison
                ? activeSeason.cssFilterFallback
                : undefined,
          }}
          className="max-h-96 sm:max-h-130 w-auto max-w-full rounded-xl object-contain block mx-auto shadow-xs transition-all duration-300"
        />

        {/* Seasonal Watermark Overlay Badge */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-full bg-paper-card/90 backdrop-blur-md px-3.5 py-1 border border-paper-muted/30 shadow-md text-paper-text text-[11px] font-medium flex items-center gap-2">
          <span className="text-terracotta">{getSeasonIcon(activeSeason.id)}</span>
          <span style={{ fontFamily: "var(--font-instrument), sans-serif" }}>
            {showOriginalComparison ? "Original Capture" : activeSeason.name}
          </span>
          {district && <span className="text-paper-muted">· {district}</span>}
        </div>
      </div>
    </div>
  );
}
