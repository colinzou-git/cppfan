import { describe, expect, it } from "vitest";
import { selectBalancedPracticePacks, toInterviewModePack } from "@/features/interview/mock-selection";
import { getPracticeMockPacks } from "@/features/interview/mock-packs";

describe("mock selection", () => {
  it("is deterministic", () => {
    const first = selectBalancedPracticePacks(6, "week-1").map((pack) => pack.id);
    const second = selectBalancedPracticePacks(6, "week-1").map((pack) => pack.id);
    expect(second).toEqual(first);
  });

  it("includes the available categories", () => {
    const categories = new Set(selectBalancedPracticePacks(6, "coverage").map((pack) => pack.category));
    expect(categories.has("core_algorithm")).toBe(true);
    expect(categories.has("ds_implementation")).toBe(true);
    expect(categories.has("cpp_debugging")).toBe(true);
  });

  it("excludes calibration packs", () => {
    const selected = selectBalancedPracticePacks(99, "all");
    expect(selected.every((pack) => !pack.calibrationReserved)).toBe(true);
    expect(selected.length).toBe(getPracticeMockPacks().length);
  });

  it("hides pattern coverage in interview mode", () => {
    const safe = toInterviewModePack(getPracticeMockPacks()[0]);
    expect("patternCoverage" in safe).toBe(false);
  });
});
