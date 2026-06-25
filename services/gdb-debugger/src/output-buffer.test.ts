import { describe, expect, it } from "vitest";
import { OutputBuffer } from "./output-buffer";

describe("OutputBuffer (#442)", () => {
  it("accumulates output under the cap", () => {
    const buf = new OutputBuffer(100);
    buf.append("hello ");
    buf.append("world");
    expect(buf.toString()).toBe("hello world");
    expect(buf.truncated).toBe(false);
  });

  it("caps output and marks truncation", () => {
    const buf = new OutputBuffer(5);
    buf.append("12345");
    buf.append("67890");
    expect(buf.truncated).toBe(true);
    expect(buf.toString().startsWith("12345")).toBe(true);
    expect(buf.toString()).toContain("truncated");
  });

  it("truncates a single oversized write at the boundary", () => {
    const buf = new OutputBuffer(3);
    buf.append("abcdef");
    expect(buf.toString().startsWith("abc")).toBe(true);
    expect(buf.truncated).toBe(true);
  });
});
