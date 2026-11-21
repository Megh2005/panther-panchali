"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaArrowLeft, FaSpinner } from "react-icons/fa6";

function AuthForm() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/guide");
    }
  }, [status, router]);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signIn("google", {
        callbackUrl: "/guide",
      });
    } catch {
      setErrorMessage("Connection interrupted. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-paper-bg px-4 py-12 text-center overflow-hidden">
      {/* Warm ambient background glow centered behind the card */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-radial from-[#E3C27A]/25 via-[#E3C27A]/5 to-transparent blur-3xl"
        aria-hidden="true"
      />

      {/* Pinned top-left return link */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-20 inline-flex items-center gap-2 rounded-sm text-xs font-medium uppercase tracking-[0.18em] text-paper-muted transition-colors duration-200 hover:text-paper-text sm:top-8 sm:left-8"
        style={{ fontFamily: "var(--font-instrument), sans-serif" }}
        aria-label="Back to home"
      >
        <FaArrowLeft size={14} aria-hidden="true" />
        <span>Back to home</span>
      </Link>

      {/* Centered Card (max 420px) */}
      <main className="relative z-10 w-full max-w-105 mx-auto">
        <section
          aria-labelledby="auth-heading"
          className="flex w-full flex-col items-center justify-center rounded-2xl border border-paper-muted/20 bg-paper-card px-7 py-10 text-center shadow-[0_8px_32px_-4px_rgba(27,26,23,0.06),0_20px_50px_-8px_rgba(227,194,122,0.22)] sm:px-10 sm:py-12 transition-all"
        >
          {/* Accent Label */}
          <span
            className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            Welcome
          </span>

          {/* Heading */}
          <h1
            id="auth-heading"
            className="mt-3.5 text-3xl font-light tracking-normal leading-[1.14] text-paper-text sm:text-4xl text-balance"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontVariationSettings: '"opsz" 36, "SOFT" 85, "WONK" 1',
            }}
          >
            Step into the canvas
          </h1>

          {/* Supporting Line */}
          <p
            className="mt-3 max-w-[320px] text-base italic tracking-normal leading-relaxed text-paper-muted text-balance"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Sign in to begin your journey through the city, and to keep every
            story you shape.
          </p>

          {/* Action Area: Google Authentication Button (Only Action) */}
          <div className="mt-8 flex w-full flex-col items-center gap-3">
            {/* Inline Error Announcement */}
            {errorMessage && (
              <div
                role="status"
                aria-live="polite"
                className="w-full text-center text-xs sm:text-sm tracking-normal text-terracotta mb-1"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                {errorMessage}
              </div>
            )}

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="relative flex min-h-13 w-full items-center justify-center rounded-2xl border border-paper-muted/30 bg-paper-bg px-5 py-3.5 text-sm sm:text-base font-medium text-paper-text shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-terracotta/60 hover:shadow-[0_4px_20px_rgba(227,194,122,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5532F] cursor-pointer disabled:cursor-not-allowed disabled:opacity-75"
              style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              aria-busy={isLoading}
            >
              <span
                className="absolute left-5 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                {isLoading ? (
                  <FaSpinner
                    size={20}
                    className="animate-spin text-terracotta"
                  />
                ) : (
                  <FcGoogle size={22} />
                )}
              </span>

              <span>
                {isLoading ? "Connecting…" : "Continue with Google"}
              </span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper-bg">
          <FaSpinner size={28} className="animate-spin text-terracotta" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
