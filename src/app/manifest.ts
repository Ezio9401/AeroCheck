import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Stable identity so the browser keeps treating it as the same installed
    // app across deploys (independent of start_url changes).
    id: "/",
    name: "MEGA - Aerocheck",
    short_name: "Aerocheck",
    description: "Checklist de campo para inspección de ayudas visuales aeronáuticas de plataforma.",
    lang: "es",
    dir: "ltr",
    categories: ["productivity", "business", "utilities"],
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
    shortcuts: [
      {
        name: "Nueva inspección",
        short_name: "Nueva",
        description: "Abrir AeroCheck para iniciar o reanudar una inspección",
        url: "/",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
