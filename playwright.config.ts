import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },

  /*
   * Keep this smoke suite conservative and stable on Windows.
   * The app is small, and we already cover desktop/iPhone/iPad projects.
   * Serial workers avoid intermittent worker shutdown hangs after all tests pass.
   */
  fullyParallel: false,
  workers: 1,

  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: process.env.CI ? "on-first-retry" : "off",
    screenshot: "only-on-failure",
    video: "off"
  },

  /*
   * Use the production Next.js server instead of `next dev`.
   * This avoids Turbopack/HMR background work during E2E cleanup.
   */
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      NEXT_TELEMETRY_DISABLED: "1"
    }
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "iphone",
      use: { ...devices["iPhone 15"] }
    },
    {
      name: "ipad",
      use: { ...devices["iPad Pro 11"] }
    }
  ]
});
