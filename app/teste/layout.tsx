import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teste - Vivian",
  manifest: "/manifest-teste.json", // 🚀 Aponta para o manifesto exclusivo de testes
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function TesteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}