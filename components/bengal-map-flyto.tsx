"use client";

import dynamic from "next/dynamic";
import { FaCompass, FaSpinner } from "react-icons/fa6";

interface BengalMapFlyToProps {
  lat: number;
  lng: number;
  placeName: string;
  district: string;
  detailedAddress?: string;
}

const BengalMapFlyToClient = dynamic(
  () => import("./bengal-map-flyto-client"),
  {
    ssr: false,
    loading: () => (
      <div className="relative flex flex-col items-center justify-center w-full h-80 sm:h-96 md:h-[420px] rounded-2xl border border-paper-muted/20 bg-paper-card text-paper-muted">
        <FaSpinner className="animate-spin text-terracotta mb-3" size={28} />
        <span
          className="text-xs font-semibold uppercase tracking-[0.16em] text-paper-text"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Initializing OpenStreetMap Fly-To Radar...
        </span>
        <span className="text-[11px] text-paper-muted mt-1">
          Calibrating West Bengal satellite telemetry
        </span>
      </div>
    ),
  },
);

export default function BengalMapFlyTo(props: BengalMapFlyToProps) {
  return <BengalMapFlyToClient {...props} />;
}
