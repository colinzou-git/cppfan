import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LabWorkspace } from "@/features/user-content/lab-workspace";
import { completeUserLab } from "@/features/labs/complete-user-lab";
import { recordLabMilestonePass } from "@/features/labs/user-lab-milestone-progress";
import type { LabMilestoneView } from "@/features/user-content/lab-code-lab";

vi.mock("@/features/labs/complete-user-lab", () => ({
  completeUserLab: vi.fn(async () => ({ status: "completed" }))
}));
vi.mock("@/features/labs/user-lab-milestone-progress", () => ({
  recordLabMilestonePass: vi.fn(async (input: { milestoneId: string; milestoneIndex: number }) => ({
    status: "saved",
    progress: {
      milestoneId: input.milestoneId,
      milestoneIndex: input.milestoneIndex,
      codeSnapshotHash: "a".repeat(64),
      passedAt: "2026-07-23T00:00:00.000Z"
    }
  }))
}));

const mockedComplete = vi.mocked(completeUserLab);
const mockedMilestone = vi.mocked(recordLabMilestonePass);

let lastProps: Record<string, unknown> = {};
vi.mock("@/features/code-lab/code-lab-workspace", () => ({
  CodeLabWorkspace: (props: Record<string, unknown>) => {
    lastProps = props;
    return (
      <div
        data-testid="code-lab-workspace"
        data-milestone={String(props.milestoneIndex)}
        data-title={String(props.title)}
      />
    );
  }
}));

function view(
  index: number,
  label: string,
  required: boolean,
  milestoneId?: string
): LabMilestoneView {
  return {
    index,
    milestoneId: milestoneId ?? `m-${label.toLowerCase()}`,
    label,
    required,
    config: {
      enabled: true,
      language: "cpp",
      mode: "stdin",
      starterCode: "int main(){}",
      visibleTests: []
    }
  };
}

function passing(source = "int main(){}") {
  return {
    test: {
      status: "ok",
      total: 1,
      passed: 1,
      staleDefinition: false
    },
    source
  };
}

async function passActive(source = "int main(){}") {
  const onResult = lastProps.onResult as (result: ReturnType<typeof passing>) => void;
  act(() => onResult(passing(source)));
  await waitFor(() => expect(mockedMilestone).toHaveBeenCalled());
}

afterEach(() => {
  vi.clearAllMocks();
  lastProps = {};
});

