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

// 🚀 ATUALIZAÇÃO: Forçando o navegador a reconhecer o novo ícone colorido (v=3)
export const metadata: Metadata = {
  title: "Checklist Vivian",
  description: "Sistema de monitoramento e auditoria - Supermercados Vivian",
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", href: "/favicon.ico?v=3" },
      { url: "/logo.png?v=3", href: "/logo.png?v=3" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/logo.png?v=3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}