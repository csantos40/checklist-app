import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Checklist Vivian",
    short_name: "Vivian",
    description: "Sistema de monitoramento e auditoria - Supermercados Vivian",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1C3D",
    theme_color: "#0B1C3D",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/maskable-icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
