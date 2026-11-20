"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  LuCompass,
  LuGlobe,
  LuHouse,
  LuImagePlus,
  LuLogIn,
  LuLogOut,
  LuMenu,
  LuRoute,
  LuUser,
  LuX,
} from "react-icons/lu";

interface NavDestination {
  id: string;
  name: string;
  href: string;
  icon: IconType;
}

const AUTHENTICATED_DESTINATIONS: NavDestination[] = [
  { id: "home", name: "Home", href: "/", icon: LuHouse },
  { id: "canvas", name: "Create Post", href: "/canvas", icon: LuImagePlus },
  { id: "explore", name: "Kolkata Feed", href: "/explore", icon: LuGlobe },
  { id: "journeys", name: "My Archive", href: "/journeys", icon: LuRoute },
  { id: "profile", name: "Profile", href: "/profile", icon: LuUser },
];

const PUBLIC_DESTINATIONS: NavDestination[] = [
  { id: "home", name: "Home", href: "/", icon: LuHouse },
];

const SIGN_OUT: NavDestination = {
  id: "signout",
  name: "Sign out",
  href: "/auth",
  icon: LuLogOut,
};

const SIGN_IN: NavDestination = {
  id: "signin",
  name: "Sign in",
  href: "/auth",
  icon: LuLogIn,
};

export default function NavigationDock() {
  const pathname = usePathname();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const visibleDestinations = isAuthenticated
    ? AUTHENTICATED_DESTINATIONS
    : PUBLIC_DESTINATIONS;

  const getActiveId = () => {
    if (pathname === "/") return "home";
    if (pathname?.startsWith("/canvas")) return "canvas";
    if (pathname?.startsWith("/explore") || pathname?.startsWith("/posts")) return "explore";
    if (pathname?.startsWith("/journeys")) return "journeys";
    if (pathname?.startsWith("/profile")) return "profile";
    return "";
  };
  const activeId = getActiveId();

  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number | null>(null);

  const isHidden = pathname?.startsWith("/auth");

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSidebar();
        return;
      }

      if (event.key === "Tab") {
        const focusable = sidebarRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeSidebar]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchCurrentX.current !== null) {
      const deltaX = touchStartX.current - touchCurrentX.current;
      if (deltaX > 45) {
        closeSidebar();
      }
    }
    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  if (isHidden) {
    return null;
  }

  return (
    <>
      {/* 1. Desktop & Tablet Floating Dock */}
      <nav
        aria-label="Main Navigation"
        className="fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-1.5 rounded-full border border-paper-muted/20 bg-paper-card/95 backdrop-blur-md px-3 py-1.5 md:flex shadow-[0_8px_32px_rgba(27,26,23,0.12),0_18px_48px_rgba(227,194,122,0.22)]"
        style={{
          bottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 0.75rem))",
        }}
      >
        {visibleDestinations.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-gold-glow text-red-600 shadow-sm ring-2 ring-[#C89B3C]/50 font-bold"
                  : "text-paper-muted hover:bg-paper-text/5 hover:text-paper-text"
              }`}
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={20}
                aria-hidden="true"
                className={isActive ? "text-paper-text stroke-[2.25]" : ""}
              />

              {isActive && (
                <span
                  className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-paper-text shadow-[0_0_6px_rgba(27,26,23,0.4)]"
                  aria-hidden="true"
                />
              )}

              {/* Native Tailwind Tooltip */}
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-full border border-paper-muted/20 bg-paper-bg px-2.5 py-1 text-[11px] font-medium tracking-normal text-paper-text shadow-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100 whitespace-nowrap z-50">
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="mx-1 h-5 w-px bg-paper-muted/25" aria-hidden="true" />

        {/* Sign in / Sign out */}
        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full text-paper-muted transition-all hover:bg-terracotta/10 hover:text-terracotta cursor-pointer"
            aria-label={SIGN_OUT.name}
          >
            <SIGN_OUT.icon size={20} aria-hidden="true" />
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-full border border-paper-muted/20 bg-paper-bg px-2.5 py-1 text-[11px] font-medium tracking-normal text-paper-text shadow-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100 whitespace-nowrap z-50">
              {SIGN_OUT.name}
            </span>
          </button>
        ) : (
          <Link
            href="/auth"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full text-paper-muted transition-all hover:bg-terracotta/10 hover:text-terracotta"
            aria-label={SIGN_IN.name}
          >
            <SIGN_IN.icon size={20} aria-hidden="true" />
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-full border border-paper-muted/20 bg-paper-bg px-2.5 py-1 text-[11px] font-medium tracking-normal text-paper-text shadow-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100 whitespace-nowrap z-50">
              {SIGN_IN.name}
            </span>
          </Link>
        )}
      </nav>

      {/* 2. Mobile Navigation Drawer */}
      <button
        ref={menuButtonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-paper-muted/20 bg-paper-card text-paper-text shadow-[0_2px_10px_rgba(27,26,23,0.08)] transition-all duration-200 hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B5532F] md:hidden cursor-pointer"
        style={{
          top: "max(1rem, env(safe-area-inset-top))",
          left: "max(1rem, env(safe-area-inset-left))",
        }}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <LuX size={20} aria-hidden="true" />
        ) : (
          <LuMenu size={20} aria-hidden="true" />
        )}
      </button>

      {/* Dimmed Background Scrim */}
      <div
        onClick={closeSidebar}
        className={`fixed inset-0 z-40 bg-paper-text/35 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sliding Sidebar Panel */}
      <aside
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Mobile Navigation Menu"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-40 flex w-[80vw] max-w-[320px] flex-col justify-between border-r border-paper-muted/20 bg-paper-card px-5 shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          paddingTop: "max(5rem, calc(env(safe-area-inset-top) + 4rem))",
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
        }}
      >
        <nav aria-label="Mobile Destinations" className="flex flex-col gap-1.5">
          <span
            className="mb-2 px-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-terracotta"
            style={{ fontFamily: "var(--font-instrument), sans-serif" }}
          >
            Navigation
          </span>

          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {visibleDestinations.map((item) => {
              const isActive = activeId === item.id;
              const Icon = item.icon;

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={`flex items-center gap-3.5 rounded-xl px-4 py-3 transition-colors duration-200 ${
                      isActive
                        ? "border-l-4 border-gold-glow bg-gold-glow/25 font-bold text-paper-text shadow-xs"
                        : "border-l-4 border-transparent text-paper-muted hover:bg-paper-text/5 hover:text-paper-text"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon
                      size={20}
                      aria-hidden="true"
                      className={isActive ? "text-[#8C6214] stroke-[2.25]" : ""}
                    />
                    <span
                      className="text-base tracking-normal"
                      style={{
                        fontFamily: "var(--font-instrument), sans-serif",
                      }}
                    >
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Session Row */}
        <div className="mt-auto border-t border-paper-muted/15 pt-4">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                closeSidebar();
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-paper-muted transition-colors duration-200 hover:bg-paper-text/5 hover:text-terracotta cursor-pointer"
            >
              <SIGN_OUT.icon size={20} aria-hidden="true" />
              <span
                className="text-base tracking-normal"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                {SIGN_OUT.name}
              </span>
            </button>
          ) : (
            <Link
              href="/auth"
              onClick={closeSidebar}
              className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-paper-muted transition-colors duration-200 hover:bg-paper-text/5 hover:text-terracotta"
            >
              <SIGN_IN.icon size={20} aria-hidden="true" />
              <span
                className="text-base tracking-normal"
                style={{ fontFamily: "var(--font-instrument), sans-serif" }}
              >
                {SIGN_IN.name}
              </span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
