"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LuArrowLeft,
  LuCalendar,
  LuClock,
  LuLoaderCircle,
  LuSend,
  LuSparkles,
} from "react-icons/lu";
import {
  KOLKATA_PLACES,
  POST_VIBES,
  TIMES_OF_DAY,
  YEAR_SPANS,
} from "@/lib/constants/kolkata-places";
import type { PostVibe, TimeOfDay, YearSpan } from "@/lib/models/post";

export default function CreatePostStudio() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(
    KOLKATA_PLACES[0].id,
  );
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>("Twilight");
  const [selectedYearSpan, setSelectedYearSpan] = useState<YearSpan>("Pooja");
  const [selectedVibe, setSelectedVibe] = useState<PostVibe>("Aesthetic");
  const [userPromptNotes, setUserPromptNotes] = useState<string>("");

  // Loading & Generation State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generated Result from Media Synthesis & Poetic Prose
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
  const [revampedImageUrl, setRevampedImageUrl] = useState<string>("");
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [caption, setCaption] = useState<string>("");
  const [hashtagsText, setHashtagsText] = useState<string>("");

  const handleSynthesizePost = async () => {
    setIsSynthesizing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: selectedPlaceId,
          timeOfDay: selectedTime,
          yearSpan: selectedYearSpan,
          vibe: selectedVibe,
          userPromptNotes: userPromptNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to synthesize your post.");
      }

      setOriginalImageUrl(data.originalImageUrl);
      setRevampedImageUrl(data.revampedImageUrl);
      setExtractedColors(data.extractedColors || []);
      setCaption(data.caption);
      setHashtagsText(
        Array.isArray(data.hashtags) ? data.hashtags.join(" ") : "",
      );
      setStep(2);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Could not synthesize post. Please try again.",
      );
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handlePublishPost = async (redirectToExplore = true) => {
    if (!caption.trim()) {
      setErrorMessage("Caption cannot be empty.");
      return;
    }

    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const hashtagsArray = hashtagsText
        .split(/\s+/)
        .filter((tag) => tag.trim().length > 0)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalImageUrl,
          revampedImageUrl,
          placeId: selectedPlaceId,
          timeOfDay: selectedTime,
          yearSpan: selectedYearSpan,
          vibe: selectedVibe,
          caption: caption.trim(),
          hashtags: hashtagsArray,
          extractedColors,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish post.");
      }

      // Reset studio state so user can immediately create another post
      setStep(1);
      setSelectedPlaceId(KOLKATA_PLACES[0].id);
      setSelectedTime("Twilight");
      setSelectedYearSpan("Pooja");
      setSelectedVibe("Aesthetic");
      setUserPromptNotes("");
      setOriginalImageUrl("");
      setRevampedImageUrl("");
      setExtractedColors([]);
      setCaption("");
      setHashtagsText("");

      if (redirectToExplore) {
        router.push("/explore");
        router.refresh();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to publish post.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedPlace =
    KOLKATA_PLACES.find((p) => p.id === selectedPlaceId) || KOLKATA_PLACES[0];

  const vibeDescriptions: Record<PostVibe, string> = {
    Aesthetic: "Nostalgic film grain, muted warm earth tones, timeless charm",
    Happy: "Sun-drenched golden warmth, buoyant streets, vibrant yellow cabs",
    Sad: "Quiet monsoon shadows, lone trams, poignant emotional depth",
    Melancholy: "Wistful river mist, faded colonial facades, vintage sepia",
    Dazzling: "Gleaming festival illumination, vivid pandal lights, celebration",
    Party: "Lively carnival rhythm, evening crowd hum, festive exuberance",
  };

  return (
    <div className="relative w-full max-w-[95vw] lg:max-w-[70vw] mx-auto py-4">
      {/* Warm ambient background glow consistent with Landing Page */}
      <div
        className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 h-[50vw] max-h-[500px] w-[50vw] max-w-[700px] rounded-full bg-radial from-[#E3C27A]/25 via-[#E3C27A]/5 to-transparent blur-3xl opacity-75"
        aria-hidden="true"
      />

      {errorMessage && (
        <div
          role="alert"
          className="relative z-10 mb-6 rounded-2xl border border-[#B5532F]/40 bg-[#B5532F]/10 px-5 py-3.5 text-sm text-[#B5532F] text-center font-medium shadow-xs"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          {errorMessage}
        </div>
      )}

      {/* STEP 1: CONFIGURE & SYNTHESIZE */}
      {step === 1 && (
        <div className="relative z-10 flex flex-col gap-8 rounded-3xl border border-[#6B6458]/20 bg-[#EDE4D3] p-6 sm:p-10 shadow-[0_8px_32px_rgba(27,26,23,0.06),0_18px_48px_rgba(227,194,122,0.18)]">
          {/* Studio Header */}
          <div className="border-b border-[#6B6458]/15 pb-6">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Post Studio · Panther Panchali
              </span>
            </div>
            <h1
              className="text-3xl sm:text-5xl font-light tracking-normal leading-[1.05] text-[#1B1A17]"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
              }}
            >
              Craft a Kolkata Memory
            </h1>
            <p
              className="mt-3 text-base sm:text-lg italic text-[#6B6458] max-w-2xl leading-relaxed"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Select an iconic landmark, season, and atmospheric vibe. An authentic
              photograph and poetic plain-text reflection will be synthesized from your choices.
            </p>
          </div>

          {/* Section 1: Choose Landmark */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Step 01 · Landmark
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-light tracking-normal text-[#1B1A17]"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
              }}
            >
              Choose the Landmark
            </h2>
            <p
              className="mt-1 text-sm italic text-[#6B6458]"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Every post is anchored to an exact heritage location with coordinates.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {KOLKATA_PLACES.map((place) => {
                const isSelected = selectedPlaceId === place.id;
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => setSelectedPlaceId(place.id)}
                    className={`flex flex-col justify-between p-4 rounded-2xl transition-all duration-300 text-left cursor-pointer ${
                      isSelected
                        ? "bg-[#B5532F] text-white border-2 border-[#B5532F] ring-2 ring-[#B5532F]/40 shadow-md scale-[1.02]"
                        : "bg-[#F6F1E6] border border-[#6B6458]/25 text-[#1B1A17] hover:border-[#B5532F] hover:bg-[#F6F1E6]/90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`text-base tracking-normal block ${
                            isSelected
                              ? "font-semibold text-white"
                              : "font-normal text-[#1B1A17]"
                          }`}
                          style={{
                            fontFamily: "var(--font-fraunces), serif",
                            fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
                          }}
                        >
                          {place.name}
                        </span>
                        <span
                          className={`block text-xs font-medium uppercase tracking-wider mt-0.5 ${
                            isSelected ? "text-[#E3C27A] font-bold" : "text-[#6B6458]"
                          }`}
                          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                        >
                          {place.area}
                        </span>
                      </div>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                          isSelected
                            ? "bg-[#E3C27A] text-[#1B1A17] border-[#E3C27A] shadow-xs"
                            : "border-[#6B6458]/30 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                    <p
                      className={`mt-2 text-xs italic leading-relaxed ${
                        isSelected ? "text-white/95" : "text-[#6B6458]"
                      }`}
                      style={{ fontFamily: "var(--font-newsreader), serif" }}
                    >
                      {place.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-[#6B6458]/15" />

          {/* Section 2: Time of Day */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Step 02 · Light
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-light tracking-normal text-[#1B1A17]"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
              }}
            >
              Time of Day
            </h2>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {TIMES_OF_DAY.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition-all duration-300 cursor-pointer shadow-xs ${
                      isSelected
                        ? "bg-[#B5532F] text-white font-bold border-2 border-[#B5532F] ring-2 ring-[#B5532F]/40 scale-105 shadow-md"
                        : "bg-[#F6F1E6] border border-[#6B6458]/30 text-[#1B1A17] font-medium hover:border-[#B5532F] hover:text-[#B5532F] hover:scale-105"
                    }`}
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <LuClock size={14} className={isSelected ? "text-[#E3C27A]" : "text-[#B5532F]"} />
                    <span>{time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-[#6B6458]/15" />

          {/* Section 3: Span of the Year */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Step 03 · Season
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-light tracking-normal text-[#1B1A17]"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
              }}
            >
              Span of the Year
            </h2>
            <p
              className="mt-1 text-sm italic text-[#6B6458]"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Includes Poila Baisakh, Durga Pooja, and Deepavali.
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {YEAR_SPANS.map((span) => {
                const isSelected = selectedYearSpan === span;
                return (
                  <button
                    key={span}
                    type="button"
                    onClick={() => setSelectedYearSpan(span)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition-all duration-300 cursor-pointer shadow-xs ${
                      isSelected
                        ? "bg-[#B5532F] text-white font-bold border-2 border-[#B5532F] ring-2 ring-[#B5532F]/40 scale-105 shadow-md"
                        : "bg-[#F6F1E6] border border-[#6B6458]/30 text-[#1B1A17] font-medium hover:border-[#B5532F] hover:text-[#B5532F] hover:scale-105"
                    }`}
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <LuCalendar size={14} className={isSelected ? "text-[#E3C27A]" : "text-[#B5532F]"} />
                    <span>{span}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-[#6B6458]/15" />

          {/* Section 4: The Vibe (Default: Aesthetic) */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Step 04 · Vibe (Default: Aesthetic)
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-light tracking-normal text-[#1B1A17]"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
              }}
            >
              Choose the Vibe
            </h2>
            <p
              className="mt-1 text-sm italic text-[#6B6458]"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Shapes the color contrast, film texture, and poetic rhythm.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {POST_VIBES.map((vibe) => {
                const isSelected = selectedVibe === vibe;
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => setSelectedVibe(vibe)}
                    className={`p-4 rounded-2xl text-left transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "bg-[#B5532F] text-white border-2 border-[#B5532F] ring-2 ring-[#B5532F]/40 shadow-md scale-[1.02]"
                        : "bg-[#F6F1E6] border border-[#6B6458]/25 text-[#1B1A17] hover:border-[#B5532F] hover:bg-[#F6F1E6]/90"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-base ${
                          isSelected
                            ? "font-semibold text-white"
                            : "font-normal text-[#1B1A17]"
                        }`}
                        style={{
                          fontFamily: "var(--font-fraunces), serif",
                          fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
                        }}
                      >
                        {vibe}
                      </span>
                      {vibe === "Aesthetic" && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            isSelected
                              ? "bg-[#E3C27A] text-[#1B1A17] font-bold"
                              : "bg-[#E3C27A]/40 text-[#1B1A17]"
                          }`}
                        >
                          Default
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1.5 text-xs italic leading-relaxed ${
                        isSelected ? "text-white/95" : "text-[#6B6458]"
                      }`}
                      style={{ fontFamily: "var(--font-newsreader), serif" }}
                    >
                      {vibeDescriptions[vibe]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-[#6B6458]/15" />

          {/* Section 5: Memory Story Notes (Optional) */}
          <div>
            <label
              htmlFor="prompt-notes"
              className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#B5532F] mb-2"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Personal Memory or Detail (Optional)
            </label>
            <input
              id="prompt-notes"
              type="text"
              value={userPromptNotes}
              onChange={(e) => setUserPromptNotes(e.target.value)}
              placeholder="e.g. Yellow taxis queued near the ghats, rain puddles, festive dhak drummers..."
              className="w-full rounded-2xl border border-[#6B6458]/25 bg-[#F6F1E6] px-5 py-3 text-sm text-[#1B1A17] placeholder:text-[#6B6458]/60 focus:outline-none focus:ring-2 focus:ring-[#B5532F]"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            />
          </div>

          {/* Generate Button Styled Identical to Landing Page Primary CTA */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSynthesizePost}
              disabled={isSynthesizing}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#B5532F] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition-all duration-300 hover:bg-[#1B1A17] hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              {isSynthesizing ? (
                <>
                  <LuLoaderCircle size={16} className="animate-spin" />
                  <span>Synthesizing Kolkata Memory…</span>
                </>
              ) : (
                <>
                  <LuSparkles size={16} />
                  <span>Synthesize Kolkata Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: REVIEW & EDIT EVERYTHING */}
      {step === 2 && (
        <div className="relative z-10 flex flex-col gap-7 rounded-3xl border border-[#6B6458]/20 bg-[#EDE4D3] p-6 sm:p-10 shadow-[0_8px_32px_rgba(27,26,23,0.06),0_18px_48px_rgba(227,194,122,0.18)] animate-fadeIn">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#6B6458]/15">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#6B6458] hover:text-[#B5532F] transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <LuArrowLeft size={14} />
              <span>Back to Settings</span>
            </button>
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Review & Edit Post
            </span>
          </div>

          {/* 1. Generated 1:1 Square Image */}
          <div className="relative overflow-hidden rounded-2xl border border-[#6B6458]/25 bg-[#F6F1E6] shadow-sm max-w-md mx-auto w-full">
            <div className="relative w-full aspect-square">
              <Image
                src={revampedImageUrl || originalImageUrl}
                alt={selectedPlace.name}
                fill
                sizes="(max-width: 640px) 100vw, 448px"
                className="object-cover"
              />
            </div>
            {/* Live Atmosphere Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-[#1B1A17]/85 backdrop-blur-md px-3.5 py-1.5 text-xs text-white">
              <span className="h-2 w-2 rounded-full bg-[#E3C27A] animate-pulse" />
              <span style={{ fontFamily: "var(--font-instrument), sans-serif" }}>
                Generated for Kolkata · {selectedVibe} Vibe
              </span>
            </div>
          </div>

          {/* 2. Extracted Color Palette */}
          {extractedColors.length > 0 && (
            <div className="p-4 rounded-2xl border border-[#6B6458]/20 bg-[#F6F1E6] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LuSparkles size={16} className="text-[#B5532F]" />
                <span
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1B1A17]"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  Extracted Palette:
                </span>
              </div>
              <div className="flex items-center gap-2">
                {extractedColors.map((color) => (
                  <div
                    key={color}
                    className="group relative flex items-center justify-center"
                  >
                    <div
                      className="h-7 w-7 rounded-full border border-[#1B1A17]/20 shadow-xs cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                    <span className="pointer-events-none absolute -bottom-7 rounded-md bg-[#1B1A17] px-1.5 py-0.5 text-[10px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Editable Post Details */}
          <div className="space-y-5">
            {/* Tagged Location */}
            <div>
              <label
                htmlFor="edit-place"
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#B5532F] mb-2"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Tagged Landmark
              </label>
              <select
                id="edit-place"
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full rounded-2xl border border-[#6B6458]/25 bg-[#F6F1E6] px-4 py-3 text-sm text-[#1B1A17] focus:outline-none focus:ring-2 focus:ring-[#B5532F] cursor-pointer"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                {KOLKATA_PLACES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.area}
                  </option>
                ))}
              </select>
            </div>

            {/* Editable Plain Text Caption */}
            <div>
              <label
                htmlFor="edit-caption"
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#B5532F] mb-2"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Post Caption (Plain Text)
              </label>
              <textarea
                id="edit-caption"
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full rounded-2xl border border-[#6B6458]/25 bg-[#F6F1E6] p-4 text-base italic text-[#1B1A17] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#B5532F]"
                style={{ fontFamily: "var(--font-newsreader), serif" }}
              />
            </div>

            {/* Editable Hashtags */}
            <div>
              <label
                htmlFor="edit-hashtags"
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#B5532F] mb-2"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Hashtags
              </label>
              <input
                id="edit-hashtags"
                type="text"
                value={hashtagsText}
                onChange={(e) => setHashtagsText(e.target.value)}
                placeholder="#Kolkata #CityOfJoy #DurgaPuja"
                className="w-full rounded-2xl border border-[#6B6458]/25 bg-[#F6F1E6] px-4 py-3 text-sm font-medium text-[#B5532F] focus:outline-none focus:ring-2 focus:ring-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              />
            </div>

            {/* Context Pill Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="edit-time"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#6B6458] mb-1"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  Time
                </label>
                <select
                  id="edit-time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value as TimeOfDay)}
                  className="w-full rounded-2xl border border-[#6B6458]/25 bg-[#F6F1E6] px-3 py-2.5 text-xs text-[#1B1A17] cursor-pointer"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  {TIMES_OF_DAY.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-span"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#6B6458] mb-1"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  Span of Year
                </label>
                <select
                  id="edit-span"
                  value={selectedYearSpan}
                  onChange={(e) => setSelectedYearSpan(e.target.value as YearSpan)}
                  className="w-full rounded-2xl border border-[#6B6458]/25 bg-[#F6F1E6] px-3 py-2.5 text-xs text-[#1B1A17] cursor-pointer"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  {YEAR_SPANS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="edit-vibe"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#6B6458] mb-1"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  Vibe
                </label>
                <select
                  id="edit-vibe"
                  value={selectedVibe}
                  onChange={(e) => setSelectedVibe(e.target.value as PostVibe)}
                  className="w-full rounded-2xl border border-[#6B6458]/25 bg-[#F6F1E6] px-3 py-2.5 text-xs text-[#1B1A17] cursor-pointer"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  {POST_VIBES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-[#6B6458]/15 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#6B6458]/35 bg-[#F6F1E6] px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1B1A17] transition-all duration-300 hover:border-[#B5532F] hover:text-[#B5532F] hover:scale-105 cursor-pointer"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <span>Back</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void handlePublishPost(false)}
                disabled={isPublishing}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#B5532F] bg-[#F6F1E6] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#B5532F] transition-all duration-300 hover:bg-[#B5532F] hover:text-white hover:scale-105 disabled:opacity-60 cursor-pointer"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                <LuSparkles size={14} />
                <span>Publish & Create Another</span>
              </button>

              <button
                type="button"
                onClick={() => void handlePublishPost(true)}
                disabled={isPublishing}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#B5532F] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition-all duration-300 hover:bg-[#1B1A17] hover:scale-105 disabled:opacity-60 cursor-pointer"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                {isPublishing ? (
                  <>
                    <LuLoaderCircle size={16} className="animate-spin" />
                    <span>Publishing to Feed…</span>
                  </>
                ) : (
                  <>
                    <LuSend size={15} />
                    <span>Publish to Kolkata Feed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
