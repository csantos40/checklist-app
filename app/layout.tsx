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
  title: "Check Store",
  description: "Sistema de monitoramento e auditoria - Check Store",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 🚀 suppressHydrationWarning evita a tela vermelha do erro de extensões
    <html lang="pt-br" suppressHydrationWarning>
      {/* 🚀 overscroll-y-none trava o arrasto no Tailwind */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overscroll-y-none`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}