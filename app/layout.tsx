import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
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

export const metadata: Metadata = {
  title: "Pather Panchali: The Living Canvas",
  description: "Feel Kolkata through a living story.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${newsreader.variable} ${instrumentSans.variable}`}
    >
      <body>
        <AuthProvider>
          {children}
          <NavigationDock />
        </AuthProvider>
      </body>
    </html>
  );
}
