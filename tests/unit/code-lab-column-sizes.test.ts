import { describe, expect, it } from "vitest";
import {
  DEFAULT_COLUMN_MINS,
  DEFAULT_COLUMN_SIZES,
  resizeLeftDivider,
  resizeRightDivider,
  resolveColumnSizes
} from "@/features/code-lab/column-sizes";

describe("Code Lab column sizing", () => {
  it("defaults to the 1/6 · 1/2 · remainder split that sums to 100", () => {
    const { left, center, right } = DEFAULT_COLUMN_SIZES;
    expect(left).toBeCloseTo(100 / 6);
    expect(center).toBe(50);
    expect(left + center + right).toBeCloseTo(100);
  });

  it("clamps the left panel to its minimum and keeps widths summing to 100", () => {
    const sizes = resolveColumnSizes(2, DEFAULT_COLUMN_SIZES.right);
    expect(sizes.left).toBe(DEFAULT_COLUMN_MINS.left);
    expect(sizes.left + sizes.center + sizes.right).toBeCloseTo(100);
  });

  it("never lets the center fall below its minimum when the left is dragged wide", () => {
    const sizes = resolveColumnSizes(90, DEFAULT_COLUMN_SIZES.right);
    expect(sizes.center).toBeGreaterThanOrEqual(DEFAULT_COLUMN_MINS.center);
    expect(sizes.left + sizes.center + sizes.right).toBeCloseTo(100);
  });

  it("resizes the left divider from a pointer fraction while preserving the right", () => {
    const next = resizeLeftDivider(0.25, DEFAULT_COLUMN_SIZES);
    expect(next.left).toBeCloseTo(25);
    expect(next.right).toBeCloseTo(DEFAULT_COLUMN_SIZES.right);
    expect(next.left + next.center + next.right).toBeCloseTo(100);
  });

  it("resizes the right divider from a pointer fraction while preserving the left", () => {
    // Pointer at 70% of the width → right panel becomes the remaining 30%.
    const next = resizeRightDivider(0.7, DEFAULT_COLUMN_SIZES);
    expect(next.right).toBeCloseTo(30);
    expect(next.left).toBeCloseTo(DEFAULT_COLUMN_SIZES.left);
    expect(next.left + next.center + next.right).toBeCloseTo(100);
  });

  it("clamps the right panel to its minimum when dragged past the edge", () => {
    const next = resizeRightDivider(0.99, DEFAULT_COLUMN_SIZES);
    expect(next.right).toBe(DEFAULT_COLUMN_MINS.right);
    expect(next.left + next.center + next.right).toBeCloseTo(100);
  });
});
