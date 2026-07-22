import { defineConfig } from "vitest/config";

/**
 * Service-local Vitest config (#664). Without it, `npm test` in this package
 * inherits the app's jsdom/React root config and its `./vitest.setup.ts`, which
 * do not exist here. The service is a plain Node HTTP service, so it runs in the
 * node environment with no setup files.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"]
  }
});
