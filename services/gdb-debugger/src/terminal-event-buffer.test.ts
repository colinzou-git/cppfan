import { describe, expect, it } from "vitest";
import { TerminalEventBuffer } from "./terminal-event-buffer";

function fixedClock() {
  let n = 0;
  return () => `t${n++}`;
}

describe("TerminalEventBuffer (#664)", () => {
  it("assigns increasing sequences in observation order", () => {
    const b = new TerminalEventBuffer(1024, 100, fixedClock());
    b.append("compiler", "warn\n");
    b.append("stdout", "hello ");
    b.append("stdin", "42\n");
    b.append("stdout", "world");
    const all = b.since(0);
    expect(all.map((e) => e.sequence)).toEqual([1, 2, 3, 4]);
    expect(all.map((e) => e.kind)).toEqual(["compiler", "stdout", "stdin", "stdout"]);
    expect(b.lastSequence).toBe(4);
  });

  it("returns only events after the supplied cursor", () => {
    const b = new TerminalEventBuffer(1024, 100, fixedClock());
    b.append("stdout", "a");
    b.append("stdout", "b");
    const first = b.since(0);
    expect(first).toHaveLength(2);
    b.append("stdout", "c");
    const next = b.since(first[first.length - 1].sequence);
    expect(next.map((e) => e.text)).toEqual(["c"]);
  });

  it("ignores empty text", () => {
    const b = new TerminalEventBuffer(1024, 100, fixedClock());
    expect(b.append("stdout", "")).toBeNull();
    expect(b.count).toBe(0);
  });

  it("truncates once the byte cap is reached and emits a single notice", () => {
    const b = new TerminalEventBuffer(8, 100, fixedClock());
    b.append("stdout", "1234");
    b.append("stdout", "567890"); // clipped to fit remaining 4 bytes, then sealed
    expect(b.truncated).toBe(true);
    const events = b.since(0);
    const system = events.filter((e) => e.kind === "system");
    expect(system).toHaveLength(1);
    expect(system[0].text).toContain("truncated");
    // Further writes are dropped after truncation.
    const before = b.count;
    b.append("stdout", "more");
    expect(b.count).toBe(before);
  });

  it("truncates once the event cap is reached", () => {
    const b = new TerminalEventBuffer(1024, 2, fixedClock());
    b.append("stdout", "a");
    b.append("stdout", "b");
    b.append("stdout", "c"); // exceeds 2 events -> seal
    expect(b.truncated).toBe(true);
    expect(b.since(0).some((e) => e.kind === "system")).toBe(true);
  });
});
