// src/app/layout.jsx
//
// Required file for the App Router — every page renders inside this.
// Loads the two fonts referenced in tailwind.config.js
// (--font-rajdhani for headings, --font-inter for body text).

import { Rajdhani, Inter } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Ember Arena",
  description: "Book your slot. Claim the arena.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${rajdhani.variable} ${inter.variable}`}>
        <AuthGuard>
          <Navbar />
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
