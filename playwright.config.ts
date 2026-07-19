import { defineConfig } from "@playwright/test"

export const PREVIEW_URL = "http://localhost:8787"

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:5173",
  },
  webServer: [
    {
      command: "pnpm dev",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      // OG メタは Worker が配信時に埋めるため、dist の検証は本番同等の経路で行う
      command: "wrangler dev --port 8787",
      url: PREVIEW_URL,
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
})
