import { describe, expect, it } from "vitest";
import { SessionManager } from "./session-manager";

const LIMITS = { sessionWallMs: 1000, idleTimeoutMs: 300 };

function manager() {
  let n = 0;
  return new SessionManager<{ name: string }>(LIMITS, () => `s${++n}`);
}

describe("SessionManager (#442)", () => {
  it("creates, gets, and removes sessions", () => {
    const m = manager();
    const created = m.create({ name: "a" }, 0);
    expect(created.id).toBe("s1");
    expect(m.get("s1")).toEqual({ name: "a" });
    expect(m.size).toBe(1);
    expect(m.remove("s1")).toEqual({ name: "a" });
    expect(m.get("s1")).toBeUndefined();
    expect(m.size).toBe(0);
  });

  it("expires a session that has been idle too long", () => {
    const m = manager();
    m.create({ name: "a" }, 0);
    expect(m.expired(299)).toEqual([]);
    expect(m.expired(300)).toEqual(["s1"]);
  });

  it("touch resets the idle window", () => {
    const m = manager();
    m.create({ name: "a" }, 0);
    m.touch("s1", 250);
    expect(m.expired(300)).toEqual([]);
    expect(m.expired(550)).toEqual(["s1"]);
  });

  it("expires a session past its wall-clock lifetime despite activity", () => {
    const m = manager();
    m.create({ name: "a" }, 0);
    m.touch("s1", 900);
    // Idle window not exceeded (1000-900<300), but wall lifetime is.
    expect(m.expired(1000)).toEqual(["s1"]);
  });

  it("touch on a missing session reports false", () => {
    const m = manager();
    expect(m.touch("nope", 0)).toBe(false);
  });
});
