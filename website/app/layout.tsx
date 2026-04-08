import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudyZone AI — Your AI Tutor That Teaches, Not Just Summarizes",
  description:
    "Upload your notes, slides, and papers. StudyZone builds a learning path from first principles — so you actually understand.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
