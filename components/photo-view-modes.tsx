"use client";

import { useMemo, useState } from "react";
import {
  FaCheck,
  FaCircleHalfStroke,
  FaImage,
  FaPalette,
  FaWandMagicSparkles,
} from "react-icons/fa6";

export const DEFAULT_BENGAL_PALETTE = [
  "#B5532F",
  "#EDE4D3",
  "#1B1A17",
  "#E3C27A",
  "#6B6458",
];

export type PhotoEffectId =
  | "normal"
  | "monochrome"
  | "enhance";

export interface EffectConfig {
  id: PhotoEffectId;
  label: string;
  badge: string;
  tagline: string;
  description: string;
  cloudinaryTransform: string;
  cssFilter: string;
}

export const PHOTO_EFFECTS: EffectConfig[] = [
  {
    id: "normal",
    label: "Normal View",
    badge: "Authentic Capture",
    tagline: "Natural Exposure",
    description: "Original, unedited photograph preserving true natural colors and ambient light.",
    cloudinaryTransform: "",
    cssFilter: "grayscale-0",
  },
  {
    id: "monochrome",
    label: "Monochrome",
    badge: "Archival Monochrome Film",
    tagline: "Satyajit Ray Tonal Depth",
    description: "Classic high-contrast black-and-white tonal depth evoking vintage cinematic film.",
    cloudinaryTransform: "e_grayscale",
    cssFilter: "grayscale contrast-110 brightness-98",
  },
  {
    id: "enhance",
    label: "AI Vivid Enhance",
    badge: "AI Dynamic Range & Clarity",
    tagline: "Intelligent Scene Balance",
    description: "AI-enhanced clarity, balanced shadows, and revitalized natural foliage and architecture.",
    cloudinaryTransform: "e_improve,e_vibrance:30",
    cssFilter: "contrast-110 saturate-130 brightness-102",
  },
];

export function getTransformedImageUrl(
  imageUrl: string,
  transform: string,
): string {
  if (!imageUrl || !transform) return imageUrl;
  if (imageUrl.includes("/image/upload/")) {
    const uploadPrefix = "/image/upload/";
    return imageUrl.replace(uploadPrefix, `${uploadPrefix}${transform}/`);
  }
  return imageUrl;
}

export function getMonochromeImageUrl(imageUrl: string): string {
  return getTransformedImageUrl(imageUrl, "e_grayscale");
}

interface PhotoViewModesProps {
  imageUrl: string;
  alt: string;
  colors?: string[];
  title?: string;
  className?: string;
}

