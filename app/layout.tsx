import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "50th Anniversary Seminar — Takayasu Sensei | Takemusu Aiki Association",
  description:
    "A landmark seminar commemorating Saburo Takayasu Shihan's 50 years of teaching Aikido in Australia. 31 Oct & 1 Nov 2026, Pymble Town Hall, Sydney.",
  openGraph: {
    title: "50th Anniversary Seminar with Takayasu Sensei",
    description:
      "Commemorating 50 years of teaching authentic Iwama-style Aikido in Australia. Limited to 100 attendees.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} ${notoSerifJP.variable}`}
    >
      <body className="bg-parchment text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
