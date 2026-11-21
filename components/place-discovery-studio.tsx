"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  FaBook,
  FaCheck,
  FaCloudUploadAlt,
  FaCompass,
  FaCopy,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaHeart,
  FaImage,
  FaInfoCircle,
  FaLayerGroup,
  FaMagic,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaSpinner,
  FaSun,
  FaTree,
  FaUndo,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BengalMapFlyTo from "@/components/bengal-map-flyto";
import type { BengalPlaceAnalysis } from "@/lib/models/place-discovery";

export default function PlaceDiscoveryStudio() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload & Input State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [userNotes, setUserNotes] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Analysis Result
  const [hostedImageUrl, setHostedImageUrl] = useState<string>("");
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] =
    useState<BengalPlaceAnalysis | null>(null);

  // Publish State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [copiedCoord, setCopiedCoord] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setImageMimeType(file.type || "image/jpeg");

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreviewUrl(dataUrl);
      setImageBase64(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleIdentifyPlace = async () => {
    if (!imageBase64) {
      setErrorMessage("Please select or drop a photograph first.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisResult(null);
    setPublishSuccess(false);

    try {
      setAnalysisStep("Ingesting photograph & extracting atmospheric palette...");

      const res = await fetch("/api/places/analyze", {
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
        throw new Error(data.error || "Failed to analyze photograph.");
      }

      setHostedImageUrl(data.imageUrl);
      setExtractedColors(data.colors || []);
      setAnalysisResult(data.analysis);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Could not identify the place. Please try again with another photo.",
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const handleCopyCoordinates = (lat: number, lng: number) => {
    const text = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    void navigator.clipboard.writeText(text);
    setCopiedCoord(true);
    setTimeout(() => setCopiedCoord(false), 2500);
  };

  const handleCopyColor = (color: string) => {
    void navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handlePublishDiscovery = async () => {
    if (!analysisResult || !analysisResult.isWestBengal) return;

    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: hostedImageUrl || imagePreviewUrl,
          placeName: analysisResult.placeName,
          bengaliName: analysisResult.bengaliName,
          district: analysisResult.district,
          state: analysisResult.state,
          detailedAddress: analysisResult.detailedAddress,
          placeCoords: analysisResult.coordinates,
          plainTextSummary: analysisResult.plainTextSummary,
          scenicBeauty: analysisResult.scenicBeauty,
          historicalSignificance: analysisResult.historicalSignificance,
          predictedMood: analysisResult.predictedMood,
          extractedColors: extractedColors,
          timeOfDay: "Twilight",
          yearSpan: "Pooja",
          vibe: "Aesthetic",
          caption: analysisResult.plainTextSummary.slice(0, 200) + "...",
          hashtags: [
            `#${analysisResult.placeName.replace(/\s+/g, "")}`,
            `#${analysisResult.district.replace(/\s+/g, "")}`,
            "#WestBengal",
            "#BengalHeritage",
            "#PantherPanchali",
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish discovery.");
      }

      setPublishSuccess(true);
      setTimeout(() => {
        router.push("/explore");
      }, 1500);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to publish discovery.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setImageBase64("");
    setUserNotes("");
    setAnalysisResult(null);
    setHostedImageUrl("");
    setExtractedColors([]);
    setErrorMessage(null);
    setPublishSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      {/* Upload & Identification Card */}
      {!analysisResult && (
        <section className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-10 shadow-[0_12px_40px_rgba(27,26,23,0.08)]">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-8">
            <span
              className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Panther Panchali · Place Discovery
            </span>
            <h2
              className="mt-2 text-2xl sm:text-4xl font-light text-paper-text"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
              }}
            >
              Seen a place in West Bengal? Let's reveal its story.
            </h2>
            <p
              className="mt-3 text-sm sm:text-base italic text-paper-muted leading-relaxed"
              style={{ fontFamily: "var(--font-newsreader), serif" }}
            >
              Upload any photo of a landscape, monument, or corner of Bengal.
              Gemini will locate its district, drop an animated radar pin on
              OpenStreetMap, write its 300-word memoir in plain text, and uncover
              its scenic and historical heritage.
            </p>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-terracotta bg-terracotta/10 scale-[0.99]"
                : imagePreviewUrl
                  ? "border-terracotta/40 bg-paper-bg"
                  : "border-paper-muted/30 hover:border-terracotta/60 bg-paper-bg/60 hover:bg-paper-bg"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreviewUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-64 sm:h-80 w-full max-w-md overflow-hidden rounded-xl shadow-md border border-paper-muted/20">
                  <Image
                    src={imagePreviewUrl}
                    alt="Upload preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-terracotta">
                  <FaImage size={15} />
                  <span>{selectedFile?.name || "Photograph Loaded"}</span>
                  <span className="text-paper-muted text-[11px]">
                    (Click or drag to change)
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-terracotta text-white shadow-md">
                  <FaCloudUploadAlt size={30} />
                </div>
                <div>
                  <span
                    className="text-base sm:text-lg font-medium text-paper-text block"
                    style={{ fontFamily: "var(--font-fraunces), serif" }}
                  >
                    Click to select or drag & drop a photo
                  </span>
                  <span
                    className="text-xs text-paper-muted block mt-1"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    High resolution JPG, PNG, or WebP from anywhere in Bengal
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Optional User Hint */}
          <div className="mt-6 max-w-2xl mx-auto">
            <label
              htmlFor="user-hints"
              className="block text-xs font-semibold uppercase tracking-[0.14em] text-paper-text mb-2"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Personal Hint or Memory Clue (Optional)
            </label>
            <input
              id="user-hints"
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="e.g. A red terracotta temple visited during winter, or hills with toy train tracks"
              className="w-full rounded-xl border border-paper-muted/30 bg-paper-bg px-4 py-3 text-sm text-paper-text placeholder:text-paper-muted/60 focus:border-terracotta focus:outline-none"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-5 max-w-2xl mx-auto flex items-center gap-2.5 rounded-xl bg-terracotta/10 border border-terracotta/30 p-3.5 text-xs text-terracotta">
              <FaExclamationCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleIdentifyPlace}
              disabled={isAnalyzing || !imageBase64}
              className={`inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 shadow-md ${
                isAnalyzing || !imageBase64
                  ? "bg-paper-muted/30 text-paper-muted cursor-not-allowed"
                  : "bg-terracotta text-white hover:bg-paper-text hover:scale-105 cursor-pointer"
              }`}
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              {isAnalyzing ? (
                <>
                  <FaSpinner className="animate-spin" size={16} />
                  <span>{analysisStep || "Identifying Location..."}</span>
                </>
              ) : (
                <>
                  <FaMagic size={16} />
                  <span>Reveal Place & Stories</span>
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* RESULT STATE */}
      {analysisResult && (
        <div className="space-y-10 animate-fadeIn">
          {/* NON-BENGAL ALERT IF DETECTED OUTSIDE WEST BENGAL */}
          {!analysisResult.isWestBengal ? (
            <section className="rounded-3xl border border-terracotta/30 bg-paper-card p-8 sm:p-12 text-center shadow-lg">
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-terracotta text-white mb-4">
                <FaExclamationTriangle size={32} />
              </div>
              <span
                className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta block"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                Outside West Bengal Territory
              </span>
              <h2
                className="mt-2 text-2xl sm:text-3xl font-light text-paper-text"
                style={{ fontFamily: "var(--font-fraunces), serif" }}
              >
                {analysisResult.placeName || "Location Outside West Bengal"}
              </h2>
              <p
                className="mt-4 text-sm sm:text-base italic text-paper-muted max-w-xl mx-auto leading-relaxed"
                style={{ fontFamily: "var(--font-newsreader), serif" }}
              >
                {analysisResult.nonBengalNotice ||
                  "This photograph does not appear to be situated within the borders of West Bengal. Panther Panchali is dedicated to the living memory and hidden places across West Bengal."}
              </p>
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-paper-text transition-all cursor-pointer"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  <FaUndo size={14} />
                  <span>Upload a West Bengal Photo</span>
                </button>
              </div>
            </section>
          ) : (
            <>
              {/* HEADER BADGE & PLACE TITLE */}
              <section className="flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-terracotta px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-sm mb-3">
                  <FaMapMarkerAlt size={13} />
                  <span>
                    {analysisResult.district} District · {analysisResult.state}
                  </span>
                </div>

                <h1
                  className="text-3xl sm:text-5xl md:text-6xl font-light text-paper-text leading-tight"
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
                  }}
                >
                  {analysisResult.placeName}
                </h1>

                {analysisResult.bengaliName && (
                  <h2
                    className="mt-1 text-xl sm:text-2xl font-normal text-terracotta"
                    style={{ fontFamily: "var(--font-fraunces), serif" }}
                  >
                    {analysisResult.bengaliName}
                  </h2>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCoordinates(
                        analysisResult.coordinates.lat,
                        analysisResult.coordinates.lng,
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-paper-muted/30 bg-paper-card px-3.5 py-1 text-xs font-mono text-paper-muted hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer"
                    title="Click to copy GPS coordinates"
                  >
                    <span>
                      {analysisResult.coordinates.lat.toFixed(4)}° N,{" "}
                      {analysisResult.coordinates.lng.toFixed(4)}° E
                    </span>
                    {copiedCoord ? (
                      <FaCheck size={12} className="text-terracotta" />
                    ) : (
                      <FaCopy size={12} />
                    )}
                  </button>
                  <span className="text-xs text-paper-muted">
                    {analysisResult.detailedAddress}
                  </span>
                </div>
              </section>

              {/* PHOTOGRAPH & ATMOSPHERIC 5-COLOR PALETTE */}
              <section className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-[0_12px_40px_rgba(27,26,23,0.08)]">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7">
                    <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-md border border-paper-muted/20">
                      <Image
                        src={hostedImageUrl || imagePreviewUrl || ""}
                        alt={analysisResult.placeName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </div>

                  <div className="md:col-span-5 flex flex-col justify-center space-y-5">
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-terracotta block"
                        style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                      >
                        Atmospheric Bengal Palette
                      </span>
                      <h3
                        className="text-lg font-light text-paper-text mt-0.5"
                        style={{ fontFamily: "var(--font-fraunces), serif" }}
                      >
                        Harmonies Extracted from Image
                      </h3>
                      <p className="text-xs text-paper-muted mt-1">
                        Dominant tones reflecting the stone, clay, foliage, and
                        sky of {analysisResult.district}. Click any swatch to copy
                        its hex code.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {extractedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleCopyColor(color)}
                          className="group relative flex flex-col items-center gap-1.5 cursor-pointer"
                          title={`Copy ${color}`}
                        >
                          <div
                            className="h-12 w-12 rounded-xl shadow-sm border-2 border-paper-bg transition-transform group-hover:scale-110 flex items-center justify-center"
                            style={{ backgroundColor: color }}
                          >
                            {copiedColor === color && (
                              <FaCheck
                                size={14}
                                className="text-white drop-shadow"
                              />
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-paper-muted uppercase">
                            {color}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Quick District Telemetry Box */}
                    <div className="rounded-xl bg-paper-bg/80 border border-paper-muted/20 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-paper-muted">District</span>
                        <span className="font-semibold text-paper-text">
                          {analysisResult.district}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-paper-muted">State</span>
                        <span className="font-semibold text-paper-text">
                          {analysisResult.state}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-paper-muted">Full Address</span>
                        <span className="font-semibold text-paper-text text-right max-w-[200px] truncate">
                          {analysisResult.detailedAddress}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ALONGSIDE THE MAP: OPENSTREETMAP FLY-TO & 300-WORD PLAIN-TEXT OVERVIEW */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Interactive OpenStreetMap Flight Animation */}
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
                        OpenStreetMap Flight Radar
                      </h3>
                    </div>
                    <span className="text-xs text-paper-muted">
                      India &rarr; West Bengal &rarr; {analysisResult.district}
                    </span>
                  </div>

                  <BengalMapFlyTo
                    lat={analysisResult.coordinates.lat}
                    lng={analysisResult.coordinates.lng}
                    placeName={analysisResult.placeName}
                    district={analysisResult.district}
                    detailedAddress={analysisResult.detailedAddress}
                  />
                </div>

                {/* Alongside the Map: Strictly Plain-Text Overview Summary (~300 words, Zero Markdown) */}
                <div className="lg:col-span-5 flex flex-col space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
                        <FaBook size={14} />
                      </div>
                      <h3
                        className="text-xl sm:text-2xl font-light text-paper-text"
                        style={{ fontFamily: "var(--font-fraunces), serif" }}
                      >
                        Overview Summary
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-terracotta font-semibold uppercase tracking-wider">
                      300 Words · Plain Text
                    </span>
                  </div>

                  <div className="relative flex-1 rounded-2xl border border-paper-muted/20 bg-paper-card p-6 sm:p-7 shadow-[0_8px_30px_rgba(27,26,23,0.08)] flex flex-col justify-between overflow-hidden">
                    <div
                      className="pointer-events-none absolute top-0 right-0 -mr-12 -mt-12 h-36 w-36 rounded-full bg-radial from-[#E3C27A]/20 to-transparent blur-2xl opacity-60"
                      aria-hidden="true"
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between pb-3 mb-4 border-b border-paper-muted/15">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta"
                          style={{
                            fontFamily: "var(--font-instrument), sans-serif",
                          }}
                        >
                          Panther Panchali · Literary Memoir
                        </span>
                        <span className="text-[10px] text-paper-muted">
                          Native Plain Text
                        </span>
                      </div>

                      {/* Pure plain text rendered with Newsreader italic without any markdown replacement */}
                      <div
                        className="text-sm sm:text-base italic text-paper-text leading-[1.85] tracking-wide whitespace-pre-line"
                        style={{ fontFamily: "var(--font-newsreader), serif" }}
                      >
                        {analysisResult.plainTextSummary}
                      </div>
                    </div>

                    <div className="relative z-10 pt-4 mt-5 border-t border-paper-muted/15 flex items-center justify-between text-xs text-paper-muted">
                      <span>Authentic Bengal Lore</span>
                      <span className="font-semibold text-terracotta">
                        {analysisResult.district} District
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* SCENIC BEAUTY & HISTORICAL SIGNIFICANCE (MARKDOWN ENABLED) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Scenic & Natural Beauty */}
                <section className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-[0_12px_40px_rgba(27,26,23,0.08)] flex flex-col">
                  <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-paper-muted/15">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta/15 text-terracotta border border-terracotta/30">
                      <FaTree size={18} />
                    </div>
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta block"
                        style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                      >
                        Topography & Atmosphere
                      </span>
                      <h4
                        className="text-lg font-light text-paper-text"
                        style={{ fontFamily: "var(--font-fraunces), serif" }}
                      >
                        Scenic & Natural Beauty
                      </h4>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none text-paper-text text-sm leading-relaxed space-y-3">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {analysisResult.scenicBeauty}
                    </ReactMarkdown>
                  </div>
                </section>

                {/* Historical Significance */}
                <section className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-8 shadow-[0_12px_40px_rgba(27,26,23,0.08)] flex flex-col">
                  <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-paper-muted/15">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta/15 text-terracotta border border-terracotta/30">
                      <FaLayerGroup size={18} />
                    </div>
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta block"
                        style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                      >
                        Architecture & Dynasties
                      </span>
                      <h4
                        className="text-lg font-light text-paper-text"
                        style={{ fontFamily: "var(--font-fraunces), serif" }}
                      >
                        Historical Significance
                      </h4>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none text-paper-text text-sm leading-relaxed space-y-3">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {analysisResult.historicalSignificance}
                    </ReactMarkdown>
                  </div>
                </section>
              </div>

              {/* PREDICTED MOOD & SENSORY EXPECTATIONS */}
              <section className="rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-10 shadow-[0_12px_40px_rgba(27,26,23,0.08)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-paper-muted/15">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta text-white shadow-sm">
                      <FaSun size={22} />
                    </div>
                    <div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-terracotta block"
                        style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                      >
                        Sensory Experience Guide
                      </span>
                      <h3
                        className="text-2xl font-light text-paper-text"
                        style={{ fontFamily: "var(--font-fraunces), serif" }}
                      >
                        Predicted Mood:{" "}
                        <span className="text-terracotta font-normal">
                          {analysisResult.predictedMood.moodName}
                        </span>
                      </h3>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-paper-muted/25 bg-paper-bg px-4 py-2 text-xs text-paper-text">
                    <span className="font-semibold text-terracotta">
                      Best Time:
                    </span>
                    <span>{analysisResult.predictedMood.bestTimeToVisit}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p
                    className="text-sm sm:text-base italic text-paper-muted leading-relaxed"
                    style={{ fontFamily: "var(--font-newsreader), serif" }}
                  >
                    {analysisResult.predictedMood.moodDescription}
                  </p>

                  <div>
                    <h5
                      className="text-xs font-semibold uppercase tracking-[0.16em] text-paper-text mb-3"
                      style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                    >
                      What You Can Expect to Encounter:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysisResult.predictedMood.whatToExpect.map(
                        (item, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 rounded-xl bg-paper-bg p-3 border border-paper-muted/15"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-terracotta text-white text-[10px] font-bold">
                              {i + 1}
                            </span>
                            <span className="text-xs text-paper-text leading-snug">
                              {item}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* ACTION BAR: PUBLISH TO FEED & IDENTIFY ANOTHER */}
              <section className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-paper-muted/20">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-full border border-paper-muted/30 bg-paper-card px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-paper-text hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  <FaUndo size={14} />
                  <span>Identify Another Place</span>
                </button>

                <div className="flex items-center gap-3">
                  {publishSuccess && (
                    <span className="text-xs font-semibold text-terracotta animate-pulse">
                      Published to Community Feed! Redirecting...
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handlePublishDiscovery}
                    disabled={isPublishing || publishSuccess}
                    className={`inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all shadow-md cursor-pointer ${
                      isPublishing || publishSuccess
                        ? "bg-paper-muted/30 text-paper-muted cursor-wait"
                        : "bg-terracotta text-white hover:bg-paper-text hover:scale-105"
                    }`}
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    {isPublishing ? (
                      <>
                        <FaSpinner className="animate-spin" size={14} />
                        <span>Publishing to Feed...</span>
                      </>
                    ) : publishSuccess ? (
                      <>
                        <FaCheck size={14} />
                        <span>Published!</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane size={14} />
                        <span>Publish Discovery to Feed</span>
                      </>
                    )}
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
