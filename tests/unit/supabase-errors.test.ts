import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isConfiguredFailure,
  isMissingObjectError,
  logConfiguredFailure,
  MISSING_OBJECT_CODES
} from "@/lib/supabase/errors";

// #146: the shared classifier decides when a Supabase error is a legitimate
// pre-migration / missing-object state (labeled seed fallback is acceptable)
// versus a real configured-database failure that must be observable, never
// silently swallowed by a feature query returning a default state.

describe("missing-object classification (#146)", () => {
  it("treats every documented missing-object code as pre-migration, not a failure", () => {
    for (const code of MISSING_OBJECT_CODES) {
      expect(isMissingObjectError({ code })).toBe(true);
      expect(isConfiguredFailure({ code })).toBe(false);
    }
  });

  it("treats null/undefined (no error) as neither missing-object nor a failure", () => {
    expect(isMissingObjectError(null)).toBe(false);
    expect(isMissingObjectError(undefined)).toBe(false);
    expect(isConfiguredFailure(null)).toBe(false);
    expect(isConfiguredFailure(undefined)).toBe(false);
  });

  it("treats permission/network/drift codes as configured failures", () => {
    for (const code of ["42501", "PGRST301", "08006", "PGRST116", "", undefined]) {
      expect(isMissingObjectError({ code })).toBe(false);
      expect(isConfiguredFailure({ code })).toBe(true);
    }
  });
});

describe("configured-failure logging (#146)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs a secret-free, code-tagged line only for configured failures", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    logConfiguredFailure("recommendations", { code: "42501" });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toContain("[recommendations]");
    expect(spy.mock.calls[0]?.[0]).toContain("42501");

    // Pre-migration and no-error states stay silent.
    logConfiguredFailure("recommendations", { code: "42883" });
    logConfiguredFailure("recommendations", null);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
