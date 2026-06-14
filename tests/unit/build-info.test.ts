import { describe, expect, it } from "vitest";
import {
  commitUrl,
  formatPacificBuildTime,
  isRealSha,
  normalizeEnvironment,
  resolveBuildInfo,
  shortSha
} from "@/lib/build-info/build-info";

const REAL_SHA = "131345ba06c175202f100253c4285032a827a9c4";

describe("build-info SHA helpers (#191)", () => {
  it("recognizes real hex SHAs and rejects sentinels", () => {
    expect(isRealSha(REAL_SHA)).toBe(true);
    expect(isRealSha("131345b")).toBe(true);
    expect(isRealSha("local")).toBe(false);
    expect(isRealSha("unknown")).toBe(false);
    expect(isRealSha("")).toBe(false);
    expect(isRealSha(undefined)).toBe(false);
  });

  it("shortens a real SHA to 7 chars and passes sentinels through", () => {
    expect(shortSha(REAL_SHA)).toBe("131345b");
    expect(shortSha("local")).toBe("local");
    expect(shortSha("")).toBe("unknown");
    expect(shortSha(undefined)).toBe("unknown");
  });

  it("builds a commit URL only for a real SHA", () => {
    expect(commitUrl(REAL_SHA)).toBe(`https://github.com/colinzou-git/cppfan/commit/${REAL_SHA}`);
    expect(commitUrl("local")).toBeNull();
    expect(commitUrl("unknown")).toBeNull();
    expect(commitUrl(undefined)).toBeNull();
  });
});

describe("build-info environment + fallbacks (#191)", () => {
  it("normalizes the environment", () => {
    expect(normalizeEnvironment("production")).toBe("Production");
    expect(normalizeEnvironment("preview")).toBe("Preview");
    expect(normalizeEnvironment("development")).toBe("Development");
    expect(normalizeEnvironment(undefined)).toBe("Unknown");
    expect(normalizeEnvironment("staging")).toBe("Unknown");
  });

  it("falls back gracefully when nothing is injected", () => {
    const info = resolveBuildInfo({});
    expect(info.version).toBe("unknown");
    expect(info.sha).toBe("unknown");
    expect(info.shortSha).toBe("unknown");
    expect(info.commitUrl).toBeNull();
    expect(info.builtAtIso).toBeNull();
    expect(info.builtAtPacific).toBe("unknown");
    expect(info.environment).toBe("Unknown");
  });

  it("resolves a full set of injected values", () => {
    const info = resolveBuildInfo({
      version: "0.1.0",
      sha: REAL_SHA,
      time: "2026-06-14T08:14:00.000Z",
      environment: "production"
    });
    expect(info.version).toBe("0.1.0");
    expect(info.shortSha).toBe("131345b");
    expect(info.commitUrl).toContain("/commit/");
    expect(info.environment).toBe("Production");
  });
});

describe("Pacific build-time formatting with DST (#191)", () => {
  it("uses PDT in summer", () => {
    const out = formatPacificBuildTime("2026-06-14T08:14:00.000Z");
    expect(out).toContain("PDT");
    // 08:14 UTC is 01:14 PDT.
    expect(out).toMatch(/1:14\s?AM/);
    expect(out).toContain("2026");
  });

  it("uses PST in winter", () => {
    const out = formatPacificBuildTime("2026-01-15T20:00:00.000Z");
    expect(out).toContain("PST");
    expect(out).toMatch(/12:00\s?PM/);
  });

  it("returns 'unknown' for missing or invalid timestamps", () => {
    expect(formatPacificBuildTime(null)).toBe("unknown");
    expect(formatPacificBuildTime("not-a-date")).toBe("unknown");
  });
});
