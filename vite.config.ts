import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

import { cloudflare } from "@cloudflare/vite-plugin";
import { ogPlugin } from "./scripts/vite-plugin-og.js"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare(), ogPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})