export default function PhotoViewModes({
  imageUrl,
  alt,
  colors,
  title = "Captured Photograph",
  className = "",
}: PhotoViewModesProps) {
  const [activeEffect, setActiveEffect] = useState<PhotoEffectId>("normal");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const palette = useMemo(() => {
    if (Array.isArray(colors) && colors.length > 0) {
      return colors.slice(0, 5);
    }
    return DEFAULT_BENGAL_PALETTE;
  }, [colors]);

  const currentEffect = useMemo(() => {
    return (
      PHOTO_EFFECTS.find((e) => e.id === activeEffect) || PHOTO_EFFECTS[0]
    );
  }, [activeEffect]);

  const currentDisplayUrl = useMemo(() => {
    if (imageError || !currentEffect.cloudinaryTransform) {
      return imageUrl;
    }
    return getTransformedImageUrl(imageUrl, currentEffect.cloudinaryTransform);
  }, [imageUrl, currentEffect, imageError]);

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch {
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    }
  };

  const renderEffectIcon = (id: PhotoEffectId) => {
    switch (id) {
      case "normal":
        return <FaImage size={11} />;
      case "monochrome":
        return <FaCircleHalfStroke size={11} />;
      case "enhance":
        return <FaWandMagicSparkles size={11} />;
    }
  };

  return (
    <div
      className={`rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-sm space-y-6 ${className}`}
    >
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-paper-muted/15">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-terracotta text-white shadow-xs">
            <FaImage size={14} />
          </div>
          <div>
            <h3
              className="text-xl sm:text-2xl font-light text-paper-text"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              {title}
            </h3>
            <p className="text-xs text-paper-muted">
              Explore this landmark in authentic color, vintage monochrome film, or AI enhanced clarity
            </p>
          </div>
        </div>

        {/* Multi-Effect Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 rounded-2xl bg-paper-bg p-1 border border-paper-muted/20 shadow-xs max-w-full">
          {PHOTO_EFFECTS.map((effect) => {
            const isActive = activeEffect === effect.id;
            return (
              <button
                key={effect.id}
                type="button"
                onClick={() => {
                  setActiveEffect(effect.id);
                  setImageError(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-terracotta text-white shadow-xs"
                    : "text-paper-muted hover:text-paper-text hover:bg-paper-card/70"
                }`}
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                {renderEffectIcon(effect.id)}
                <span>{effect.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Uncropped Photograph Display with Active Effect Transformations */}
      <div className="relative max-w-full overflow-hidden rounded-2xl border border-paper-muted/20 bg-paper-bg p-2 sm:p-3 flex items-center justify-center shadow-xs min-h-70">
        {/* Dynamic Effect Badge Overlay */}
        {activeEffect !== "normal" && (
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-md px-3.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-white/95 border border-white/20 shadow-sm">
              <span className="text-gold-glow">
                {renderEffectIcon(activeEffect)}
              </span>
              <span>{currentEffect.badge}</span>
            </span>
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={currentDisplayUrl}
          src={currentDisplayUrl}
          alt={alt}
          onError={() => setImageError(true)}
          className={`max-h-96 sm:max-h-125 w-auto max-w-full rounded-xl object-contain block mx-auto transition-all duration-500 shadow-xs ${currentEffect.cssFilter}`}
        />
      </div>

      {/* Active Effect Subtitle & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-paper-bg/50 border border-paper-muted/15 text-xs text-paper-muted">
        <div className="flex items-center gap-2">
          <span
            className="font-semibold text-paper-text uppercase tracking-wider text-[10px]"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            {currentEffect.tagline}:
          </span>
          <span
            className="italic"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            {currentEffect.description}
          </span>
        </div>
        <span
          className="text-[10px] uppercase tracking-wider text-terracotta shrink-0 font-medium"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          {activeEffect === "normal" ? "Original View" : "Active Effect"}
        </span>
      </div>

      {/* Extracted Colors Section */}
      <div className="rounded-2xl border border-paper-muted/15 bg-paper-bg/60 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
            <FaPalette size={13} />
          </div>
          <div>
            <h4
              className="text-sm font-semibold text-paper-text"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Extracted Color Palette
            </h4>
            <p className="text-xs text-paper-muted">
              5 dominant tonal hues present in this landscape photograph
            </p>
          </div>
        </div>

        {/* Color Swatches Grid */}
        <div className="flex flex-wrap items-center gap-3">
          {palette.map((color) => {
            const isCopied = copiedColor === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => handleCopyColor(color)}
                className="group relative flex flex-col items-center gap-1 cursor-pointer focus:outline-none"
                title={`Copy hex ${color}`}
              >
                <div
                  className="h-8 w-8 rounded-full border border-paper-text/25 shadow-xs hover:scale-115 active:scale-95 transition-transform relative flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  {isCopied && (
                    <FaCheck
                      size={11}
                      className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] animate-scaleIn"
                    />
                  )}
                </div>
                <span className="text-[10px] font-mono text-paper-muted font-medium group-hover:text-terracotta transition-colors">
                  {isCopied ? "Copied" : color}
                </span>

                {/* Tooltip */}
                <span className="pointer-events-none absolute -top-8 rounded-md bg-paper-text px-2 py-0.5 text-[9px] font-mono text-paper-bg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-sm">
                  {isCopied ? "Copied to clipboard!" : `Click to copy ${color}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
