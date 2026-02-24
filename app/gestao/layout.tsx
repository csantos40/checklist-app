import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestão - Vivian",
  manifest: "/manifest-gestao.json", // 🚀 Aponta para o manifesto exclusivo da Gestão
};

export default function GestaoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}