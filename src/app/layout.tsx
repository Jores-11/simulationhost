import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { ReactNode, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Business Analytics Dashboard",
  description: "A dashboard for scenario planning and financial analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 min-h-screen flex flex-col`}
      >
        {/* Principal Navbar */}
        <header className="w-full bg-white shadow-md p-4 flex justify-between items-center fixed top-0 left-0 z-20 dark:bg-gray-800 dark:text-white">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Siumulation</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 dark:text-gray-300">User Profile</span>
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-gray-700 dark:text-gray-300">👤</span>
            </div>
          </div>
        </header>

        {/* Main Content with Sidebar */}
        <div className="flex flex-1 pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}