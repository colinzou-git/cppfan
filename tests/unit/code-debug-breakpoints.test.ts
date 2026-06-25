import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  addBreakpointToList,
  breakpointStorageKey,
  normalizeBreakpoints,
  parseStoredBreakpoints,
  removeBreakpointFromList,
  serializeBreakpoints,
  toggleBreakpointInList,
  updateBreakpointInList,
  useCodeBreakpoints
} from "@/features/code-lab/use-code-breakpoints";
import type { CodeBreakpoint } from "@/features/code-lab/code-debug-types";

const bp = (line: number, enabled = true): CodeBreakpoint => ({ id: `bp-${line}`, line, enabled });

afterEach(() => {
  window.localStorage.clear();
});

describe("breakpoint list operations (#442)", () => {
  it("storage key is namespaced per item", () => {
    expect(breakpointStorageKey("cpp.intro")).toBe("cppfan:code-debug-breakpoints:cpp.intro");
    expect(breakpointStorageKey("a")).not.toBe(breakpointStorageKey("b"));
  });

  it("adds a breakpoint at a line", () => {
    expect(addBreakpointToList([], 5)).toEqual([bp(5)]);
  });

  it("does not duplicate a breakpoint on the same line", () => {
    const once = addBreakpointToList([], 5);
    expect(addBreakpointToList(once, 5)).toBe(once);
  });

  it("rejects invalid line numbers", () => {
    expect(addBreakpointToList([], 0)).toEqual([]);
    expect(addBreakpointToList([], -3)).toEqual([]);
    expect(addBreakpointToList([], 2.5)).toEqual([]);
    expect(addBreakpointToList([], Number.NaN)).toEqual([]);
  });

  it("toggles a line off when present and on when absent", () => {
    const added = toggleBreakpointInList([], 7);
    expect(added).toEqual([bp(7)]);
    expect(toggleBreakpointInList(added, 7)).toEqual([]);
  });

  it("removes a breakpoint by line", () => {
    expect(removeBreakpointFromList([bp(3), bp(9)], 3)).toEqual([bp(9)]);
  });

  it("updates a breakpoint by line, preserving id and line", () => {
    const updated = updateBreakpointInList([bp(4)], 4, { enabled: false, status: "disabled" });
    expect(updated).toEqual([{ id: "bp-4", line: 4, enabled: false, status: "disabled" }]);
  });

  it("normalizes: drops invalid, de-duplicates by line, sorts ascending", () => {
    const messy = [bp(10), bp(2), { id: "x", line: 2, enabled: false }, bp(0), bp(-1)];
    expect(normalizeBreakpoints(messy as CodeBreakpoint[])).toEqual([bp(2), bp(10)]);
  });
});

describe("breakpoint persistence round-trip (#442)", () => {
  it("serialize -> parse preserves valid breakpoints", () => {
    const list = [bp(3), bp(8, false)];
    expect(parseStoredBreakpoints(serializeBreakpoints(list))).toEqual(list);
  });

  it("tolerates malformed or non-array payloads", () => {
    expect(parseStoredBreakpoints(null)).toEqual([]);
    expect(parseStoredBreakpoints("not json")).toEqual([]);
    expect(parseStoredBreakpoints('{"line":3}')).toEqual([]);
  });

  it("drops persisted entries with invalid lines", () => {
    expect(parseStoredBreakpoints('[{"id":"bp-5","line":5,"enabled":true},{"line":0}]')).toEqual([
      bp(5)
    ]);
  });
});

describe("useCodeBreakpoints (#442)", () => {
  it("persists breakpoints across remount for the same item", () => {
    const first = renderHook(() => useCodeBreakpoints("item-a"));
    act(() => first.result.current.addBreakpoint(12));
    expect(first.result.current.breakpoints).toEqual([bp(12)]);
    first.unmount();

    const second = renderHook(() => useCodeBreakpoints("item-a"));
    expect(second.result.current.breakpoints).toEqual([bp(12)]);
  });

  it("keeps each item's breakpoints under its own key", () => {
    const a = renderHook(() => useCodeBreakpoints("item-a"));
    act(() => a.result.current.addBreakpoint(3));
    const b = renderHook(() => useCodeBreakpoints("item-b"));
    act(() => b.result.current.addBreakpoint(9));

    expect(parseStoredBreakpoints(window.localStorage.getItem(breakpointStorageKey("item-a")))).toEqual([
      bp(3)
    ]);
    expect(parseStoredBreakpoints(window.localStorage.getItem(breakpointStorageKey("item-b")))).toEqual([
      bp(9)
    ]);
  });

  it("ignores invalid line input from the line-number control", () => {
    const { result } = renderHook(() => useCodeBreakpoints("item-c"));
    act(() => result.current.addBreakpoint(0));
    act(() => result.current.addBreakpoint(-2));
    expect(result.current.breakpoints).toEqual([]);
  });
});
