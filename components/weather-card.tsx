"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FaArrowsRotate,
  FaCloud,
  FaCloudBolt,
  FaCloudRain,
  FaCloudShowersHeavy,
  FaCloudSun,
  FaDroplet,
  FaSmog,
  FaSnowflake,
  FaSpinner,
  FaSun,
  FaTemperatureHalf,
  FaWind,
} from "react-icons/fa6";
import {
  fetchPlaceWeather,
  getWeatherConditionInfo,
  type WeatherData,
} from "@/lib/services/weather";

interface WeatherCardProps {
  lat: number;
  lng: number;
  district?: string;
  placeName?: string;
  className?: string;
}

export default function WeatherCard({
  lat,
  lng,
  district,
  placeName,
  className = "",
}: WeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadWeather = useCallback(async () => {
    try {
      const data = await fetchPlaceWeather(lat, lng);
      setWeather(data);
    } catch {
      setWeather(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    setIsLoading(true);
    void loadWeather();
  }, [loadWeather]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void loadWeather();
  };

  const renderWeatherIcon = (code: number, size = 20) => {
    const { iconName } = getWeatherConditionInfo(code);
    switch (iconName) {
      case "sun":
        return <FaSun size={size} className="text-amber-500" />;
      case "cloud-sun":
        return <FaCloudSun size={size} className="text-amber-500" />;
      case "cloud":
        return <FaCloud size={size} className="text-slate-400" />;
      case "smog":
        return <FaSmog size={size} className="text-stone-400" />;
      case "cloud-rain":
        return <FaCloudRain size={size} className="text-sky-500" />;
      case "cloud-showers-heavy":
        return <FaCloudShowersHeavy size={size} className="text-blue-500" />;
      case "cloud-bolt":
        return <FaCloudBolt size={size} className="text-purple-500" />;
      case "snowflake":
        return <FaSnowflake size={size} className="text-cyan-400" />;
      default:
        return <FaSun size={size} className="text-amber-500" />;
    }
  };

  if (isLoading) {
    return (
      <div
        className={`rounded-3xl border border-paper-muted/20 bg-paper-card p-6 shadow-sm flex items-center justify-center gap-3 text-paper-muted ${className}`}
      >
        <FaSpinner size={18} className="animate-spin text-terracotta" />
        <span
          className="text-xs font-semibold uppercase tracking-wider text-paper-text"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          Retrieving Real-Time Weather…
        </span>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div
      className={`rounded-3xl border border-paper-muted/20 bg-paper-card p-6 sm:p-7 shadow-sm space-y-5 ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-paper-muted/15">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-paper-bg border border-paper-muted/25 shadow-2xs">
            {renderWeatherIcon(weather.weatherCode, 22)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4
                className="text-base sm:text-lg font-medium text-paper-text leading-tight"
                style={{ fontFamily: "var(--font-fraunces), serif" }}
              >
                Atmospheric Weather
              </h4>
              <span className="inline-flex items-center rounded-full bg-terracotta/10 border border-terracotta/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-terracotta">
                Live
              </span>
            </div>
            <p
              className="text-xs text-paper-muted mt-0.5"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              Current conditions at {district ? `${district} District` : placeName || "this site"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span
              className="text-2xl sm:text-3xl font-light text-paper-text"
              style={{ fontFamily: "var(--font-fraunces), serif" }}
            >
              {weather.temperature}°C
            </span>
            <span
              className="block text-[11px] font-semibold uppercase tracking-wider text-terracotta"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              {weather.condition}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-paper-muted/30 bg-paper-bg text-paper-muted hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh current weather telemetry"
          >
            <FaArrowsRotate
              size={11}
              className={isRefreshing ? "animate-spin text-terracotta" : ""}
            />
          </button>
        </div>
      </div>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Feels Like */}
        <div className="rounded-2xl border border-paper-muted/15 bg-paper-bg/60 p-3 sm:p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-paper-muted text-[11px] font-semibold uppercase tracking-wider">
            <FaTemperatureHalf size={12} className="text-terracotta" />
            <span style={{ fontFamily: "var(--font-instrument), sans-serif" }}>Feels Like</span>
          </div>
          <span
            className="text-lg sm:text-xl font-medium text-paper-text block"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            {weather.apparentTemperature}°C
          </span>
        </div>

        {/* Humidity */}
        <div className="rounded-2xl border border-paper-muted/15 bg-paper-bg/60 p-3 sm:p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-paper-muted text-[11px] font-semibold uppercase tracking-wider">
            <FaDroplet size={12} className="text-sky-600" />
            <span style={{ fontFamily: "var(--font-instrument), sans-serif" }}>Humidity</span>
          </div>
          <span
            className="text-lg sm:text-xl font-medium text-paper-text block"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            {weather.humidity}%
          </span>
        </div>

        {/* Wind Speed */}
        <div className="rounded-2xl border border-paper-muted/15 bg-paper-bg/60 p-3 sm:p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-paper-muted text-[11px] font-semibold uppercase tracking-wider">
            <FaWind size={12} className="text-amber-600" />
            <span style={{ fontFamily: "var(--font-instrument), sans-serif" }}>Wind</span>
          </div>
          <span
            className="text-lg sm:text-xl font-medium text-paper-text block"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            {weather.windSpeed} km/h
          </span>
        </div>

        {/* Day Range */}
        <div className="rounded-2xl border border-paper-muted/15 bg-paper-bg/60 p-3 sm:p-3.5 space-y-1">
          <div className="flex items-center gap-1.5 text-paper-muted text-[11px] font-semibold uppercase tracking-wider">
            <FaSun size={12} className="text-amber-500" />
            <span style={{ fontFamily: "var(--font-instrument), sans-serif" }}>Day Range</span>
          </div>
          <span
            className="text-sm sm:text-base font-medium text-paper-text block"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            {weather.tempMin}° / {weather.tempMax}°C
          </span>
        </div>
      </div>
    </div>
  );
}
