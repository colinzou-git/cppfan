// Centralized build metadata (#191). Values are injected at build time by
// next.config (`env`), so they are immutable for a given deployment and never
// recomputed per request/render. All parsing/formatting is here; pages just
// render getBuildInfo(). Pure helpers take explicit inputs so they are testable.

const GITHUB_REPO_URL = "https://github.com/colinzou-git/cppfan";

export type BuildEnvironment = "Production" | "Preview" | "Development" | "Unknown";

export type BuildInfo = {
  appName: string;
  version: string;
  /** Full commit SHA, or "local"/"unknown" when Git metadata is unavailable. */
  sha: string;
  /** 7-char SHA for display, or the raw "local"/"unknown" sentinel. */
  shortSha: string;
  /** Public GitHub commit URL, or null when there is no real SHA. */
  commitUrl: string | null;
  /** Canonical build time as ISO-8601 UTC, or null when unavailable. */
  builtAtIso: string | null;
  /** Build time formatted in America/Los_Angeles, or "unknown". */
  builtAtPacific: string;
  environment: BuildEnvironment;
};

const SHA_PATTERN = /^[0-9a-f]{7,40}$/i;

export function isRealSha(sha: string | undefined | null): boolean {
  return typeof sha === "string" && SHA_PATTERN.test(sha);
}

export function shortSha(sha: string | undefined | null): string {
  if (!sha || sha.length === 0) {
    return "unknown";
  }
  return isRealSha(sha) ? sha.slice(0, 7) : sha;
}

export function commitUrl(sha: string | undefined | null): string | null {
  return isRealSha(sha) ? `${GITHUB_REPO_URL}/commit/${sha}` : null;
}

export function normalizeEnvironment(raw: string | undefined | null): BuildEnvironment {
  switch ((raw ?? "").toLowerCase()) {
    case "production":
      return "Production";
    case "preview":
      return "Preview";
    case "development":
      return "Development";
    default:
      return "Unknown";
  }
}

/**
 * Format an ISO build timestamp for display in Pacific time with the correct
 * DST-aware abbreviation (PDT/PST), e.g. "Jun 14, 2026, 1:14 AM PDT". Returns
 * "unknown" for a missing or unparseable timestamp.
 */
export function formatPacificBuildTime(iso: string | undefined | null): string {
  if (!iso) {
    return "unknown";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short"
  }).format(date);
}

export type RawBuildEnv = {
  version?: string | null;
  sha?: string | null;
  time?: string | null;
  environment?: string | null;
};

/** Resolve typed build info from raw (build-injected) values, with fallbacks. */
export function resolveBuildInfo(raw: RawBuildEnv): BuildInfo {
  const version = raw.version && raw.version.length > 0 ? raw.version : "unknown";
  const sha = raw.sha && raw.sha.length > 0 ? raw.sha : "unknown";
  const time = raw.time && raw.time.length > 0 ? raw.time : null;

  return {
    appName: "cppFan",
    version,
    sha,
    shortSha: shortSha(sha),
    commitUrl: commitUrl(sha),
    builtAtIso: time,
    builtAtPacific: formatPacificBuildTime(time),
    environment: normalizeEnvironment(raw.environment)
  };
}

/** Build info for the running deployment (build-time injected env). */
export function getBuildInfo(): BuildInfo {
  return resolveBuildInfo({
    version: process.env.NEXT_PUBLIC_BUILD_VERSION,
    sha: process.env.NEXT_PUBLIC_BUILD_SHA,
    time: process.env.NEXT_PUBLIC_BUILD_TIME,
    environment: process.env.NEXT_PUBLIC_BUILD_ENV
  });
}
