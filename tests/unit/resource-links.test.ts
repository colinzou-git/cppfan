import { describe, expect, it } from "vitest";
import { classifyStatus, collectResourceUrls } from "../../scripts/check-resource-links.mjs";

describe("resource-link checker (#176)", () => {
  it("collects unique, well-formed external URLs from the catalogs", async () => {
    const urls: string[] = await collectResourceUrls();
    expect(urls.length).toBeGreaterThan(20);
    expect(new Set(urls).size).toBe(urls.length); // unique
    expect(urls.every((u: string) => /^https?:\/\//.test(u))).toBe(true);
    expect(urls.every((u: string) => URL.canParse(u))).toBe(true);
    // Catalog staples are present.
    expect(urls).toContain("https://cses.fi/problemset/");
    expect(urls.some((u: string) => u.includes("cp-algorithms.com"))).toBe(true);
  });

  it("flags 4xx as stale, tolerates rate limiting and reachable responses", () => {
    expect(classifyStatus(404)).toBe("stale");
    expect(classifyStatus(410)).toBe("stale");
    expect(classifyStatus(403)).toBe("stale");
    expect(classifyStatus(429)).toBe("unverified"); // rate limited, not stale
    expect(classifyStatus(200)).toBe("ok");
    expect(classifyStatus(301)).toBe("ok");
    expect(classifyStatus(500)).toBe("ok"); // server hiccup, not a stale link
  });
});
