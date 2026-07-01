import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AeroCheck · Inspección AVA",
    short_name: "AeroCheck",
    description: "Checklist de campo para inspección de ayudas visuales aeronáuticas de plataforma.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F4F1EA",
    theme_color: "#0B1F3A",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
