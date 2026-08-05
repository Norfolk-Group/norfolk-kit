import { defineConfig, devices } from "@playwright/test";

export const REVIEW_VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 390, height: 844 },
} as const;

export default defineConfig({
  testDir: "tests/browser",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
    deviceScaleFactor: 1,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { viewport: REVIEW_VIEWPORTS.desktop } },
    { name: "tablet-chromium", use: { viewport: REVIEW_VIEWPORTS.tablet } },
    { name: "mobile-chromium", use: { ...devices["Desktop Chrome"], viewport: REVIEW_VIEWPORTS.mobile, isMobile: true } },
  ],
  webServer: [
    { command: "pnpm dev:server", port: 3000, reuseExistingServer: !process.env.CI },
    { command: "pnpm dev --host 127.0.0.1 --port 4173 --strictPort", port: 4173, reuseExistingServer: !process.env.CI },
  ],
});
