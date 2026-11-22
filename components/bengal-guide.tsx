"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  FaBookmark,
  FaBookOpen,
  FaCheck,
  FaCircleExclamation,
  FaCloudArrowUp,
  FaCompass,
  FaCopy,
  FaImage,
  FaLayerGroup,
  FaLocationDot,
  FaRotateLeft,
  FaSpinner,
  FaTree,
  FaTriangleExclamation,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AudioPlayerButton from "@/components/audio-player-button";
import BengalMapFlyTo from "@/components/bengal-map-flyto";
import PhotoViewModes from "@/components/photo-view-modes";
import WeatherCard from "@/components/weather-card";
import type { BengalPlaceGuide } from "@/lib/models/guide";

export default function BengalGuide() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [userNotes, setUserNotes] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [guideResult, setGuideResult] = useState<BengalPlaceGuide | null>(null);
  const [imageAssetId, setImageAssetId] = useState<string | null>(null);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const handleSaveToJourney = async () => {
    if (!guideResult) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeName: guideResult.placeName,
          district: guideResult.district,
          state: guideResult.state,
          detailedAddress: guideResult.detailedAddress,
          coordinates: guideResult.coordinates,
          imageUrl: uploadedImageUrl || imagePreviewUrl || "",
          imageAssetId: imageAssetId || undefined,
          publicId: publicId || undefined,
          plainTextSummary: guideResult.plainTextSummary,
          scenicBeauty: guideResult.scenicBeauty,
          historicalSignificance: guideResult.historicalSignificance,
          predictedMood: guideResult.predictedMood,
          extractedColors:
            extractedColors.length > 0
              ? extractedColors
              : guideResult.extractedColors || [],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save place.");
      }
      setIsSaved(true);
      setSaveToast("Saved to your Journey!");
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err) {
      setSaveToast(err instanceof Error ? err.message : "Failed to save.");
      setTimeout(() => setSaveToast(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image file size exceeds 10MB limit.");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setImageMimeType(file.type || "image/jpeg");

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreviewUrl(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyzePlace = async () => {
    if (!imageBase64) {
      setErrorMessage("Please upload an image to identify.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/guide/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType: imageMimeType,
          userNotes: userNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to identify place.");
      }

      setGuideResult(data.guide);
      setImageAssetId(data.imageAssetId || null);
      setPublicId(data.publicId || null);
      setUploadedImageUrl(data.imageUrl || imagePreviewUrl);
      setExtractedColors(data.colors || data.guide?.extractedColors || []);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while analyzing the image.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setImageBase64("");
    setUserNotes("");
    setGuideResult(null);
    setImageAssetId(null);
    setPublicId(null);
    setUploadedImageUrl(null);
    setExtractedColors([]);
    setErrorMessage(null);
    setIsSaved(false);
    setSaveToast(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyToClipboard = (text: string, sectionId: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2500);
    }
  };

  return (
    <div className="w-full max-w-[94vw] lg:max-w-[85vw] mx-auto space-y-8">
      {saveToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full border border-terracotta/40 bg-paper-text text-paper-bg px-6 py-2.5 text-xs font-semibold tracking-wider shadow-lg flex items-center gap-2">
          <FaCheck size={12} className="text-gold-glow" />
          <span>{saveToast}</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <FaCircleExclamation size={18} className="shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs uppercase font-semibold tracking-wider hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {!guideResult && !isAnalyzing && (
        <div className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-10 shadow-[0_8px_32px_-4px_rgba(27,26,23,0.06),0_20px_50px_-8px_rgba(227,194,122,0.18)]">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Panther Panchali · Visual Guide
            </span>
            <h2
              className="mt-2 text-2xl sm:text-4xl font-light text-paper-text"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Identify Any Place in West Bengal
            </h2>
            <p
              className="mt-2 text-sm sm:text-base italic text-paper-muted"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Seen an unfamiliar spot, temple, tea garden, riverbank, or colonial edifice? Upload a single photograph to reveal its exact district, street address, radar flight, and literary memoir.
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-terracotta bg-terracotta/10 scale-[1.01]"
                : imagePreviewUrl
                  ? "border-terracotta/50 bg-paper-bg"
                  : "border-paper-muted/30 bg-paper-bg/60 hover:border-terracotta/40 hover:bg-paper-bg"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {imagePreviewUrl ? (
              <div className="flex flex-col items-center space-y-4 w-full">
                <div className="relative max-w-full overflow-hidden rounded-2xl border-2 border-terracotta/40 bg-paper-bg p-2 shadow-md flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreviewUrl}
                    alt="Uploaded place preview"
                    className="max-h-96 sm:max-h-125 w-auto max-w-full rounded-xl object-contain block mx-auto"
                  />
                </div>
                <div className="text-xs text-paper-muted font-medium">
                  {selectedFile?.name} ({(selectedFile?.size ? (selectedFile.size / (1024 * 1024)).toFixed(2) : "0")} MB)
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-terracotta hover:underline">
                  Click or drag to change image
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper-card border border-terracotta/30 text-terracotta shadow-xs">
                  <FaCloudArrowUp size={28} />
                </div>
                <div>
                  <p
                    className="text-base sm:text-lg font-medium text-paper-text"
                    style={{ fontFamily: "var(--font-fraunces), serif" }}
                  >
                    Upload or drag photograph here
                  </p>
                  <p className="text-xs text-paper-muted mt-1">
                    Supports high-resolution JPEG, PNG, WebP up to 10MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 max-w-xl mx-auto space-y-2">
            <label
              htmlFor="userNotes"
              className="block text-xs font-semibold uppercase tracking-wider text-paper-muted text-left"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Optional Clues or Personal Memory (optional)
            </label>
            <input
              id="userNotes"
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="e.g. Visited near red soil hills, or saw terracotta carvings near a lake..."
              className="w-full rounded-xl border border-paper-muted/30 bg-paper-bg px-4 py-2.5 text-xs sm:text-sm text-paper-text placeholder:text-paper-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              maxLength={200}
            />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              disabled={!imageBase64}
              onClick={handleAnalyzePlace}
              className="inline-flex items-center gap-2 rounded-full bg-terracotta px-8 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-white shadow-md hover:bg-paper-text hover:scale-105 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <FaWandMagicSparkles size={16} />
              <span>Identify Place in West Bengal</span>
            </button>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="rounded-3xl border border-paper-muted/20 bg-paper-card p-12 sm:p-20 text-center shadow-md space-y-6">
          <div className="flex justify-center">
            <FaSpinner size={36} className="animate-spin text-terracotta" />
          </div>
          <div>
            <h3
              className="text-2xl sm:text-3xl font-light text-paper-text"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              Searching Across 23 Districts of West Bengal…
            </h3>
            <p
              className="mt-2 text-sm sm:text-base italic text-paper-muted max-w-lg mx-auto"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Analyzing architectural styles, geographic markers, soil composition, and heritage archives to identify the exact landmark and its story.
            </p>
          </div>
        </div>
      )}

      {guideResult && !isAnalyzing && (
        <div className="space-y-10 animate-fadeIn">
          {!guideResult.isWestBengal ? (
            <div className="rounded-3xl border border-paper-muted/30 bg-paper-card p-8 sm:p-12 text-center shadow-md space-y-6 max-w-2xl mx-auto">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-paper-bg border border-terracotta/40 text-terracotta">
                <FaTriangleExclamation size={26} />
              </div>
              <div>
                <span
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  Location Identified
                </span>
                <h3
                  className="mt-2 text-2xl sm:text-3xl font-light text-paper-text"
                  style={{ fontFamily: "var(--font-fraunces), serif" }}
                >
                  {guideResult.placeName}
                </h3>
                <p
                  className="mt-3 text-sm sm:text-base italic text-paper-muted leading-relaxed"
                  style={{ fontFamily: "var(--font-newsreader), serif" }}
                >
                  {guideResult.nonBengalNotice ||
                    "This landmark is located outside West Bengal. Panther Panchali is an architectural and cultural guide exclusively dedicated to exploring the 23 districts of West Bengal."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-paper-text transition-all cursor-pointer"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                <FaRotateLeft size={13} />
                <span>Upload a Place from West Bengal</span>
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-terracotta/30 bg-terracotta/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-terracotta">
                      <FaLocationDot size={11} />
                      <span>{guideResult.district} District</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-paper-muted/20 bg-paper-bg px-3 py-1 text-xs font-semibold uppercase tracking-wider text-paper-text">
                      <span>{guideResult.state}</span>
                    </span>
                  </div>

                  <h1
                    className="mt-3 text-3xl sm:text-5xl font-light text-paper-text"
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
                    }}
                  >
                    {guideResult.placeName}
                  </h1>

                  <p
                    className="mt-2 text-xs sm:text-sm text-paper-muted max-w-2xl"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    {guideResult.detailedAddress}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveToJourney}
                    disabled={isSaving || isSaved}
                    className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs hover:bg-paper-text hover:scale-105 transition-all disabled:opacity-60 cursor-pointer"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    {isSaving ? (
                      <FaSpinner size={12} className="animate-spin" />
                    ) : isSaved ? (
                      <FaCheck size={12} />
                    ) : (
                      <FaBookmark size={12} />
                    )}
                    <span>{isSaved ? "Saved to Journey" : isSaving ? "Saving…" : "Save to My Journey"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 rounded-full border border-paper-muted/30 bg-paper-bg px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-paper-text hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <FaRotateLeft size={12} />
                    <span>Identify Another</span>
                  </button>

                  <Link
                    href="/journeys"
                    className="inline-flex items-center gap-1.5 rounded-full border border-paper-muted/20 bg-paper-bg px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-paper-muted hover:text-terracotta hover:border-terracotta transition-colors"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <span>View Journey</span>
                  </Link>
                </div>
              </div>

              {/* Uploaded Photograph with Dual View Modes (Normal & Monochrome) + Atmospheric Palette */}
              {(uploadedImageUrl || imagePreviewUrl) && (
                <PhotoViewModes
                  imageUrl={uploadedImageUrl || imagePreviewUrl || ""}
                  alt={guideResult.placeName}
                  colors={
                    extractedColors.length > 0
                      ? extractedColors
                      : guideResult.extractedColors
                  }
                  title="Uploaded Photograph"
                />
              )}

              {/* Real-Time Live Atmospheric Weather */}
              <WeatherCard
                lat={guideResult.coordinates.lat}
                lng={guideResult.coordinates.lng}
                district={guideResult.district}
                placeName={guideResult.placeName}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 flex flex-col space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
                        <FaCompass size={14} />
                      </div>
                      <h3
                        className="text-xl sm:text-2xl font-light text-paper-text"
                        style={{ fontFamily: "var(--font-fraunces), serif" }}
                      >
                        OpenStreetMap Radar Flight
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-terracotta font-semibold">
                      {guideResult.coordinates.lat.toFixed(4)}°N, {guideResult.coordinates.lng.toFixed(4)}°E
                    </span>
                  </div>

                  <BengalMapFlyTo
                    lat={guideResult.coordinates.lat}
                    lng={guideResult.coordinates.lng}
                    placeName={guideResult.placeName}
                    district={guideResult.district}
                    detailedAddress={guideResult.detailedAddress}
                  />
                </div>

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
                    <AudioPlayerButton
                      text={guideResult.plainTextSummary}
                      label="Listen"
                    />
                  </div>

                  <div className="relative flex-1 rounded-2xl border border-paper-muted/20 bg-paper-card p-6 sm:p-7 shadow-[0_8px_30px_rgba(27,26,23,0.08)] flex flex-col justify-between overflow-hidden">
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
                        {guideResult.plainTextSummary}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-paper-muted/15 flex items-center justify-between">
                      <AudioPlayerButton
                        text={guideResult.plainTextSummary}
                        label="Listen"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(guideResult.plainTextSummary, "summary")
                        }
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

              {/* Scenic Beauty & Historical Significance (Optional: either, both, or neither) */}
              {(guideResult.scenicBeauty || guideResult.historicalSignificance) && (
                <div
                  className={`grid gap-8 items-start ${
                    guideResult.scenicBeauty && guideResult.historicalSignificance
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {guideResult.scenicBeauty && (
                    <div className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-paper-muted/15">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
                            <FaTree size={14} />
                          </div>
                          <div>
                            <h3
                              className="text-xl sm:text-2xl font-light text-paper-text"
                              style={{ fontFamily: "var(--font-fraunces), serif" }}
                            >
                              Scenic Beauty & Landscape
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AudioPlayerButton
                            text={guideResult.scenicBeauty}
                            label="Listen"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(guideResult.scenicBeauty || "", "scenic")
                            }
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
                          {guideResult.scenicBeauty}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {guideResult.historicalSignificance && (
                    <div className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-paper-muted/15">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
                            <FaLayerGroup size={14} />
                          </div>
                          <div>
                            <h3
                              className="text-xl sm:text-2xl font-light text-paper-text"
                              style={{ fontFamily: "var(--font-fraunces), serif" }}
                            >
                              Historical Heritage & Architecture
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AudioPlayerButton
                            text={guideResult.historicalSignificance}
                            label="Listen"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                guideResult.historicalSignificance || "",
                                "history",
                              )
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
                          {guideResult.historicalSignificance}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {guideResult.predictedMood && (
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
                          guideResult.predictedMood.moodParagraph ||
                          guideResult.predictedMood.moodDescription ||
                          ""
                        }
                        label="Listen"
                      />
                      <span className="inline-flex items-center rounded-full bg-paper-bg border border-terracotta/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-terracotta">
                        Atmosphere: {guideResult.predictedMood.moodName}
                      </span>
                      {guideResult.predictedMood.bestTimeToVisit && (
                        <span className="inline-flex items-center rounded-full bg-paper-bg border border-paper-muted/25 px-3 py-1 text-xs font-medium text-paper-muted">
                          {guideResult.predictedMood.bestTimeToVisit}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="prose prose-paper max-w-none text-paper-text text-base sm:text-lg italic leading-relaxed"
                    style={{ fontFamily: "var(--font-newsreader), serif" }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {guideResult.predictedMood.moodParagraph ||
                        guideResult.predictedMood.moodDescription ||
                        ""}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
