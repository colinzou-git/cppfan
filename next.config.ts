import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

/*
 * Build metadata (#191), captured exactly once when `next build` evaluates this
 * config — not per request/render. Injected via `env` so the values are inlined
 * into the bundle and stay immutable for a given build. Parsing/formatting lives
 * in src/lib/build-info; here we only collect the raw values with safe fallbacks.
 */
function readPackageVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(`${process.cwd()}/package.json`, "utf8")) as { version?: string };
    return typeof pkg.version === "string" && pkg.version.length > 0 ? pkg.version : "unknown";
  } catch {
    return "unknown";
  }
}

function resolveCommitSha(): string {
  const fromEnv = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA;
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  try {
    return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || "local";
  } catch {
    return "local";
  }
}

function resolveEnvironment(): string {
  // Vercel reports production/preview/development; otherwise fall back to NODE_ENV.
  return process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
}

const buildInfoEnv = {
  NEXT_PUBLIC_BUILD_VERSION: readPackageVersion(),
  NEXT_PUBLIC_BUILD_SHA: resolveCommitSha(),
  NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  NEXT_PUBLIC_BUILD_ENV: resolveEnvironment()
};

/*
 * Content-Security-Policy. `script-src`/`style-src` keep `'unsafe-inline'`
 * because Next.js App Router emits inline hydration scripts/styles without a
 * nonce; a nonce-based strict policy would require threading a per-request nonce
 * through middleware and is tracked as a future enhancement. Everything else is
 * locked down: outbound connections are limited to same-origin and Supabase,
 * framing and plugins are disabled, and base-uri/form-action are pinned.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'"
].join("; ");

// Conservative HTTP security headers applied to every response.
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  env: buildInfoEnv,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  }
};

export default nextConfig;
