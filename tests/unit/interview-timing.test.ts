import { describe, expect, it } from "vitest";
import { summarizeTiming } from "@/features/interview/interview-timing";

describe("summarizeTiming (#182)", () => {
  it("returns nulls and zero samples when nothing is logged", () => {
    expect(summarizeTiming([])).toEqual({
      approachMedianMinutes: null,
      implementationMedianMinutes: null,
      approachSamples: 0,
      implementationSamples: 0
    });
  });

  it("computes median minutes and ignores null (unlogged) samples", () => {
    const summary = summarizeTiming([
      { approachSeconds: 120, implementationSeconds: null }, // 2 min approach
      { approachSeconds: 360, implementationSeconds: 1200 }, // 6 min approach, 20 min impl
      { approachSeconds: null, implementationSeconds: 600 } // 10 min impl
    ]);
    expect(summary.approachMedianMinutes).toBe(4); // median(120, 360) = 240s = 4 min
    expect(summary.approachSamples).toBe(2);
    expect(summary.implementationMedianMinutes).toBe(15); // median(1200, 600) = 900s = 15 min
    expect(summary.implementationSamples).toBe(2);
  });

  it("takes the middle value for an odd count and rounds to one decimal", () => {
    const summary = summarizeTiming([
      { approachSeconds: 90, implementationSeconds: null },
      { approachSeconds: 150, implementationSeconds: null },
      { approachSeconds: 200, implementationSeconds: null }
    ]);
    expect(summary.approachMedianMinutes).toBe(2.5); // median = 150s = 2.5 min
    expect(summary.approachSamples).toBe(3);
  });

  it("ignores negative timings defensively", () => {
    const summary = summarizeTiming([{ approachSeconds: -10, implementationSeconds: -1 }]);
    expect(summary.approachMedianMinutes).toBeNull();
    expect(summary.implementationMedianMinutes).toBeNull();
  });
});
