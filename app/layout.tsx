import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, Newsreader } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import AuthProvider from "@/components/auth-provider";
import NavigationDock from "@/components/navigation-dock";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: "variable",
  style: "italic",
  axes: ["opsz"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  display: "swap",
});

const BRAND_LOGO_URL =
  "https://res.cloudinary.com/dlf6jkg3d/image/upload/v1795348826/Bengal_Heritage_Film_Emblem_lcbzbs.png";

export const metadata: Metadata = {
  title: "Panther Panchali: The Living Canvas",
  description: "Feel Kolkata through a living story.",
  icons: {
    icon: BRAND_LOGO_URL,
    shortcut: BRAND_LOGO_URL,
    apple: BRAND_LOGO_URL,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${newsreader.variable} ${instrumentSans.variable}`}
    >
      <head>
        <link rel="icon" href={BRAND_LOGO_URL} type="image/png" />
        <link rel="apple-touch-icon" href={BRAND_LOGO_URL} sizes="180x180" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Suspense fallback={null}>
            <NavigationDock />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
