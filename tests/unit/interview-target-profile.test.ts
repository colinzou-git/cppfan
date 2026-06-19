import { describe, expect, it } from "vitest";
import {
  DIAGNOSTIC_RETAKE_INTERVAL_DAYS,
  INTERVIEW_CPP_STANDARDS,
  INTERVIEW_TARGET_PROFILES,
  diagnosticRetakeAvailability
} from "@/features/interview/target-profile";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 5, 18, 12);

describe("Staff systems interview target (#175)", () => {
  it("keeps the target role separate and exposes supported C++ standards", () => {
    expect(INTERVIEW_TARGET_PROFILES.map((item) => item.id)).toContain("google_staff_systems");
    expect(INTERVIEW_CPP_STANDARDS.map((item) => item.id)).toEqual(["cpp17", "cpp20", "cpp23"]);
  });

  it("allows the first diagnostic immediately", () => {
    expect(diagnosticRetakeAvailability(null, NOW)).toEqual({
      allowed: true,
      nextAllowedAtMs: null,
      daysRemaining: 0
    });
  });

  it("spaces retakes by the documented interval", () => {
    const last = NOW - 2 * DAY;
    const result = diagnosticRetakeAvailability(last, NOW);
    expect(DIAGNOSTIC_RETAKE_INTERVAL_DAYS).toBe(7);
    expect(result.allowed).toBe(false);
    expect(result.nextAllowedAtMs).toBe(last + 7 * DAY);
    expect(result.daysRemaining).toBe(5);
  });

  it("allows a retake exactly at the boundary", () => {
    expect(diagnosticRetakeAvailability(NOW - 7 * DAY, NOW).allowed).toBe(true);
  });
});
