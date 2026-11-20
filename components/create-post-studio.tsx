"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LuArrowLeft,
  LuCalendar,
  LuCheck,
  LuClock,
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
          className="mb-6 rounded-2xl border border-[#B5532F]/40 bg-[#B5532F]/10 px-5 py-3.5 text-sm text-[#B5532F] text-center font-medium"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          {errorMessage}
        </div>
      )}

      {/* STEP 1: CONFIGURE & UPLOAD */}
      {step === 1 && (
        <div className="flex flex-col gap-8 rounded-3xl border border-[#6B6458]/20 bg-[#EDE4D3] p-6 sm:p-10 shadow-sm">
          {/* Section 1: Upload Image */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]">
                Step 01
              </span>
              <span className="text-xs text-[#6B6458]">·</span>
              <span className="text-xs font-medium text-[#6B6458]">
                Your Photograph
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-light tracking-normal text-[#1B1A17]"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Upload your photo
            </h2>
            <p
              className="mt-1 text-sm italic text-[#6B6458]"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Select any photo from your device. It will be revamping through the
              sensory color palettes and atmospheres of Kolkata.
            </p>

            <div className="mt-5">
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-2xl border border-[#6B6458]/30 bg-[#F6F1E6] max-w-md mx-auto aspect-square shadow-sm">
                  <Image
                    src={imagePreview}
                    alt="Upload preview"
                    fill
                    sizes="(max-width: 640px) 100vw, 448px"
                    className="object-cover"
                  />
                  <label
                    htmlFor="image-upload"
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-[#1B1A17]/85 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#B5532F] transition-colors cursor-pointer"
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
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#6B6458]/35 bg-[#F6F1E6]/60 p-8 text-center hover:border-[#B5532F] hover:bg-[#F6F1E6] transition-all cursor-pointer group"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#B5532F]/10 text-[#B5532F] mb-3 group-hover:scale-110 transition-transform">
                    <LuUpload size={24} />
                  </div>
                  <span
                    className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1B1A17]"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    Click or drag photo here
                  </span>
                  <span
                    className="mt-1 text-xs text-[#6B6458]"
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

          <div className="h-px w-full bg-[#6B6458]/15" />

          {/* Section 2: Choose Exact Kolkata Place */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]">
                Step 02
              </span>
              <span className="text-xs text-[#6B6458]">·</span>
              <span className="text-xs font-medium text-[#6B6458]">
                Iconic Landmark
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-light tracking-normal text-[#1B1A17]"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Select Place of Kolkata
            </h2>
            <p
              className="mt-1 text-sm italic text-[#6B6458]"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Choose an exact landmark of the city to anchor your post.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {KOLKATA_PLACES.map((place: KolkataPlace) => {
                const isSelected = selectedPlaceId === place.id;
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => setSelectedPlaceId(place.id)}
                    className={`flex flex-col justify-between p-4 rounded-xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? "bg-[#F6F1E6] border-2 border-[#B5532F] ring-2 ring-[#B5532F]/30 shadow-sm"
                        : "bg-[#F6F1E6]/75 border border-[#6B6458]/20 hover:border-[#B5532F]/50 hover:bg-[#F6F1E6]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`text-base tracking-normal block ${
                            isSelected
                              ? "font-semibold text-[#B5532F]"
                              : "font-normal text-[#1B1A17]"
                          }`}
                          style={{ fontFamily: "var(--font-fraunces), serif" }}
                        >
                          {place.name}
                        </span>
                        <span
                          className="block text-xs font-medium uppercase tracking-wider text-[#6B6458] mt-0.5"
                          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                        >
                          {place.area}
                        </span>
                      </div>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                          isSelected
                            ? "bg-[#B5532F] text-white border-[#B5532F]"
                            : "border-[#6B6458]/30 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                    <p
                      className="mt-2 text-xs italic text-[#6B6458] leading-relaxed"
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

          {/* Section 3: Time of Day Badges (High Contrast Selected State) */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]">
                Step 03
              </span>
              <span className="text-xs text-[#6B6458]">·</span>
              <span className="text-xs font-medium text-[#6B6458]">
                Atmospheric Light
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-light tracking-normal text-[#1B1A17]"
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? "bg-[#B5532F] text-white font-bold border-2 border-[#B5532F] ring-2 ring-[#B5532F]/30 scale-105"
                        : "bg-[#F6F1E6] border border-[#6B6458]/30 text-[#1B1A17] font-semibold hover:border-[#B5532F] hover:text-[#B5532F]"
                    }`}
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <LuClock size={14} className={isSelected ? "text-white" : "text-[#B5532F]"} />
                    <span>{time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-[#6B6458]/15" />

          {/* Section 4: Span of the Year Badges (High Contrast Selected State) */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]">
                Step 04
              </span>
              <span className="text-xs text-[#6B6458]">·</span>
              <span className="text-xs font-medium text-[#6B6458]">
                Season & Festival
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-light tracking-normal text-[#1B1A17]"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
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
                    className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? "bg-[#B5532F] text-white font-bold border-2 border-[#B5532F] ring-2 ring-[#B5532F]/30 scale-105"
                        : "bg-[#F6F1E6] border border-[#6B6458]/30 text-[#1B1A17] font-semibold hover:border-[#B5532F] hover:text-[#B5532F]"
                    }`}
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <LuCalendar size={14} className={isSelected ? "text-white" : "text-[#B5532F]"} />
                    <span>{span}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px w-full bg-[#6B6458]/15" />

          {/* Section 5: The Vibe (High Contrast Bold Selected State) */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]">
                Step 05
              </span>
              <span className="text-xs text-[#6B6458]">·</span>
              <span className="text-xs font-medium text-[#6B6458]">
                Atmospheric Vibe (Default: Aesthetic)
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-light tracking-normal text-[#1B1A17]"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Choose the Vibe
            </h2>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {POST_VIBES.map((item) => {
                const isSelected = selectedVibe === item.vibe;
                return (
                  <button
                    key={item.vibe}
                    type="button"
                    onClick={() => setSelectedVibe(item.vibe)}
                    className={`p-4 rounded-xl transition-all cursor-pointer text-left shadow-xs ${
                      isSelected
                        ? "bg-[#B5532F] text-white border-2 border-[#B5532F] ring-2 ring-[#B5532F]/40 scale-[1.02] shadow-md"
                        : "bg-[#F6F1E6] border border-[#6B6458]/25 text-[#1B1A17] hover:border-[#B5532F]/60 hover:bg-[#EDE4D3]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm uppercase tracking-[0.14em] ${
                          isSelected ? "font-bold text-white" : "font-semibold text-[#1B1A17]"
                        }`}
                        style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                      >
                        {item.vibe}
                      </span>
                      {isSelected ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#B5532F] shadow-xs">
                          <LuCheck size={13} className="stroke-[3]" />
                        </span>
                      ) : (
                        <span className="h-5 w-5 rounded-full border border-[#6B6458]/30" />
                      )}
                    </div>
                    <p
                      className={`mt-1.5 text-xs italic leading-tight ${
                        isSelected ? "text-[#F6F1E6]/95" : "text-[#6B6458]"
                      }`}
                      style={{ fontFamily: "var(--font-newsreader), serif" }}
                    >
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Memory Note */}
          <div>
            <label
              htmlFor="prompt-notes"
              className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#6B6458] mb-2"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Personal Memory or Detail (Optional)
            </label>
            <input
              id="prompt-notes"
              type="text"
              value={userPromptNotes}
              onChange={(e) => setUserPromptNotes(e.target.value)}
              placeholder="e.g. Watching yellow taxis crossing the bridge at dusk..."
              className="w-full rounded-xl border border-[#6B6458]/25 bg-[#F6F1E6] px-4 py-2.5 text-sm text-[#1B1A17] focus:outline-none focus:ring-2 focus:ring-[#B5532F]"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            />
          </div>

          {/* Revamp & Generate Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSynthesizePost}
              disabled={isSynthesizing || !imagePreview}
              className="inline-flex items-center gap-2 rounded-full bg-[#B5532F] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition-all hover:bg-[#1B1A17] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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

      {/* STEP 2: REVIEW & EDIT EVERYTHING EXCEPT IMAGE */}
      {step === 2 && (
        <div className="flex flex-col gap-7 rounded-3xl border border-[#6B6458]/20 bg-[#EDE4D3] p-6 sm:p-10 shadow-sm animate-fadeIn">
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

          {/* 1. Revamped Image (Fixed, non-editable) */}
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
                Revamped for Kolkata · {selectedVibe} Vibe
              </span>
            </div>
          </div>

          {/* 2. Extracted Color Palette from Cloudinary AI */}
          {extractedColors.length > 0 && (
            <div className="p-4 rounded-xl border border-[#6B6458]/20 bg-[#F6F1E6] flex flex-wrap items-center justify-between gap-3">
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
                className="w-full rounded-xl border border-[#6B6458]/25 bg-[#F6F1E6] px-4 py-2.5 text-sm text-[#1B1A17] focus:outline-none focus:ring-2 focus:ring-[#B5532F] cursor-pointer"
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
                className="w-full rounded-xl border border-[#6B6458]/25 bg-[#F6F1E6] p-4 text-base italic text-[#1B1A17] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#B5532F]"
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
                className="w-full rounded-xl border border-[#6B6458]/25 bg-[#F6F1E6] px-4 py-2.5 text-sm font-medium text-[#B5532F] focus:outline-none focus:ring-2 focus:ring-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              />
            </div>

            {/* Context Pill Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="edit-time"
                  className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#6B6458] mb-1"
                >
                  Time
                </label>
                <select
                  id="edit-time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value as TimeOfDay)}
                  className="w-full rounded-xl border border-[#6B6458]/25 bg-[#F6F1E6] px-3 py-2 text-xs text-[#1B1A17] cursor-pointer"
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
                >
                  Span of Year
                </label>
                <select
                  id="edit-span"
                  value={selectedYearSpan}
                  onChange={(e) => setSelectedYearSpan(e.target.value as YearSpan)}
                  className="w-full rounded-xl border border-[#6B6458]/25 bg-[#F6F1E6] px-3 py-2 text-xs text-[#1B1A17] cursor-pointer"
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
                >
                  Vibe
                </label>
                <select
                  id="edit-vibe"
                  value={selectedVibe}
                  onChange={(e) => setSelectedVibe(e.target.value as PostVibe)}
                  className="w-full rounded-xl border border-[#6B6458]/25 bg-[#F6F1E6] px-3 py-2 text-xs text-[#1B1A17] cursor-pointer"
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
          <div className="pt-4 border-t border-[#6B6458]/15 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#6B6458]/25 bg-[#F6F1E6] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#1B1A17] hover:border-[#B5532F] cursor-pointer"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handlePublishPost}
              disabled={isPublishing}
              className="inline-flex items-center gap-2 rounded-full bg-[#B5532F] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition-all hover:bg-[#1B1A17] disabled:opacity-60 cursor-pointer"
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
