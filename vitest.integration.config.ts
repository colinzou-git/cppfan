import path from "node:path";
import { defineConfig } from "vitest/config";

// Authenticated integration tests (#96). These run against a disposable LOCAL
// Supabase stack (`supabase start`) in CI/Codespaces — never production. They are
// excluded from the default `pnpm test` (unit) run and invoked via
// `pnpm test:integration`. Node environment (no jsdom); real network to the local
// stack. The suite self-skips when the SUPABASE_* env vars are not present.

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/integration/**/*.test.ts"],
    // The local stack + auth round-trips are slower than unit tests.
    testTimeout: 30000,
    hookTimeout: 60000,
    // Sequential: scenarios share the two test users and ordering matters.
    fileParallelism: false
  },
  resolve: {
    alias: [
      { find: "@/components", replacement: path.resolve(__dirname, "components") },
      { find: "@/app", replacement: path.resolve(__dirname, "app") },
      { find: "@", replacement: path.resolve(__dirname, "src") }
    ]
  }
});
