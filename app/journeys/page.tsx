"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  FaCalendarDays,
  FaCompass,
  FaLocationDot,
  FaSpinner,
  FaTrashCan,
  FaWandMagicSparkles,
} from "react-icons/fa6";
import OpenStreetMapModal from "@/components/open-street-map-modal";
import type { ExploredPlace } from "@/lib/models/guide";

export default function JourneysPage() {
  const [places, setPlaces] = useState<ExploredPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMapPlace, setActiveMapPlace] = useState<ExploredPlace | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchPlaces = useCallback(async () => {
    try {
      const res = await fetch("/api/journeys");
      const data = await res.json();
      if (Array.isArray(data.places)) {
        setPlaces(data.places);
      }
    } catch (err) {
      console.error("Failed to fetch explored places:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlaces();
  }, [fetchPlaces]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/journeys?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setPlaces((prev) => prev.filter((p) => p.id !== id));
        showToast("Place removed from your journey.");
      }
    } catch {
      showToast("Could not remove place.");
    }
  };

  return (
    <main className="relative min-h-screen bg-paper-bg text-paper-text pt-12 pb-28 px-4 overflow-hidden">
      <div
        className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 h-[60vw] max-h-150 w-[60vw] max-w-200 rounded-full bg-radial from-[#E3C27A]/20 via-[#E3C27A]/5 to-transparent blur-3xl opacity-75"
        aria-hidden="true"
      />

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full border border-terracotta/40 bg-paper-text text-paper-bg px-6 py-2.5 text-xs font-semibold tracking-wider shadow-lg flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center mb-10">
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Personal Chronicle · Panther Panchali
        </span>
        <h1
          className="mt-2 text-3xl sm:text-5xl font-light tracking-normal text-paper-text"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
          }}
        >
          My Bengal Journey
        </h1>
        <p
          className="mt-2 text-base italic text-paper-muted max-w-lg"
          style={{ fontFamily: "var(--font-newsreader), serif" }}
        >
          Your personal chronicle of explored places, stored photos, OpenStreetMap radar flights, and literary memoirs across West Bengal.
        </p>

        <Link
          href="/guide"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-xs hover:bg-paper-text hover:scale-105 transition-all duration-300"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          <FaWandMagicSparkles size={13} />
          <span>Explore New Place</span>
        </Link>
      </div>

      {loading ? (
        <div className="relative z-10 mt-16 flex flex-col items-center justify-center gap-3">
          <FaSpinner size={24} className="animate-spin text-terracotta" />
          <p
            className="text-sm italic text-paper-muted"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Loading your explored places…
          </p>
        </div>
      ) : places.length === 0 ? (
        <div className="relative z-10 mt-12 max-w-md mx-auto rounded-3xl border border-paper-muted/20 bg-paper-card p-8 text-center shadow-sm">
          <FaLocationDot size={32} className="mx-auto text-terracotta" />
          <h2
            className="mt-3 text-2xl font-light text-paper-text"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Your Journey is Empty
          </h2>
          <p
            className="mt-1.5 text-sm italic text-paper-muted"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Upload a photograph to identify its district and save your first explored landmark.
          </p>
          <Link
            href="/guide"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-paper-text hover:scale-105 transition-all duration-300"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <span>Open Bengal Guide</span>
          </Link>
        </div>
      ) : (
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-6">
          {places.map((place) => (
            <article
              key={place.id}
              className="overflow-hidden rounded-3xl border border-paper-muted/20 bg-paper-card shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-paper-muted/15">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-terracotta/30 bg-terracotta/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-terracotta">
                      <FaLocationDot size={9} />
                      <span>{place.district}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-paper-muted">
                      <FaCalendarDays size={10} />
                      <span>
                        {new Date(place.exploredAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                  </div>

                  <h3
                    className="text-xl sm:text-2xl font-light text-paper-text mt-1.5"
                    style={{ fontFamily: "var(--font-fraunces), serif" }}
                  >
                    {place.placeName}
                  </h3>
                  {place.bengaliName && (
                    <span className="text-base text-terracotta font-normal">
                      {place.bengaliName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveMapPlace(place)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-paper-muted/30 bg-paper-bg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-terracotta hover:bg-terracotta hover:text-white transition-all cursor-pointer"
                    style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                  >
                    <FaCompass size={12} />
                    <span>View Map Radar</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(place.id, e)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-paper-muted/30 bg-paper-bg text-paper-muted hover:border-red-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove from Journey"
                  >
                    <FaTrashCan size={12} />
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
                {place.imageUrl && (
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-paper-bg border border-paper-muted/20">
                    <Image
                      src={place.imageUrl}
                      alt={place.placeName}
                      fill
                      sizes="(max-width: 640px) 100vw, 240px"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className={place.imageUrl ? "sm:col-span-2 flex flex-col justify-between h-full" : "sm:col-span-3"}>
                  <p
                    className="text-sm sm:text-base italic text-paper-text leading-relaxed whitespace-pre-line"
                    style={{ fontFamily: "var(--font-newsreader), serif" }}
                  >
                    {place.plainTextSummary}
                  </p>

                  <div className="mt-4 pt-3 border-t border-paper-muted/15 flex flex-wrap items-center justify-between gap-2 text-xs text-paper-muted">
                    <span>
                      Coordinates: {place.coordinates.lat.toFixed(4)}°N, {place.coordinates.lng.toFixed(4)}°E
                    </span>

                    {Array.isArray(place.extractedColors) && place.extractedColors.length > 0 && (
                      <div className="flex items-center gap-1">
                        {place.extractedColors.slice(0, 5).map((c) => (
                          <div
                            key={c}
                            className="h-3.5 w-3.5 rounded-full border border-paper-text/20"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeMapPlace && (
        <OpenStreetMapModal
          isOpen={!!activeMapPlace}
          onClose={() => setActiveMapPlace(null)}
          placeName={activeMapPlace.placeName}
          lat={activeMapPlace.coordinates.lat}
          lng={activeMapPlace.coordinates.lng}
        />
      )}
    </main>
  );
}
