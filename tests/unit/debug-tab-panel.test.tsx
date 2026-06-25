import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/code-lab/code-debug-client", () => ({
  startDebugRequest: vi.fn(),
  debugActionRequest: vi.fn(),
  stopDebugRequest: vi.fn()
}));

import { startDebugRequest } from "@/features/code-lab/code-debug-client";
import { useCodeBreakpoints } from "@/features/code-lab/use-code-breakpoints";
import { useCodeDebugger } from "@/features/code-lab/use-code-debugger";
import { DebugTabPanel } from "@/features/code-lab/debug-tab-panel";

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

afterEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe("DebugTabPanel (#442)", () => {
  it("adds a breakpoint via the line-number control", () => {
    render(<Harness />);
    fireEvent.change(screen.getByTestId("code-debug-line-input"), { target: { value: "5" } });
    fireEvent.click(screen.getByTestId("code-debug-add-breakpoint"));
    expect(screen.getByTestId("code-debug-breakpoints").textContent).toContain("Line 5");
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
