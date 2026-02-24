import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RH - Vivian",
  manifest: "/manifest-rh.json", // 🚀 Aponta para o manifesto exclusivo do RH
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RHLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}