// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Update this when the real domain is attached in Render.
export const SITE_URL = "https://toringunnelldigital.com";

export default defineConfig({
  site: SITE_URL,
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Astro's built-in image optimizer; sharp is the default service.
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
