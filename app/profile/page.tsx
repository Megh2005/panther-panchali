"use client";

import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { LuLoaderCircle, LuLogOut, LuUser } from "react-icons/lu";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  const userName = session?.user?.name || "Account User";
  const userEmail = session?.user?.email || "Google Account";
  const userImage = session?.user?.image;
  const userId = session?.user?.id || "";

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F1E6] text-[#1B1A17]">
        <LuLoaderCircle size={32} className="animate-spin text-[#B5532F]" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-svh w-full flex-col items-center justify-center bg-[#F6F1E6] px-4 py-16 text-center overflow-hidden">
      {/* Warm ambient background glow centered behind the card */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-120 w-120 rounded-full bg-radial from-[#E3C27A]/20 via-[#E3C27A]/5 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-110 mx-auto flex flex-col items-center">
        {/* Category Pill */}
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
          style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        >
          User Profile
        </span>

        {/* Heading */}
        <h1
          className="mt-2 text-3xl sm:text-4xl font-light tracking-normal text-[#1B1A17]"
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
          className="mt-8 flex w-full flex-col items-center rounded-2xl border border-[#6B6458]/20 bg-[#EDE4D3] p-8 shadow-[0_8px_32px_-4px_rgba(27,26,23,0.06),0_20px_50px_-8px_rgba(227,194,122,0.22)] text-center"
        >
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F6F1E6] border-2 border-[#B5532F]/40 shadow-sm overflow-hidden">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <LuUser size={36} className="text-[#B5532F]" />
            )}
          </div>

          {/* User Name */}
          <h2
            id="profile-card-heading"
            className="mt-4 text-2xl font-light tracking-normal text-[#1B1A17]"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
            }}
          >
            {userName}
          </h2>

          {/* User Email Address */}
          <p
            className="mt-1 text-sm text-[#6B6458] tracking-normal"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            {userEmail}
          </p>

          {/* User ID */}
          {userId && (
            <div className="mt-6 flex flex-col items-center justify-center gap-1 rounded-xl border border-[#6B6458]/15 bg-[#F6F1E6] px-4 py-3 w-full">
              <span
                className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-[#B5532F]"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                User ID
              </span>
              <span
                className="font-mono text-xs sm:text-sm text-[#1B1A17] tracking-wider select-all break-all"
                title="Your unique user ID"
              >
                {userId}
              </span>
            </div>
          )}

          {/* Sign Out CTA */}
          <div className="mt-8 pt-5 w-full border-t border-[#6B6458]/15 flex items-center justify-center">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-[#B5532F]/40 bg-[#F6F1E6] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#B5532F] transition-all hover:bg-[#B5532F] hover:text-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5532F] cursor-pointer shadow-xs"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
            >
              <LuLogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
