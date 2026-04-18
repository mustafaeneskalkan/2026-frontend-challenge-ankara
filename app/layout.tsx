import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
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
  title: "Missing Podo: The Ankara Case",
  description: "Investigation dashboard powered by Jotform submissions",
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
      <body className="min-h-full bg-white text-zinc-900 dark:bg-black dark:text-zinc-50">
        <div className="flex min-h-screen flex-col">
          <Header
            title={
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold leading-7">
                  Missing Podo: The Ankara Case
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Investigation dashboard (Jotform submissions)
                </p>
              </div>
            }
            search={null}
            statistics={null}
          />

          <div className="flex min-h-0 flex-1">
            <Navbar />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex min-h-0 min-w-0 flex-1">{children}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
