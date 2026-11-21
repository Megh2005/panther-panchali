"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { FaArrowRightFromBracket, FaCompass, FaRoute, FaSpinner, FaUser } from "react-icons/fa6";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const userName = session?.user?.name || "Account User";
  const userEmail = session?.user?.email || "Google Account";
  const userImage = session?.user?.image;
  const userId = session?.user?.id || "";

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper-bg text-paper-text">
        <FaSpinner size={28} className="animate-spin text-terracotta" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-svh w-full flex-col items-center justify-center bg-paper-bg px-4 py-16 text-center overflow-hidden">
      {/* Warm ambient background glow centered behind the card */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-120 w-120 rounded-full bg-radial from-[#E3C27A]/20 via-[#E3C27A]/5 to-transparent blur-3xl opacity-75"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-110 mx-auto flex flex-col items-center">
        {/* Category Pill */}
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          User Profile
        </span>

        {/* Heading */}
        <h1
          className="mt-2 text-3xl sm:text-4xl font-light tracking-normal text-paper-text"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
          }}
        >
          Account Profile
        </h1>

        {/* Minimal Identity Card */}
        <section
          aria-labelledby="profile-card-heading"
          className="mt-8 flex w-full flex-col items-center rounded-3xl border border-paper-muted/20 bg-paper-card p-8 shadow-[0_8px_32px_-4px_rgba(27,26,23,0.06),0_20px_50px_-8px_rgba(227,194,122,0.22)] text-center"
        >
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-paper-bg border-2 border-terracotta/40 shadow-sm overflow-hidden">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <FaUser size={32} className="text-terracotta" />
            )}
          </div>

          {/* User Name */}
          <h2
            id="profile-card-heading"
            className="mt-4 text-2xl font-light tracking-normal text-paper-text"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
            }}
          >
            {userName}
          </h2>

          {/* User Email Address */}
          <p
            className="mt-1 text-sm text-paper-muted tracking-normal"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            {userEmail}
          </p>

          {/* User ID */}
          {userId && (
            <div className="mt-6 flex flex-col items-center justify-center gap-1 rounded-2xl border border-paper-muted/15 bg-paper-bg px-4 py-3 w-full">
              <span
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-terracotta"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                User ID
              </span>
              <span
                className="font-mono text-xs sm:text-sm text-paper-text tracking-wider select-all break-all"
                title="Your unique user ID"
              >
                {userId}
              </span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="mt-8 pt-5 w-full border-t border-paper-muted/15 flex flex-col items-center gap-3">
            <Link
              href="/guide"
              className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-terracotta px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-paper-text hover:scale-105 cursor-pointer shadow-xs"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <FaCompass size={14} />
              <span>Open Bengal Guide</span>
            </Link>

            <Link
              href="/journeys"
              className="inline-flex items-center justify-center gap-2 w-full rounded-full border border-paper-muted/30 bg-paper-bg px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-paper-text transition-all duration-300 hover:border-terracotta hover:text-terracotta hover:scale-105 cursor-pointer shadow-xs"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <FaRoute size={14} />
              <span>My Bengal Journey</span>
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center justify-center gap-2 w-full rounded-full border border-terracotta/40 bg-paper-bg px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-terracotta transition-all duration-300 hover:bg-terracotta hover:text-white hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta cursor-pointer shadow-xs"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <FaArrowRightFromBracket size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
