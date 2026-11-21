"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import {
  FaCompress,
  FaExpand,
  FaLocationCrosshairs,
  FaLocationDot,
  FaSatellite,
} from "react-icons/fa6";

interface SatelliteMapViewClientProps {
  lat: number;
  lng: number;
  placeName: string;
  district: string;
  detailedAddress?: string;
  className?: string;
}

export default function SatelliteMapViewClient({
  lat,
  lng,
  placeName,
  district,
  detailedAddress,
  className = "",
}: SatelliteMapViewClientProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map centered at landmark coordinates
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    // Pure Satellite Imagery Tile Layer (Esri World Imagery)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        attribution: "Esri World Imagery",
      },
    ).addTo(map);

    // Custom Terracotta Radar Marker
    const radarIcon = L.divIcon({
      className: "custom-satellite-pin",
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
          <div style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background-color: rgba(181, 83, 47, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 26px; height: 26px; border-radius: 9999px; background-color: #B5532F; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 14px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center;">
            <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #E3C27A;"></div>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([lat, lng], { icon: radarIcon }).addTo(map);
    markerRef.current = marker;

    marker.bindPopup(
      `
      <div style="font-family: inherit; padding: 4px; color: #1B1A17; max-width: 220px;">
        <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #B5532F; letter-spacing: 0.1em; display: block; margin-bottom: 2px;">
          ${district} District · Satellite View
        </span>
        <h4 style="font-size: 14px; font-weight: 600; margin: 0 0 4px 0; color: #1B1A17;">
          ${placeName}
        </h4>
        ${
          detailedAddress
            ? `<p style="font-size: 11px; color: #6B6458; margin: 0 0 6px 0; line-height: 1.3;">${detailedAddress}</p>`
            : ""
        }
        <span style="font-family: monospace; font-size: 10px; color: #B5532F; font-weight: 600;">
          ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E
        </span>
      </div>
      `,
      {
        closeButton: true,
        className: "custom-satellite-popup",
      },
    );

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, placeName, district, detailedAddress]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
    }
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border border-paper-muted/20 bg-paper-card shadow-md ${className} ${
        isFullscreen ? "fixed inset-4 z-50 rounded-2xl shadow-2xl" : ""
      }`}
    >
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-paper-card border-b border-paper-muted/15">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-terracotta text-white shadow-xs">
            <FaSatellite size={13} />
          </div>
          <div>
            <span
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-paper-text"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Satellite View
            </span>
            <span className="hidden sm:inline-block text-xs text-paper-muted ml-2">
              · {district} District, West Bengal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-terracotta font-semibold bg-paper-bg px-2.5 py-1 rounded-full border border-paper-muted/20">
            {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
          </span>

          <button
            type="button"
            onClick={handleRecenter}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-paper-muted/30 bg-paper-bg text-paper-text hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer shadow-2xs"
            title="Recenter Satellite on Landmark"
          >
            <FaLocationCrosshairs size={13} />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-paper-muted/30 bg-paper-bg text-paper-text hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer shadow-2xs"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Satellite Map"}
          >
            {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
          </button>
        </div>
      </div>

      {/* Satellite Map Canvas */}
      <div
        className={`relative w-full ${
          isFullscreen ? "h-[calc(100%-54px)]" : "h-80 sm:h-96 md:h-110"
        } bg-[#0b0c10]`}
      >
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Satellite Mode Watermark Pill */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-400 rounded-xl bg-paper-card/95 backdrop-blur-md px-3.5 py-2 border border-paper-muted/20 shadow-lg text-paper-text text-xs flex items-center gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-terracotta text-white animate-pulse">
            <FaLocationDot size={10} />
          </div>
          <div>
            <span
              className="font-semibold block text-paper-text text-[11px]"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Pure Satellite Imagery
            </span>
            <span className="text-[10px] text-paper-muted block">
              High-resolution orbital terrain view
            </span>
          </div>
        </div>

        {/* Custom Zoom Controls */}
        <div className="absolute top-4 right-4 z-400 flex flex-col gap-1.5 shadow-md">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-8 w-8 items-center justify-center rounded-t-xl bg-paper-card/95 text-paper-text hover:bg-paper-bg hover:text-terracotta transition-colors text-sm font-bold border border-paper-muted/20 cursor-pointer"
            title="Zoom In Satellite"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex h-8 w-8 items-center justify-center rounded-b-xl bg-paper-card/95 text-paper-text hover:bg-paper-bg hover:text-terracotta transition-colors text-sm font-bold border border-t-0 border-paper-muted/20 cursor-pointer"
            title="Zoom Out Satellite"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
}
