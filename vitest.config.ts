import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/out/**",
      "**/coverage/**",
      "tests/e2e/**",
      "playwright-report/**",
      "test-results/**"
    ]
  },
  resolve: {
    // Most-specific aliases first: vite matches the first entry, so "@/components"
    // and "@/app" must precede the catch-all "@" -> src. String finds keep vite's
    // path-boundary semantics (so scoped packages like "@testing-library/*" are
    // not matched).
    alias: [
      { find: "@/components", replacement: path.resolve(__dirname, "components") },
      { find: "@/app", replacement: path.resolve(__dirname, "app") },
      { find: "@", replacement: path.resolve(__dirname, "src") }
    ]
  }
});
