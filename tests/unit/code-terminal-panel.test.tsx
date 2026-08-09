import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeTerminalPanel } from "@/features/code-lab/code-terminal-panel";
import type {
  CodeTerminalEvent,
  CodeTerminalStatus
} from "@/features/code-lab/code-terminal-types";

function renderPanel(overrides: Partial<React.ComponentProps<typeof CodeTerminalPanel>> = {}) {
  const onSend = overrides.onSend ?? vi.fn().mockResolvedValue(true);
  const onEof = overrides.onEof ?? vi.fn().mockResolvedValue(true);
  const onClearError = overrides.onClearError ?? vi.fn();
  const onRetryAttemptSave = overrides.onRetryAttemptSave ?? vi.fn().mockResolvedValue(undefined);
  const status: CodeTerminalStatus = overrides.status ?? "running";
  const props: React.ComponentProps<typeof CodeTerminalPanel> = {
    status,
    events: overrides.events ?? [],
    exitCode: overrides.exitCode ?? null,
    durationMs: overrides.durationMs ?? null,
    outputTruncated: overrides.outputTruncated ?? false,
    message: overrides.message ?? null,
    isActive: overrides.isActive ?? (status === "running" || status === "compiling"),
    isFinished: overrides.isFinished ?? false,
    sending: overrides.sending ?? false,
    inputError: overrides.inputError ?? null,
    attemptSaveStatus: overrides.attemptSaveStatus ?? "idle",
    attemptSaveError: overrides.attemptSaveError ?? null,
    onSend,
    onEof,
    onClearError,
    onRetryAttemptSave
  };
  return { ...render(<CodeTerminalPanel {...props} />), onSend, onEof, onClearError };
}

afterEach(() => vi.clearAllMocks());

describe("CodeTerminalPanel (#664)", () => {
  it("shows the composer only while running", () => {
    const { rerender } = renderPanel({ status: "running" });
    expect(screen.getByTestId("code-terminal-input")).toBeInTheDocument();
    rerender(
      <CodeTerminalPanel
        status="exited"
        events={[]}
        exitCode={0}
        durationMs={12}
        outputTruncated={false}
        message={null}
        isActive={false}
        isFinished
        sending={false}
        inputError={null}
        attemptSaveStatus="saved"
        attemptSaveError={null}
        onSend={vi.fn()}
        onEof={vi.fn()}
        onClearError={vi.fn()}
        onRetryAttemptSave={vi.fn()}
      />
    );
    expect(screen.queryByTestId("code-terminal-input")).not.toBeInTheDocument();
  });

  it("sends the composer text plus a newline on Enter and clears it", async () => {
    const onSend = vi.fn().mockResolvedValue(true);
    renderPanel({ onSend });
    const input = screen.getByTestId("code-terminal-input") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "42" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(onSend).toHaveBeenCalledWith("42\n"));
    await waitFor(() => expect(input.value).toBe(""));
  });

  it("allows sending an empty line", async () => {
    const onSend = vi.fn().mockResolvedValue(true);
    renderPanel({ onSend });
    fireEvent.click(screen.getByTestId("code-terminal-send"));
    await waitFor(() => expect(onSend).toHaveBeenCalledWith("\n"));
  });

  it("exposes a Send EOF control while running", () => {
    const onEof = vi.fn().mockResolvedValue(true);
    renderPanel({ onEof });
    fireEvent.click(screen.getByTestId("code-terminal-eof"));
    expect(onEof).toHaveBeenCalled();
  });

  it("shows a retryable input error", () => {
    renderPanel({ inputError: "Input could not be sent. Try again." });
    expect(screen.getByTestId("code-terminal-input-error")).toHaveTextContent("could not be sent");
  });

  it("renders program output as escaped text, including stderr", () => {
    const events: CodeTerminalEvent[] = [
      { sequence: 1, kind: "stdout", text: "<b>not html</b>\n", createdAt: "t" },
      { sequence: 2, kind: "stderr", text: "boom", createdAt: "t" }
    ];
    renderPanel({ events });
    const transcript = screen.getByTestId("code-terminal-transcript");
    expect(transcript).toHaveTextContent("<b>not html</b>");
    expect(transcript).toHaveTextContent("boom");
    // No injected HTML: the literal tag text is present, not a bold element.
    expect(transcript.querySelector("b")).toBeNull();
  });

  it("renders an explicit unconfigured state", () => {
    renderPanel({
      status: "unconfigured",
      message: "Interactive terminal service is not configured."
    });
    expect(screen.getByTestId("code-terminal-unconfigured")).toHaveTextContent("not configured");
  });

  it("renders saving/retrying state without hiding the transcript", () => {
    const { rerender } = renderPanel({
      status: "exited",
      isFinished: true,
      attemptSaveStatus: "saving",
      events: [{ sequence: 1, kind: "stdout", text: "done", createdAt: "t" }]
    });
    expect(screen.getByTestId("code-terminal-attempt-saving")).toBeInTheDocument();
    expect(screen.getByTestId("code-terminal-transcript")).toHaveTextContent("done");
    rerender(
      <CodeTerminalPanel
        status="exited"
        events={[]}
        exitCode={0}
        durationMs={1}
        outputTruncated={false}
        message={null}
        isActive={false}
        isFinished
        sending={false}
        inputError={null}
        attemptSaveStatus="retrying"
        attemptSaveError={null}
        onSend={vi.fn()}
        onEof={vi.fn()}
        onClearError={vi.fn()}
        onRetryAttemptSave={vi.fn()}
      />
    );
    expect(screen.getByTestId("code-terminal-attempt-saving")).toBeInTheDocument();
  });

  it("shows a manual history retry after an error and stays quiet when saved", () => {
    const onRetryAttemptSave = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderPanel({
      status: "exited",
      isFinished: true,
      attemptSaveStatus: "error",
      attemptSaveError: "History save failed.",
      onRetryAttemptSave
    });
    fireEvent.click(screen.getByRole("button", { name: "Retry saving run" }));
    expect(onRetryAttemptSave).toHaveBeenCalledTimes(1);
    rerender(
      <CodeTerminalPanel
        status="exited"
        events={[]}
        exitCode={0}
        durationMs={1}
        outputTruncated={false}
        message={null}
        isActive={false}
        isFinished
        sending={false}
        inputError={null}
        attemptSaveStatus="saved"
        attemptSaveError={null}
        onSend={vi.fn()}
        onEof={vi.fn()}
        onClearError={vi.fn()}
        onRetryAttemptSave={vi.fn()}
      />
    );
    expect(screen.queryByTestId("code-terminal-attempt-error")).not.toBeInTheDocument();
  });
});
