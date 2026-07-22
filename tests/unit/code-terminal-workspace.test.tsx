import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Monaco needs browser APIs unavailable in jsdom; swap it for a textarea.
vi.mock("@/features/code-lab/monaco-code-editor", () => ({
  default: ({ value }: { value: string }) => <textarea defaultValue={value} data-testid="monaco-mock" />
}));

vi.mock("@/features/code-lab/code-terminal-client", () => ({
  startTerminalRequest: vi.fn(),
  pollTerminalRequest: vi.fn(),
  sendTerminalInput: vi.fn(),
  stopTerminalRequest: vi.fn(),
  recordTerminalAttemptRequest: vi.fn()
}));

import { CodeLabWorkspace } from "@/features/code-lab/code-lab-workspace";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";
import {
  pollTerminalRequest,
  startTerminalRequest,
  stopTerminalRequest
} from "@/features/code-lab/code-terminal-client";

const startMock = vi.mocked(startTerminalRequest);
const pollMock = vi.mocked(pollTerminalRequest);
const stopMock = vi.mocked(stopTerminalRequest);

const ITEM = "cpp.program_basics.io.lesson";
const config = getCodeLabConfigForItem(ITEM)!;

function running(sessionId = "s1") {
  return {
    sessionId,
    sessionToken: "tok",
    status: "running" as const,
    events: [{ sequence: 1, kind: "system" as const, text: "started\n", createdAt: "t" }],
    nextSequence: 1
  };
}

beforeEach(() => {
  // Narrow layout (stacked) so ResizableColumns/matchMedia stay simple.
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  })) as unknown as typeof window.matchMedia;
  startMock.mockResolvedValue(running());
  pollMock.mockResolvedValue(running());
  stopMock.mockResolvedValue({ ok: true });
});

afterEach(() => vi.clearAllMocks());

describe("CodeLabWorkspace interactive Terminal (#664)", () => {
  it("labels the dock tabs Terminal and Input Args (not Output/Input)", () => {
    render(<CodeLabWorkspace itemId={ITEM} title="IO" config={config} />);
    expect(screen.getByTestId("code-lab-tab-terminal")).toHaveTextContent("Terminal");
    expect(screen.getByTestId("code-lab-tab-stdin")).toHaveTextContent("Input Args");
    expect(screen.queryByText("Output")).toBeNull();
  });

  it("Run selects the Terminal tab, then shows Stop and disables Run Tests", async () => {
    render(<CodeLabWorkspace itemId={ITEM} title="IO" config={config} />);

    // Move to another tab first so selecting Terminal on Run is observable.
    fireEvent.click(screen.getByTestId("code-lab-tab-tests"));
    expect(screen.getByTestId("code-lab-tab-tests")).toHaveAttribute("aria-selected", "true");

    // The stacked layout renders the controls in two places; scope to the first.
    const controls = screen.getAllByTestId("code-controls")[0];
    fireEvent.click(within(controls).getByRole("button", { name: "Run" }));

    await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1));
    // Terminal tab is now selected.
    expect(screen.getByTestId("code-lab-tab-terminal")).toHaveAttribute("aria-selected", "true");
    // Run became Stop, and Run Tests is disabled while the session is active.
    await waitFor(() => expect(within(controls).getByTestId("code-stop")).toBeInTheDocument());
    expect(within(controls).getByRole("button", { name: "Run Tests" })).toBeDisabled();
  });
});
