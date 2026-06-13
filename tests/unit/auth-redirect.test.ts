import { describe, expect, it } from "vitest";
import { getAuthRedirectUrl, getSafeNextPath } from "@/lib/auth/redirect";

const TAB = String.fromCharCode(9);
const NEWLINE = String.fromCharCode(10);
const NUL = String.fromCharCode(0);

describe("getSafeNextPath (#140 open-redirect hardening)", () => {
  it("rejects backslash and encoded-backslash/slash external redirects", () => {
    // The historical bypass: new URL("/\\evil.example", origin) becomes external.
    expect(getSafeNextPath("/\\evil.example")).toBe("/dashboard");
    expect(getSafeNextPath("/%5cevil.example")).toBe("/dashboard");
    expect(getSafeNextPath("/%5Cevil.example")).toBe("/dashboard");
    expect(getSafeNextPath("/%2fevil.example")).toBe("/dashboard");
    expect(getSafeNextPath("/\\/evil.example")).toBe("/dashboard");
  });

  it("rejects scheme-relative and absolute-URL targets", () => {
    expect(getSafeNextPath("//evil.example")).toBe("/dashboard");
    expect(getSafeNextPath("https://evil.example")).toBe("/dashboard");
    expect(getSafeNextPath("http://evil.example/path")).toBe("/dashboard");
    expect(getSafeNextPath("javascript:alert(1)")).toBe("/dashboard");
  });

  it("rejects whitespace and control characters", () => {
    expect(getSafeNextPath("/ /evil.example")).toBe("/dashboard");
    expect(getSafeNextPath(`/x${TAB}y`)).toBe("/dashboard");
    expect(getSafeNextPath(`/x${NEWLINE}y`)).toBe("/dashboard");
    expect(getSafeNextPath(`/x${NUL}y`)).toBe("/dashboard");
  });

  it("falls back for empty, missing, or non-absolute values", () => {
    expect(getSafeNextPath(null)).toBe("/dashboard");
    expect(getSafeNextPath(undefined)).toBe("/dashboard");
    expect(getSafeNextPath("")).toBe("/dashboard");
    expect(getSafeNextPath("dashboard")).toBe("/dashboard");
    expect(getSafeNextPath("relative/path")).toBe("/dashboard");
  });

  it("preserves valid internal absolute-path redirects with query and hash", () => {
    expect(getSafeNextPath("/dashboard")).toBe("/dashboard");
    expect(getSafeNextPath("/onboarding")).toBe("/onboarding");
    expect(getSafeNextPath("/learn/x?mode=review#details")).toBe("/learn/x?mode=review#details");
    expect(getSafeNextPath("/review")).toBe("/review");
  });
});

describe("redirect resolution cannot leave the cppFan origin (#140)", () => {
  const origin = "https://cppfan.example";
  const attacks = [
    "/\\evil.example",
    "/%5cevil.example",
    "/%2fevil.example",
    "//evil.example",
    "https://evil.example",
    "http://evil.example/x",
    "/ /evil.example",
    `/x${TAB}//evil.example`,
    "/@evil.example",
    "/\\/\\evil.example"
  ];

  it("keeps the resolved redirect URL on the same origin for every attack input", () => {
    for (const attack of attacks) {
      const safe = getSafeNextPath(attack);
      // Mirrors app/auth/callback/route.ts: new URL(next, request.url).
      const resolved = new URL(safe, `${origin}/auth/callback`);
      expect(resolved.origin, `attack input: ${JSON.stringify(attack)}`).toBe(origin);
    }
  });

  it("getAuthRedirectUrl only ever embeds a same-origin next path", () => {
    const url = new URL(getAuthRedirectUrl(origin, "/\\evil.example"));
    expect(url.origin).toBe(origin);
    expect(url.searchParams.get("next")).toBe("/dashboard");
  });
});
