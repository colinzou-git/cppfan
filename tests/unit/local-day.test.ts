import { describe, expect, it } from "vitest";
import { localDateKey, nextLocalMidnight } from "@/lib/time/local-day";

describe("local day helpers", () => {
  it("uses the learner timezone for the date key", () => {
    const instant = new Date("2026-06-19T06:30:00.000Z");
    expect(localDateKey(instant, "America/Los_Angeles")).toBe("2026-06-18");
    expect(localDateKey(instant, "Pacific/Auckland")).toBe("2026-06-19");
  });

  it("returns the exclusive next-midnight bound across spring DST", () => {
    const instant = new Date("2026-03-08T12:00:00.000Z");
    expect(nextLocalMidnight(instant, "America/Los_Angeles").toISOString()).toBe("2026-03-09T07:00:00.000Z");
  });

  it("returns the exclusive next-midnight bound across fall DST", () => {
    const instant = new Date("2026-11-01T12:00:00.000Z");
    expect(nextLocalMidnight(instant, "America/Los_Angeles").toISOString()).toBe("2026-11-02T08:00:00.000Z");
  });
});
