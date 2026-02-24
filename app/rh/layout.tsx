import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RH - Vivian",
  manifest: "/manifest-rh.json", // 🚀 Aponta para o manifesto exclusivo do RH
};

export default function RHLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}