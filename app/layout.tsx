import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChangeMode from "./components/ChangeMode";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartStock - Gestion de Stock Intelligente",
  description: "Gestion de stock moderne et intelligente avec IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-base-100 text-base-content`}
        >
          <div style={{ position: "fixed", top: 16, right: 16, zIndex: 100 }}>
            <ChangeMode />
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
