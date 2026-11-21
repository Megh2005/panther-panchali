"use client";

import { useEffect, useRef, useState } from "react";
import { FaPause, FaPlay, FaRotateLeft, FaSpinner } from "react-icons/fa6";

interface AudioPlayerButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export default function AudioPlayerButton({
  text,
  label = "Listen",
  className = "",
}: AudioPlayerButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  // Reset audio playback if text content changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setStatus("idle");
    setErrorMessage(null);
  }, [text]);

  if (!text || !text.trim()) {
    return null;
  }

  const handleTogglePlay = async () => {
    setErrorMessage(null);

    // 1. If currently playing, pause
    if (status === "playing" && audioRef.current) {
      audioRef.current.pause();
      setStatus("paused");
      return;
    }

    // 2. If currently paused, resume
    if (status === "paused" && audioRef.current) {
      try {
        await audioRef.current.play();
        setStatus("playing");
      } catch (err) {
        console.error("Resume audio failed:", err);
        setStatus("idle");
      }
      return;
    }

    // 3. If idle, either play cached blob or fetch new TTS stream
    if (blobUrlRef.current && audioRef.current) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
        setStatus("playing");
      } catch {
        setStatus("idle");
      }
      return;
    }

    // Fetch TTS audio stream
    setStatus("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate audio.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setStatus("idle");
      };

      audio.onerror = () => {
        setStatus("idle");
        setErrorMessage("Audio playback error.");
      };

      await audio.play();
      setStatus("playing");
    } catch (err) {
      console.error("Audio playback error:", err);
      setStatus("idle");
      setErrorMessage(err instanceof Error ? err.message : "Playback error");
      setTimeout(() => setErrorMessage(null), 3500);
    }
  };

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => {
          setStatus("playing");
        })
        .catch(() => {
          setStatus("idle");
        });
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleTogglePlay}
        disabled={status === "loading"}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-2xs ${
          status === "playing"
            ? "bg-terracotta text-white border border-terracotta shadow-xs"
            : status === "paused"
              ? "bg-paper-card border border-terracotta/60 text-terracotta hover:bg-terracotta hover:text-white"
              : "bg-paper-bg border border-paper-muted/30 text-paper-text hover:border-terracotta hover:text-terracotta hover:bg-paper-card"
        }`}
        style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        title={
          status === "playing"
            ? "Pause audio narration"
            : status === "paused"
              ? "Resume audio narration"
              : `Play audio narration for ${label}`
        }
      >
        {status === "loading" ? (
          <FaSpinner size={10} className="animate-spin text-terracotta" />
        ) : status === "playing" ? (
          <FaPause size={10} />
        ) : (
          <FaPlay size={9} className="ml-0.5" />
        )}
        <span>
          {status === "loading"
            ? "Loading…"
            : status === "playing"
              ? "Pause"
              : status === "paused"
                ? "Resume"
                : label}
        </span>
      </button>

      {/* Restart button appears when audio is active (playing or paused) */}
      {(status === "playing" || status === "paused") && (
        <button
          type="button"
          onClick={handleRestart}
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-paper-muted/30 bg-paper-bg text-paper-muted hover:border-terracotta hover:text-terracotta transition-colors cursor-pointer"
          title="Restart audio from beginning"
        >
          <FaRotateLeft size={10} />
        </button>
      )}

      {errorMessage && (
        <span className="text-[10px] text-red-600 font-medium ml-1">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
