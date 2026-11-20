"use client";

import { useEffect } from "react";
import { LuExternalLink, LuMapPin, LuX } from "react-icons/lu";

interface OpenStreetMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  bengaliName?: string;
  area?: string;
  lat: number;
  lng: number;
}

export default function OpenStreetMapModal({
  isOpen,
  onClose,
  placeName,
  bengaliName,
  area,
  lat,
  lng,
}: OpenStreetMapModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Bounding box delta for a well-visible street level view
  const deltaLng = 0.0065;
  const deltaLat = 0.0045;
  const minLng = (lng - deltaLng).toFixed(5);
  const minLat = (lat - deltaLat).toFixed(5);
  const maxLng = (lng + deltaLng).toFixed(5);
  const maxLat = (lat + deltaLat).toFixed(5);

  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;
  const directOsmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="osm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper-text/45 backdrop-blur-[3px] animate-fadeIn"
    >
      <div className="relative flex flex-col w-full max-w-2xl overflow-hidden rounded-2xl border border-paper-muted/20 bg-paper-card shadow-[0_16px_48px_-8px_rgba(27,26,23,0.35)] animate-scaleUp">
        {/* Header Bar */}
        <div className="flex items-start justify-between p-5 border-b border-paper-muted/15 bg-paper-bg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terracotta/15 text-terracotta border border-terracotta/30">
              <LuMapPin size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta"
                  style={{ fontFamily: "var(--font-instrument), sans-serif" }}
                >
                  {area || "Kolkata, West Bengal"}
                </span>
                {bengaliName && (
                  <span
                    className="text-xs text-paper-muted"
                    style={{ fontFamily: "var(--font-newsreader), serif" }}
                  >
                    · {bengaliName}
                  </span>
                )}
              </div>
              <h3
                id="osm-modal-title"
                className="text-xl sm:text-2xl font-light tracking-normal text-paper-text"
                style={{ fontFamily: "var(--font-fraunces), serif" }}
              >
                {placeName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-paper-muted hover:text-terracotta hover:bg-paper-text/5 transition-colors cursor-pointer"
            aria-label="Close map"
          >
            <LuX size={18} />
          </button>
        </div>

        {/* Prominent OpenStreetMap Embed */}
        <div className="relative w-full h-80 sm:h-96 bg-paper-bg">
          <iframe
            title={`OpenStreetMap for ${placeName}`}
            src={embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
        </div>

        {/* Footer with Coordinates and External View */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-paper-card border-t border-paper-muted/15">
          <div
            className="text-xs text-paper-muted flex items-center gap-1.5"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <span>Coordinates:</span>
            <span className="font-mono text-paper-text">
              {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            </span>
          </div>

          <a
            href={directOsmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-paper-muted/25 bg-paper-bg px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-paper-text hover:border-terracotta hover:text-terracotta transition-colors"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <span>View Full Map</span>
            <LuExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
