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

// 🚀 Forçando o navegador a buscar a imagem direto da URL oficial
export const metadata: Metadata = {
  title: "Checklist Vivian",
  description: "Sistema de monitoramento e auditoria - Supermercados Vivian",
  icons: {
    icon: "https://auditoria-vivian-loja.vercel.app/logo.png?v=final",
    shortcut: "https://auditoria-vivian-loja.vercel.app/logo.png?v=final",
    apple: "https://auditoria-vivian-loja.vercel.app/logo.png?v=final",
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