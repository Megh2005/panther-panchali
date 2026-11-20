"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LuArrowLeft,
  LuCalendar,
  LuCheck,
  LuClock,
  LuCompass,
  LuImagePlus,
  LuLoaderCircle,
  LuMapPin,
  LuRefreshCw,
  LuSend,
  LuSparkles,
  LuUpload,
} from "react-icons/lu";
import {
  KOLKATA_PLACES,
  POST_VIBES,
  TIMES_OF_DAY,
  YEAR_SPANS,
} from "@/lib/constants/kolkata-places";
import type { KolkataPlace, PostVibe, TimeOfDay, YearSpan } from "@/lib/models/post";

export default function CreatePostStudio() {
  const router = useRouter();

  // Wizard or generation step: 1 = Configure & Upload, 2 = Review & Edit Post
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(KOLKATA_PLACES[0].id);
  const [selectedTime, setSelectedTime] = useState<TimeOfDay>("Twilight");
  const [selectedYearSpan, setSelectedYearSpan] = useState<YearSpan>("Pooja");
  const [selectedVibe, setSelectedVibe] = useState<PostVibe>("Aesthetic"); // Aesthetic default
  const [userPromptNotes, setUserPromptNotes] = useState<string>("");

  // Loading & Generation State
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generated Result from Cloudinary AI & Gemini
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
  const [revampedImageUrl, setRevampedImageUrl] = useState<string>("");
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [caption, setCaption] = useState<string>("");
  const [hashtagsText, setHashtagsText] = useState<string>("");

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("Image size should be under 8MB.");
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Revamp & Gemini Caption Synthesis
  const handleSynthesizePost = async () => {
    if (!imagePreview) {
      setErrorMessage("Please upload an image before proceeding.");
      return;
    }

    setIsSynthesizing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageSource: imagePreview,
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
      setStep(2); // Advance to editable review
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

  // Publish Post to Kolkata Feed
  const handlePublishPost = async () => {
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

      // Redirect directly to the Kolkata Feed
      router.push("/explore");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to publish post.",
      );
      setIsPublishing(false);
    }
  };

  const selectedPlace =
    KOLKATA_PLACES.find((p) => p.id === selectedPlaceId) || KOLKATA_PLACES[0];

  return (
    <div className="w-full max-w-4xl mx-auto py-2">
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-terracotta/30 bg-terracotta/10 px-5 py-3.5 text-sm text-terracotta text-center"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          {errorMessage}
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 1: CONFIGURE & UPLOAD                                   */}
      {/* ============================================================ */}
      {step === 1 && (
        <div className="flex flex-col gap-8 rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-10 shadow-sm">
          {/* Section 1: Upload Image */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                Step 01
              </span>
              <span className="text-xs text-paper-muted">·</span>
              <span className="text-xs font-medium text-paper-muted">
                Your Kolkata Moment
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-light tracking-normal text-paper-text"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Upload your photo
            </h2>
            <p
              className="mt-1 text-sm italic text-paper-muted"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Choose any photo from your device. It will be reimagined through the
              sensory atmosphere and heritage palettes of Kolkata.
            </p>

            <div className="mt-5">
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-2xl border border-paper-muted/30 bg-paper-bg max-w-lg mx-auto aspect-video">
                  <Image
                    src={imagePreview}
                    alt="Upload preview"
                    fill
                    className="object-cover"
                  />
                  <label
                    htmlFor="image-upload"
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-paper-text/80 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-paper-bg hover:bg-terracotta transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <LuRefreshCw size={13} />
                    <span>Change Photo</span>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </div>
              ) : (
                <label
                  htmlFor="image-upload-empty"
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-paper-muted/35 bg-paper-bg/60 p-8 text-center hover:border-terracotta hover:bg-paper-bg transition-all cursor-pointer group"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/10 text-terracotta mb-3 group-hover:scale-110 transition-transform">
                    <LuUpload size={24} />
                  </div>
                  <span
                    className="text-sm font-semibold uppercase tracking-[0.16em] text-paper-text"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    Click or drag photo here
                  </span>
                  <span
                    className="mt-1 text-xs text-paper-muted"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    Supports JPG, PNG, WebP up to 8MB
                  </span>
                  <input
                    id="image-upload-empty"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="h-px w-full bg-paper-muted/15" />

          {/* Section 2: Choose Kolkata Place */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                Step 02
              </span>
              <span className="text-xs text-paper-muted">·</span>
              <span className="text-xs font-medium text-paper-muted">
                Landmark of the City
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-light tracking-normal text-paper-text"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Where in Kolkata is this set?
            </h2>
            <p
              className="mt-1 text-sm italic text-paper-muted"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Select the heritage landmark or neighborhood to anchor your story.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {KOLKATA_PLACES.map((place: KolkataPlace) => {
                const isSelected = selectedPlaceId === place.id;
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => setSelectedPlaceId(place.id)}
                    className={`flex flex-col justify-between p-4 rounded-xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? "bg-paper-bg border-terracotta ring-2 ring-terracotta/40 shadow-xs"
                        : "bg-paper-bg/60 border-paper-muted/20 hover:border-terracotta/40 hover:bg-paper-bg"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className="text-base font-light tracking-normal text-paper-text"
                          style={{ fontFamily: "var(--font-fraunces), serif" }}
                        >
                          {place.name}
                        </span>
                        <span
                          className="block text-xs text-terracotta mt-0.5"
                          style={{ fontFamily: "var(--font-newsreader), serif" }}
                        >
                          {place.bengaliName} · {place.area}
                        </span>
                      </div>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                          isSelected
                            ? "bg-terracotta text-paper-bg border-terracotta"
                            : "border-paper-muted/30 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                    <p
                      className="mt-2 text-xs italic text-paper-muted leading-relaxed"
                      style={{ fontFamily: "var(--font-newsreader), serif" }}
                    >
                      {place.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-paper-muted/15" />

          {/* Section 3: Time of Day */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                Step 03
              </span>
              <span className="text-xs text-paper-muted">·</span>
              <span className="text-xs font-medium text-paper-muted">
                Atmospheric Light
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-light tracking-normal text-paper-text"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-all cursor-pointer ${
                      isSelected
                        ? "bg-terracotta text-white shadow-xs"
                        : "bg-paper-bg border border-paper-muted/25 text-paper-text hover:border-terracotta hover:text-terracotta"
                    }`}
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <LuClock size={13} />
                    <span>{time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-paper-muted/15" />

          {/* Section 4: Span of the Year (Festivals / Seasons) */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                Step 04
              </span>
              <span className="text-xs text-paper-muted">·</span>
              <span className="text-xs font-medium text-paper-muted">
                Span of the Year
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-light tracking-normal text-paper-text"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Season & Festival
            </h2>
            <p
              className="mt-1 text-sm italic text-paper-muted"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Including Poila Baisakh, Durga Pooja, and Deepavali illuminations.
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {YEAR_SPANS.map((span) => {
                const isSelected = selectedYearSpan === span;
                return (
                  <button
                    key={span}
                    type="button"
                    onClick={() => setSelectedYearSpan(span)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-all cursor-pointer ${
                      isSelected
                        ? "bg-terracotta text-white shadow-xs"
                        : "bg-paper-bg border border-paper-muted/25 text-paper-text hover:border-terracotta hover:text-terracotta"
                    }`}
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <LuCalendar size={13} />
                    <span>{span}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-paper-muted/15" />

          {/* Section 5: The Vibe (Aesthetic by default) */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
                Step 05
              </span>
              <span className="text-xs text-paper-muted">·</span>
              <span className="text-xs font-medium text-paper-muted">
                Emotional Resonance
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-light tracking-normal text-paper-text"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Choose the Vibe (Default: Aesthetic)
            </h2>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {POST_VIBES.map((item) => {
                const isSelected = selectedVibe === item.vibe;
                return (
                  <button
                    key={item.vibe}
                    type="button"
                    onClick={() => setSelectedVibe(item.vibe)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-paper-bg border-terracotta ring-2 ring-terracotta/40 shadow-xs"
                        : "bg-paper-bg/60 border-paper-muted/20 hover:border-terracotta/40 hover:bg-paper-bg"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-semibold uppercase tracking-[0.14em] text-paper-text"
                        style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                      >
                        {item.vibe}
                      </span>
                      {isSelected && (
                        <LuCheck size={14} className="text-terracotta" />
                      )}
                    </div>
                    <p
                      className="mt-1 text-xs italic text-paper-muted leading-tight"
                      style={{ fontFamily: "var(--font-newsreader), serif" }}
                    >
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label
              htmlFor="prompt-notes"
              className="block text-xs font-semibold uppercase tracking-[0.16em] text-paper-muted mb-2"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Personal Memory or Detail (Optional)
            </label>
            <input
              id="prompt-notes"
              type="text"
              value={userPromptNotes}
              onChange={(e) => setUserPromptNotes(e.target.value)}
              placeholder="e.g. Sipping hot tea from clay cups while watching trams go by..."
              className="w-full rounded-xl border border-paper-muted/25 bg-paper-bg px-4 py-2.5 text-sm text-paper-text focus:outline-none focus:ring-2 focus:ring-terracotta"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            />
          </div>

          {/* CTA: Revamp & Generate */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSynthesizePost}
              disabled={isSynthesizing || !imagePreview}
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-8 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition-all hover:bg-paper-text disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              {isSynthesizing ? (
                <>
                  <LuLoaderCircle size={16} className="animate-spin" />
                  <span>Revamping Kolkata Atmosphere…</span>
                </>
              ) : (
                <>
                  <LuSparkles size={16} />
                  <span>Revamp & Generate Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: REVIEW & EDIT EVERYTHING EXCEPT IMAGE                */}
      {/* ============================================================ */}
      {step === 2 && (
        <div className="flex flex-col gap-7 rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-10 shadow-sm animate-fadeIn">
          {/* Top Return Button */}
          <div className="flex items-center justify-between pb-4 border-b border-paper-muted/15">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-paper-muted hover:text-terracotta transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <LuArrowLeft size={14} />
              <span>Adjust Inputs</span>
            </button>
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Review & Publish
            </span>
          </div>

          {/* 1. Revamped Image (Fixed, non-editable) */}
          <div className="relative overflow-hidden rounded-2xl border border-paper-muted/25 bg-paper-bg shadow-sm">
            <div className="relative w-full aspect-video sm:aspect-16/10">
              <Image
                src={revampedImageUrl || originalImageUrl}
                alt={selectedPlace.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Live Atmosphere Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-paper-text/80 backdrop-blur-md px-3.5 py-1.5 text-xs text-paper-bg">
              <span className="h-2 w-2 rounded-full bg-gold-glow animate-pulse" />
              <span style={{ fontFamily: "var(--font-instrument), sans-serif" }}>
                Revamped for Kolkata · {selectedVibe} Vibe
              </span>
            </div>
          </div>

          {/* 2. Extracted Color Palette from Cloudinary AI */}
          {extractedColors.length > 0 && (
            <div className="p-4 rounded-xl border border-paper-muted/20 bg-paper-bg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LuSparkles size={16} className="text-terracotta" />
                <span
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-paper-text"
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
                      className="h-7 w-7 rounded-full border border-paper-text/20 shadow-xs cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                    <span className="pointer-events-none absolute -bottom-7 rounded-md bg-paper-text px-1.5 py-0.5 text-[10px] font-mono text-paper-bg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Editable Post Details (User can tweak everything except image) */}
          <div className="space-y-5">
            {/* Tagged Location */}
            <div>
              <label
                htmlFor="edit-place"
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-terracotta mb-2"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Tagged Landmark
              </label>
              <select
                id="edit-place"
                value={selectedPlaceId}
                onChange={(e) => setSelectedPlaceId(e.target.value)}
                className="w-full rounded-xl border border-paper-muted/25 bg-paper-bg px-4 py-2.5 text-sm text-paper-text focus:outline-none focus:ring-2 focus:ring-terracotta cursor-pointer"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                {KOLKATA_PLACES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.bengaliName}) — {p.area}
                  </option>
                ))}
              </select>
            </div>

            {/* Editable Plain Text Caption */}
            <div>
              <label
                htmlFor="edit-caption"
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-terracotta mb-2"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Post Caption (Plain Text)
              </label>
              <textarea
                id="edit-caption"
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full rounded-xl border border-paper-muted/25 bg-paper-bg p-4 text-base italic text-paper-text leading-relaxed focus:outline-none focus:ring-2 focus:ring-terracotta"
                style={{ fontFamily: "var(--font-newsreader), serif" }}
              />
            </div>

            {/* Editable Hashtags */}
            <div>
              <label
                htmlFor="edit-hashtags"
                className="block text-xs font-semibold uppercase tracking-[0.18em] text-terracotta mb-2"
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
                className="w-full rounded-xl border border-paper-muted/25 bg-paper-bg px-4 py-2.5 text-sm font-medium text-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              />
            </div>

            {/* Context Pill Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="edit-time"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-paper-muted mb-1"
                >
                  Time
                </label>
                <select
                  id="edit-time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value as TimeOfDay)}
                  className="w-full rounded-xl border border-paper-muted/25 bg-paper-bg px-3 py-2 text-xs text-paper-text cursor-pointer"
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
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-paper-muted mb-1"
                >
                  Span of Year
                </label>
                <select
                  id="edit-span"
                  value={selectedYearSpan}
                  onChange={(e) => setSelectedYearSpan(e.target.value as YearSpan)}
                  className="w-full rounded-xl border border-paper-muted/25 bg-paper-bg px-3 py-2 text-xs text-paper-text cursor-pointer"
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
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-paper-muted mb-1"
                >
                  Vibe
                </label>
                <select
                  id="edit-vibe"
                  value={selectedVibe}
                  onChange={(e) => setSelectedVibe(e.target.value as PostVibe)}
                  className="w-full rounded-xl border border-paper-muted/25 bg-paper-bg px-3 py-2 text-xs text-paper-text cursor-pointer"
                >
                  {POST_VIBES.map((v) => (
                    <option key={v.vibe} value={v.vibe}>
                      {v.vibe}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-paper-muted/15 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 rounded-full border border-paper-muted/25 bg-paper-bg px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-paper-text hover:border-terracotta cursor-pointer"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handlePublishPost}
              disabled={isPublishing}
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-8 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition-all hover:bg-paper-text disabled:opacity-60 cursor-pointer"
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
      )}
    </div>
  );
}