describe("authoritative LabWorkspace completion (#669)", () => {
  it("keeps navigation open and switches the active milestone", () => {
    render(
      <LabWorkspace
        itemId="user.item.y"
        title="Shell"
        milestones={[view(0, "Parse", true), view(1, "Run", true)]}
        contentVersionId="v9"
      />
    );
    const tabs = screen.getAllByTestId("lab-milestone-tab");
    expect(tabs.every((tab) => !(tab as HTMLButtonElement).disabled)).toBe(true);
    fireEvent.click(tabs[1]);
    expect(lastProps.milestoneIndex).toBe(1);
    expect(String(lastProps.title)).toContain("Run");
  });

  it("shows saving, not a green check, until milestone persistence resolves", async () => {
    let resolveSave!: (value: Awaited<ReturnType<typeof recordLabMilestonePass>>) => void;
    mockedMilestone.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSave = resolve;
      })
    );
    render(
      <LabWorkspace
        itemId="user.item.s"
        title="Shell"
        milestones={[view(0, "Parse", true), view(1, "Optional", false)]}
        contentVersionId="version"
      />
    );
    const onResult = lastProps.onResult as (result: ReturnType<typeof passing>) => void;
    act(() => onResult(passing("passing source")));
    expect(screen.getByLabelText("Saving milestone progress")).toBeInTheDocument();
    expect(screen.queryByLabelText("Milestone progress saved")).toBeNull();
    await act(async () => {
      resolveSave({
        status: "saved",
        progress: {
          milestoneId: "m-parse",
          milestoneIndex: 0,
          codeSnapshotHash: "b".repeat(64),
          passedAt: "2026-07-23T00:00:00.000Z"
        }
      });
    });
    expect(screen.queryByLabelText("Saving milestone progress")).toBeNull();
  });

  it("shows a retryable milestone error and reuses the exact passing source", async () => {
    mockedMilestone
      .mockResolvedValueOnce({ status: "error", message: "save failed" })
      .mockResolvedValueOnce({
        status: "saved",
        progress: {
          milestoneId: "m-parse",
          milestoneIndex: 0,
          codeSnapshotHash: "c".repeat(64),
          passedAt: "2026-07-23T00:00:00.000Z"
        }
      });
    render(
      <LabWorkspace
        itemId="user.item.e"
        title="Shell"
        milestones={[view(0, "Parse", true)]}
        contentVersionId="version"
      />
    );
    await passActive("exact passing source");
    expect(await screen.findByTestId("lab-milestone-save-error")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry milestone save" }));
    await waitFor(() => expect(mockedMilestone).toHaveBeenCalledTimes(2));
    expect(mockedMilestone).toHaveBeenLastCalledWith(
      expect.objectContaining({ source: "exact passing source" })
    );
  });

  it("hydrates durable checks but never auto-completes without current source", () => {
    render(
      <LabWorkspace
        itemId="user.item.h"
        title="Shell"
        milestones={[view(0, "Parse", true, "m-parse")]}
        contentVersionId="version"
        initialMilestoneProgress={[
          {
            milestoneId: "m-parse",
            milestoneIndex: 0,
            codeSnapshotHash: "d".repeat(64),
            passedAt: "2026-07-23T00:00:00.000Z"
          }
        ]}
      />
    );
    expect(screen.getByTestId("lab-final-validation-required")).toHaveTextContent(
      "Run Tests on your final code"
    );
    expect(mockedComplete).not.toHaveBeenCalled();
  });

  it("completes only through the authoritative action after an explicit final validation", async () => {
    render(
      <LabWorkspace
        itemId="user.item.c"
        title="Shell"
        milestones={[view(0, "Parse", true)]}
        contentVersionId="version"
      />
    );
    await passActive("final source");
    fireEvent.click(await screen.findByRole("button", { name: "Validate & complete" }));
    expect(await screen.findByTestId("lab-complete-banner")).toBeInTheDocument();
    expect(mockedComplete).toHaveBeenCalledWith({
      itemId: "user.item.c",
      expectedContentVersionId: "version",
      source: "final source"
    });
  });

  it("retains historical saved state while marking regressions and selecting the first", async () => {
    mockedComplete.mockResolvedValueOnce({
      status: "regressed",
      milestoneIds: ["m-parse"]
    });
    render(
      <LabWorkspace
        itemId="user.item.r"
        title="Shell"
        milestones={[view(0, "Parse", true, "m-parse"), view(1, "Run", true, "m-run")]}
        contentVersionId="version"
      />
    );
    await passActive("source one");
    fireEvent.click(screen.getAllByTestId("lab-milestone-tab")[1]);
    await passActive("source two");
    fireEvent.click(await screen.findByRole("button", { name: "Validate & complete" }));
    expect(await screen.findByTestId("lab-regressed")).toHaveTextContent("Parse");
    expect(screen.getByLabelText("Milestone currently regressed")).toBeInTheDocument();
    expect(lastProps.milestoneIndex).toBe(0);
    expect(screen.queryByTestId("lab-complete-banner")).toBeNull();
  });

  it("maps unavailable and stale final validation without a success claim", async () => {
    mockedComplete.mockResolvedValueOnce({
      status: "validation_unavailable",
      message: "Final validation is temporarily unavailable."
    });
    const { unmount } = render(
      <LabWorkspace
        itemId="user.item.u"
        title="Shell"
        milestones={[view(0, "Parse", true)]}
        contentVersionId="version"
      />
    );
    await passActive();
    fireEvent.click(await screen.findByRole("button", { name: "Validate & complete" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("temporarily unavailable");
    expect(screen.queryByTestId("lab-complete-banner")).toBeNull();
    unmount();

    mockedComplete.mockResolvedValueOnce({ status: "stale_definition" });
    render(
      <LabWorkspace
        itemId="user.item.stale"
        title="Shell"
        milestones={[view(0, "Parse", true)]}
        contentVersionId="version"
      />
    );
    await passActive();
    fireEvent.click(await screen.findByRole("button", { name: "Validate & complete" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("republished");
  });

  it("does not save a partial Test result", () => {
    render(
      <LabWorkspace
        itemId="user.item.p"
        title="Shell"
        milestones={[view(0, "Parse", true)]}
        contentVersionId="version"
      />
    );
    const onResult = lastProps.onResult as (result: { test: unknown; source: string }) => void;
    act(() =>
      onResult({
        test: { status: "ok", total: 2, passed: 1, staleDefinition: false },
        source: "source"
      })
    );
    expect(mockedMilestone).not.toHaveBeenCalled();
  });
});
