import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/code-lab/code-debug-client", () => ({
  startDebugRequest: vi.fn(),
  debugActionRequest: vi.fn(),
  stopDebugRequest: vi.fn()
}));

import { startDebugRequest } from "@/features/code-lab/code-debug-client";
import { useCodeBreakpoints } from "@/features/code-lab/use-code-breakpoints";
import { useCodeDebugger } from "@/features/code-lab/use-code-debugger";
import { DebugTabPanel, parseArrayChildren } from "@/features/code-lab/debug-tab-panel";
import type { CodeDebugSnapshot } from "@/features/code-lab/code-debug-types";

const startMock = vi.mocked(startDebugRequest);

function Harness() {
  const breakpoints = useCodeBreakpoints("item-x");
  const debug = useCodeDebugger({
    itemId: "item-x",
    source: "int main(){}",
    stdin: "",
    breakpoints: breakpoints.breakpoints
  });
  return <DebugTabPanel breakpoints={breakpoints} debug={debug} />;
}

function pausedSnapshot(overrides: Partial<CodeDebugSnapshot> = {}): CodeDebugSnapshot {
  return {
    sessionId: "s1",
    status: "paused",
    file: "main.cpp",
    line: 4,
    stdout: "hello from program\n",
    stderr: "",
    compileOutput: "g++ note: built with -g -O0",
    stack: [{ id: "f0", name: "main", file: "main.cpp", line: 4 }],
    variables: [
      { name: "i", value: "3" },
      { name: "v", value: "{1, 2, 3}" }
    ],
    watches: [],
    breakpoints: [],
    reason: "breakpoint",
    exitCode: null,
    ...overrides
  };
}

afterEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe("DebugTabPanel breakpoints + unconfigured (#442)", () => {
  it("adds a breakpoint via the line-number control", () => {
    render(<Harness />);
    fireEvent.change(screen.getByTestId("code-debug-line-input"), { target: { value: "5" } });
    fireEvent.click(screen.getByTestId("code-debug-add-breakpoint"));
    expect(screen.getByTestId("code-debug-breakpoints").textContent).toContain("5");
  });

  it("ignores an invalid line number", () => {
    render(<Harness />);
    fireEvent.change(screen.getByTestId("code-debug-line-input"), { target: { value: "0" } });
    fireEvent.click(screen.getByTestId("code-debug-add-breakpoint"));
    expect(screen.getByTestId("code-debug-breakpoints").textContent).toContain("No breakpoints yet");
  });

  it("shows the unconfigured state after Start Debugging", async () => {
    startMock.mockResolvedValue({
      sessionId: null,
      status: "unconfigured",
      file: "main.cpp",
      line: null,
      stdout: "",
      stderr: "",
      compileOutput: "",
      stack: [],
      variables: [],
      watches: [],
      breakpoints: [],
      message: "Real debugger service is not configured."
    });

    render(<Harness />);
    fireEvent.click(screen.getByTestId("code-debug-start"));

    await waitFor(() => {
      expect(screen.getByTestId("code-debug-status").textContent).toContain("unconfigured");
    });
    expect(screen.getByTestId("code-debug-status").textContent).toContain("not configured");
  });
});

describe("DebugTabPanel redesign (#470)", () => {
  it("parses array-like values into indexed children", () => {
    expect(parseArrayChildren("{1, 2, 3}")).toEqual([
      { name: "[0]", value: "1" },
      { name: "[1]", value: "2" },
      { name: "[2]", value: "3" }
    ]);
    expect(parseArrayChildren("[0] = 4, [1] = 5")).toEqual([
      { name: "[0]", value: "4" },
      { name: "[1]", value: "5" }
    ]);
    expect(parseArrayChildren("42")).toBeNull();
  });

  it("DEBUG INFO is a small button that opens a popup with compileOutput, not in PROGRAM OUTPUT", async () => {
    startMock.mockResolvedValue(pausedSnapshot());
    render(<Harness />);
    fireEvent.click(screen.getByTestId("code-debug-start"));
    await screen.findByTestId("code-debug-program-output");

    // PROGRAM OUTPUT shows program stdout, never the compiler/debug note.
    const programOutput = screen.getByTestId("code-debug-program-output");
    expect(programOutput.textContent).toContain("hello from program");
    expect(programOutput.textContent).not.toContain("built with -g -O0");

    // DEBUG INFO button is compact + accessible, and reveals the technical details.
    const infoButton = screen.getByTestId("code-debug-info-button");
    expect(infoButton).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(infoButton);
    const popup = screen.getByTestId("code-debug-info-popup");
    expect(popup).toHaveAttribute("role", "dialog");
    expect(within(popup).getByTestId("code-debug-info-compile-output").textContent).toContain("built with -g -O0");
  });

  it("CALLSTACK is the first internal window and VARIABLES shows array child rows", async () => {
    startMock.mockResolvedValue(pausedSnapshot());
    render(<Harness />);
    fireEvent.click(screen.getByTestId("code-debug-start"));
    await screen.findByTestId("code-debug-callstack");

    expect(screen.getByTestId("code-debug-callstack").textContent).toContain("CALLSTACK");
    expect(screen.queryByText("BREAKPOINTS")).not.toBeInTheDocument();

    // Expand the array-like variable to reveal child rows.
    const variables = screen.getByTestId("code-debug-variables");
    const toggle = within(variables).getByTestId("code-debug-variable-toggle");
    fireEvent.click(toggle);
    const children = within(variables).getAllByTestId("code-debug-variable-child");
    expect(children.map((c) => c.textContent)).toEqual(["[0] = 1", "[1] = 2", "[2] = 3"]);
  });

  it("each internal window has a popout button and VARIABLES popout opens a dialog", async () => {
    startMock.mockResolvedValue(pausedSnapshot());
    render(<Harness />);
    fireEvent.click(screen.getByTestId("code-debug-start"));
    await screen.findByTestId("code-debug-variables");

    expect(screen.getByTestId("code-debug-callstack-expand")).toBeInTheDocument();
    expect(screen.getByTestId("code-debug-program-output-expand")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("code-debug-variables-expand"));
    const dialog = screen.getByTestId("code-debug-expanded");
    expect(dialog).toHaveAttribute("role", "dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("PROGRAM OUTPUT body is vertically resizable", async () => {
    startMock.mockResolvedValue(pausedSnapshot());
    render(<Harness />);
    fireEvent.click(screen.getByTestId("code-debug-start"));
    const body = await screen.findByTestId("code-debug-program-output-body");
    expect(body.querySelector("pre")?.className).toContain("resize-y");
  });
});
