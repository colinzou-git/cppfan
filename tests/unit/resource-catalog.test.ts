import { describe, expect, it } from "vitest";
import {
  externalResources,
  getResourcesByKind,
  getResourcesByTag
} from "@/features/resources/resource-catalog";

const VALID_KINDS = new Set(["tutorial", "reference", "practice", "guidelines", "project"]);
const VALID_TAGS = new Set(["cpp", "dsa", "projects"]);

describe("external resource catalog", () => {
  it("has at least one resource", () => {
    expect(externalResources.length).toBeGreaterThan(0);
  });

  it("uses unique ids", () => {
    const ids = externalResources.map((resource) => resource.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses https urls", () => {
    for (const resource of externalResources) {
      expect(resource.url.startsWith("https://")).toBe(true);
      expect(() => new URL(resource.url)).not.toThrow();
    }
  });

  it("uses only known kinds and tags, and tags are non-empty", () => {
    for (const resource of externalResources) {
      expect(VALID_KINDS.has(resource.kind)).toBe(true);
      expect(resource.tags.length).toBeGreaterThan(0);
      for (const tag of resource.tags) {
        expect(VALID_TAGS.has(tag)).toBe(true);
      }
    }
  });

  it("filters by kind and tag", () => {
    expect(getResourcesByKind("reference").every((r) => r.kind === "reference")).toBe(true);
    expect(getResourcesByTag("dsa").every((r) => r.tags.includes("dsa"))).toBe(true);
    expect(getResourcesByKind("tutorial").length).toBeGreaterThan(0);
  });
});
