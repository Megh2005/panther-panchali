"use client";

import { useEffect } from "react";
import { FaExternalLinkAlt, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import BengalMapFlyTo from "@/components/bengal-map-flyto";

interface OpenStreetMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  area?: string;
  lat: number;
  lng: number;
}

export default function OpenStreetMapModal({
  isOpen,
  onClose,
  placeName,
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

  const directOsmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="osm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-paper-text/60 backdrop-blur-xs animate-fadeIn"
    >
      <div className="relative flex flex-col w-full max-w-3xl overflow-hidden rounded-3xl border border-paper-muted/20 bg-paper-card shadow-[0_20px_60px_-10px_rgba(27,26,23,0.45)] animate-scaleUp">
        {/* Header Bar */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-paper-muted/15 bg-paper-bg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terracotta text-white shadow-sm">
              <FaMapMarkerAlt size={18} />
            </div>
            <div>
              <span
                className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-terracotta block"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                {area || "West Bengal"}
              </span>
              <h3
                id="osm-modal-title"
                className="text-lg sm:text-2xl font-light tracking-normal text-paper-text mt-0.5"
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
            <FaTimes size={18} />
          </button>
        </div>

        {/* Animated OpenStreetMap Leaflet Radar */}
        <div className="p-3 sm:p-4 bg-paper-bg">
          <BengalMapFlyTo
            lat={lat}
            lng={lng}
            placeName={placeName}
            district={area || "West Bengal"}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-paper-card border-t border-paper-muted/15">
          <span
            className="text-xs text-paper-muted"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            OpenStreetMap Multi-Stage Radar · Panther Panchali
          </span>

          <a
            href={directOsmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-paper-muted/25 bg-paper-bg px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-paper-text hover:border-terracotta hover:text-terracotta transition-colors"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            <span>Open in OpenStreetMap</span>
            <FaExternalLinkAlt size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
