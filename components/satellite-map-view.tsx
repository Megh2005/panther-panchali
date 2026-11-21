"use client";

import dynamic from "next/dynamic";
import { FaSatellite, FaSpinner } from "react-icons/fa6";

interface SatelliteMapViewProps {
  lat: number;
  lng: number;
  placeName: string;
  district: string;
  detailedAddress?: string;
  className?: string;
}

const SatelliteMapViewClient = dynamic(
  () => import("./satellite-map-view-client"),
  {
    ssr: false,
    loading: () => (
      <div className="relative flex flex-col items-center justify-center w-full h-80 sm:h-96 md:h-110 rounded-3xl border border-paper-muted/20 bg-paper-card text-paper-muted">
        <FaSpinner className="animate-spin text-terracotta mb-3" size={28} />
        <span
          className="text-xs font-semibold uppercase tracking-[0.16em] text-paper-text flex items-center gap-2"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          <FaSatellite size={14} className="text-terracotta" />
          <span>Calibrating Satellite View…</span>
        </span>
        <span className="text-[11px] text-paper-muted mt-1">
          Fetching high-resolution orbital imagery
        </span>
      </div>
    ),
  },
);

export default function SatelliteMapView(props: SatelliteMapViewProps) {
  return <SatelliteMapViewClient {...props} />;
}
