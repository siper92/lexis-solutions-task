import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lexis Solutions · Invoice Parser",
  description:
    "Drop a PDF invoice to extract line items and view prices in USD, EUR, and GBP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-gray-100 font-sans text-gray-900">
        <header className="border-b border-zinc-800 bg-black">
          <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6">
            <span className="text-lg font-semibold tracking-tight text-white">
              Lexis Solutions
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
