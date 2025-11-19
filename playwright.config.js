/* eslint-env node */
/* global process */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/frontend/tests/**", "**/frontend/**/*.test.js"],

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  webServer: [
    {
      command: "cd backend && npm run dev",
      port: 4000,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "cd frontend && npm start",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],

  use: {
    baseURL: "http://localhost:3000",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
