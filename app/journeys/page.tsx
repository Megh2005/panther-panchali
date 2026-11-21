"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  FaCalendarDays,
  FaImages,
  FaLocationDot,
  FaPlus,
  FaSpinner,
  FaTrashCan,
} from "react-icons/fa6";
import type { ExploredPlace } from "@/lib/models/guide";

export default function JourneysPage() {
  const [places, setPlaces] = useState<ExploredPlace[]>([]);
  const [loading, setLoading] = useState(true);
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
    e.preventDefault();
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
    <main className="relative min-h-screen bg-paper-bg text-paper-text pt-10 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Soft Glow */}
      <div
        className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 h-[60vw] max-h-150 w-[60vw] max-w-200 rounded-full bg-radial from-[#E3C27A]/20 via-[#E3C27A]/5 to-transparent blur-3xl opacity-75"
        aria-hidden="true"
      />

      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 rounded-full border border-terracotta/40 bg-paper-text text-paper-bg px-6 py-2.5 text-xs font-semibold tracking-wider shadow-lg flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Gallery Header */}
      <div className="relative z-10 max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            Visual Gallery · Panther Panchali
          </span>
          <h1
            className="mt-1 text-3xl sm:text-4xl font-light text-paper-text"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontVariationSettings: '"opsz" 72, "SOFT" 85, "WONK" 1',
            }}
          >
            My Bengal Journey
          </h1>
          <p
            className="text-xs sm:text-sm italic text-paper-muted mt-1"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Tap any photograph in your mobile gallery to inspect its satellite view, literary memoir, and regional heritage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-paper-muted/20 bg-paper-card px-3.5 py-1.5 text-xs text-paper-muted">
            <FaImages size={12} className="text-terracotta" />
            <span>
              {places.length} {places.length === 1 ? "Landmark" : "Landmarks"}
            </span>
          </div>

          <Link
            href="/guide"
            className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-xs hover:bg-paper-text hover:scale-105 transition-all duration-300"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <FaPlus size={11} />
            <span>Explore Place</span>
          </Link>
        </div>
      </div>

      {/* Gallery Content */}
      {loading ? (
        <div className="relative z-10 mt-20 flex flex-col items-center justify-center gap-3">
          <FaSpinner size={26} className="animate-spin text-terracotta" />
          <p
            className="text-sm italic text-paper-muted"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Loading your gallery…
          </p>
        </div>
      ) : places.length === 0 ? (
        <div className="relative z-10 mt-16 max-w-md mx-auto rounded-3xl border border-paper-muted/20 bg-paper-card p-8 text-center shadow-sm">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-paper-bg border border-terracotta/30 text-terracotta mb-4 shadow-2xs">
            <FaImages size={24} />
          </div>
          <h2
            className="text-2xl font-light text-paper-text"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            Your Gallery is Empty
          </h2>
          <p
            className="mt-1.5 text-sm italic text-paper-muted"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Upload a photograph to identify its district and save your first captured landmark into your gallery.
          </p>
          <Link
            href="/guide"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-terracotta px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-paper-text hover:scale-105 transition-all duration-300"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <span>Open Bengal Guide</span>
          </Link>
        </div>
      ) : (
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Mobile Image Gallery Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {places.map((place) => (
              <Link
                key={place.id}
                href={`/journeys/${place.id}`}
                className="group relative aspect-4/5 overflow-hidden rounded-2xl sm:rounded-3xl border border-paper-muted/20 bg-paper-card shadow-xs hover:shadow-xl transition-all duration-300 block"
              >
                {/* Image Background */}
                {place.imageUrl ? (
                  <Image
                    src={place.imageUrl}
                    alt={place.placeName}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-paper-card text-paper-muted p-4 text-center">
                    <FaLocationDot size={24} className="text-terracotta/60 mb-2" />
                    <span className="text-xs font-medium">{place.placeName}</span>
                  </div>
                )}

                {/* Top Overlay Badge & Action */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1 rounded-full bg-paper-card/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-terracotta shadow-xs border border-paper-muted/20">
                    <FaLocationDot size={8} />
                    <span>{place.district}</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(place.id, e)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-paper-card/85 backdrop-blur-md text-paper-muted hover:text-red-600 hover:bg-paper-card shadow-xs transition-colors cursor-pointer border border-paper-muted/20"
                    title="Remove from Gallery"
                  >
                    <FaTrashCan size={11} />
                  </button>
                </div>

                {/* Bottom Scrim & Place Info */}
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end text-white z-10">
                  <h3
                    className="text-sm sm:text-base font-medium text-white line-clamp-1 leading-tight drop-shadow-sm group-hover:text-gold-glow transition-colors"
                    style={{ fontFamily: "var(--font-fraunces), serif" }}
                  >
                    {place.placeName}
                  </h3>

                  <div className="flex items-center justify-between mt-1 text-[10px] text-white/80 font-medium">
                    <span className="flex items-center gap-1">
                      <FaCalendarDays size={9} className="opacity-80" />
                      <span>
                        {new Date(place.exploredAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </span>

                    <span
                      className="text-gold-glow font-semibold tracking-wider uppercase text-[9px] group-hover:underline"
                      style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                    >
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
