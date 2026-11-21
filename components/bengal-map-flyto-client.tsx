"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaCompass, FaExternalLinkAlt, FaMapMarkerAlt, FaUndo } from "react-icons/fa";

interface BengalMapFlyToProps {
  lat: number;
  lng: number;
  placeName: string;
  district: string;
  detailedAddress?: string;
}

export default function BengalMapFlyToClient({
  lat,
  lng,
  placeName,
  district,
  detailedAddress,
}: BengalMapFlyToProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const animationTimersRef = useRef<NodeJS.Timeout[]>([]);

  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [isAnimating, setIsAnimating] = useState(true);

  const clearTimers = () => {
    for (const timer of animationTimersRef.current) {
      clearTimeout(timer);
    }
    animationTimersRef.current = [];
  };

  const runFlyAnimation = (map: L.Map) => {
    clearTimers();
    setIsAnimating(true);
    setStage(1);

    // Remove existing marker during start of flight
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Stage 1: India Overview (center approx [22.8, 82.5], zoom 4.5)
    map.setView([22.8, 82.5], 4.5);

    // Stage 2: Smooth flight to West Bengal [23.8, 88.0], zoom 7.5
    const timer1 = setTimeout(() => {
      setStage(2);
      map.flyTo([23.8, 88.0], 7.5, {
        duration: 2.2,
        easeLinearity: 0.25,
      });
    }, 1200);

    // Stage 3: Smooth flight directly into the District / Location coordinates, zoom 15.5
    const timer2 = setTimeout(() => {
      setStage(3);
      map.flyTo([lat, lng], 15.5, {
        duration: 2.4,
        easeLinearity: 0.25,
      });
    }, 3600);

    // Drop Pin marker after arrival
    const timer3 = setTimeout(() => {
      setIsAnimating(false);

      // Custom terracotta pulsed marker icon
      const customPinIcon = L.divIcon({
        className: "custom-bengal-marker",
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(181, 83, 47, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; background: #B5532F; border: 2.5px solid #F6F1E6; box-shadow: 0 4px 12px rgba(27, 26, 23, 0.45); display: flex; align-items: center; justify-content: center; color: #FFFFFF;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([lat, lng], { icon: customPinIcon }).addTo(map);
      markerRef.current = marker;

      marker.bindPopup(`
        <div style="font-family: var(--font-instrument), sans-serif; padding: 4px; color: #1B1A17;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #B5532F; display: block;">
            ${district} District · West Bengal
          </span>
          <h4 style="font-family: var(--font-fraunces), serif; font-size: 15px; font-weight: 600; margin: 2px 0 4px 0; color: #1B1A17;">
            ${placeName}
          </h4>
          <p style="font-size: 11px; color: #6B6458; margin: 0; line-height: 1.4;">
            ${detailedAddress || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`}
          </p>
        </div>
      `);
      marker.openPopup();
    }, 6200);

    animationTimersRef.current = [timer1, timer2, timer3];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.8, 82.5],
        zoom: 4.5,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      runFlyAnimation(map);
    } else {
      runFlyAnimation(mapInstanceRef.current);
    }

    return () => {
      clearTimers();
    };
  }, [lat, lng, placeName, district]);

  useEffect(() => {
    return () => {
      clearTimers();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleReplay = () => {
    if (mapInstanceRef.current) {
      runFlyAnimation(mapInstanceRef.current);
    }
  };

  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-paper-muted/20 bg-paper-card shadow-[0_8px_30px_rgba(27,26,23,0.08)]">
      {/* Map Interactive HUD Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-paper-bg border-b border-paper-muted/15">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta text-white shadow-sm">
            <FaMapMarkerAlt size={16} />
          </div>
          <div>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-terracotta block"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              OpenStreetMap · Bengal Radar
            </span>
            <span
              className="text-xs sm:text-sm font-medium text-paper-text block"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              {district} District, West Bengal ({lat.toFixed(4)}°N, {lng.toFixed(4)}°E)
            </span>
          </div>
        </div>

        {/* Animation Replay & OSM Link */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReplay}
            disabled={isAnimating}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all cursor-pointer ${
              isAnimating
                ? "bg-terracotta/20 text-terracotta cursor-wait"
                : "bg-terracotta text-white hover:bg-paper-text shadow-sm hover:scale-105"
            }`}
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            title="Replay multi-stage flight from India to this landmark"
          >
            <FaUndo size={12} className={isAnimating ? "animate-spin" : ""} />
            <span>{isAnimating ? "Flying..." : "Replay Journey"}</span>
          </button>

          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-paper-muted/30 bg-paper-card px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-paper-text hover:border-terracotta hover:text-terracotta transition-colors"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            title="Open in OpenStreetMap"
          >
            <span>OSM</span>
            <FaExternalLinkAlt size={11} />
          </a>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative w-full h-80 sm:h-96 md:h-[420px] bg-paper-bg">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Live Animation Stage Toast */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-[400] max-w-[85%] sm:max-w-md rounded-xl bg-paper-card/95 backdrop-blur-md px-3.5 py-2.5 border border-paper-muted/20 shadow-lg text-paper-text text-xs flex items-center gap-2.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta text-white animate-pulse">
            <FaCompass size={13} />
          </div>
          <div>
            <div className="font-semibold uppercase tracking-[0.14em] text-[10px] text-terracotta">
              {stage === 1 && "Stage 1 of 3 · India Overview"}
              {stage === 2 && "Stage 2 of 3 · Entering West Bengal"}
              {stage === 3 && `Stage 3 of 3 · Arrived in ${district}`}
            </div>
            <div className="text-paper-muted text-[11px] truncate">
              {stage === 1 && "Surveying the subcontinent from orbit..."}
              {stage === 2 && "Descending toward the Gangetic delta and Bengal hills..."}
              {stage === 3 && `Target locked at ${placeName}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
