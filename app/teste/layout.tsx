import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teste - Vivian",
  manifest: "/manifest-teste.json", // 🚀 Aponta para o manifesto exclusivo de testes
};

export default function TesteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}