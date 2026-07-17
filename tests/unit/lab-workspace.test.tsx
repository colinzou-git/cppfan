import { render, screen, fireEvent, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LabWorkspace } from "@/features/user-content/lab-workspace";
import { markUserLabComplete } from "@/features/labs/user-lab-progress";
import type { LabMilestoneView } from "@/features/user-content/lab-code-lab";

vi.mock("@/features/labs/user-lab-progress", () => ({ markUserLabComplete: vi.fn(async () => ({ status: "ok" })) }));
const mockedComplete = vi.mocked(markUserLabComplete);

// Capture the props the wrapper hands to the workspace, and expose onResult so a
// test can simulate a passing Test run.
let lastProps: Record<string, unknown> = {};
vi.mock("@/features/code-lab/code-lab-workspace", () => ({
  CodeLabWorkspace: (props: Record<string, unknown>) => {
    lastProps = props;
    return <div data-testid="code-lab-workspace" data-milestone={String(props.milestoneIndex)} data-title={String(props.title)} />;
  }
}));

function view(index: number, label: string, required: boolean, milestoneId?: string): LabMilestoneView {
  return {
    index,
    milestoneId: milestoneId ?? `m-${label.toLowerCase()}`,
    label,
    required,
    config: { enabled: true, language: "cpp", mode: "stdin", starterCode: "int main(){}", visibleTests: [] }
  };
}

afterEach(() => {
  vi.clearAllMocks();
  lastProps = {};
});

describe("LabWorkspace milestone navigator (#489)", () => {
  it("renders no navigator for a single-task lab", () => {
    render(<LabWorkspace itemId="user.item.x" title="CSV" milestones={[{ ...view(0, "Task", true) }]} />);
    expect(screen.queryByTestId("lab-milestone-nav")).toBeNull();
    expect(lastProps.milestoneIndex).toBe(0);
  });

  it("switches the active milestone and grades that checkpoint", () => {
    render(
      <LabWorkspace
        itemId="user.item.y"
        title="Shell"
        milestones={[view(0, "Parse", true), view(1, "Run", true)]}
        contentVersionId="v9"
      />
    );
    expect(screen.getByTestId("lab-milestone-nav")).toBeInTheDocument();
    expect(lastProps.milestoneIndex).toBe(0);

    const tabs = screen.getAllByTestId("lab-milestone-tab");
    fireEvent.click(tabs[1]);
    expect(lastProps.milestoneIndex).toBe(1);
    expect(String(lastProps.title)).toContain("Run");
    // The shared workspace is keyed by itemId so it is never remounted (code persists).
    expect(lastProps.contentVersionId).toBe("v9");
  });

  it("shows the complete banner only after completion is durably saved (#610)", async () => {
    render(
      <LabWorkspace
        itemId="user.item.z"
        title="Shell"
        milestones={[view(0, "Parse", true), view(1, "Run", false)]}
      />
    );
    const onResult = lastProps.onResult as (r: { test: unknown }) => void;
    // Only milestone 0 is required; passing it (all cases) completes the lab.
    act(() => onResult({ test: { status: "ok", total: 2, passed: 2, staleDefinition: false } }));
    // Banner appears only once the save resolves ok.
    expect(await screen.findByTestId("lab-complete-banner")).toBeInTheDocument();
    expect(mockedComplete).toHaveBeenCalledWith({ itemId: "user.item.z" });
    expect(mockedComplete).toHaveBeenCalledTimes(1);
  });

  it("does not show the completed banner if persistence fails; retry succeeds (#610)", async () => {
    mockedComplete.mockResolvedValueOnce({ status: "error" }).mockResolvedValueOnce({ status: "ok" });
    render(<LabWorkspace itemId="user.item.e" title="Shell" milestones={[view(0, "Parse", true)]} />);
    const onResult = lastProps.onResult as (r: { test: unknown }) => void;
    act(() => onResult({ test: { status: "ok", total: 1, passed: 1, staleDefinition: false } }));

    // First save fails: no completed banner, an actionable retry instead.
    expect(await screen.findByTestId("lab-complete-error")).toBeInTheDocument();
    expect(screen.queryByTestId("lab-complete-banner")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /retry completion/i }));
    expect(await screen.findByTestId("lab-complete-banner")).toBeInTheDocument();
    expect(mockedComplete).toHaveBeenCalledTimes(2);
  });

  it("uses open-navigation icons with no lock (#610)", () => {
    const { container } = render(
      <LabWorkspace itemId="user.item.n" title="Shell" milestones={[view(0, "Parse", true), view(1, "Run", true)]} />
    );
    // Every milestone tab is clickable and none renders a lock affordance.
    expect(screen.getAllByTestId("lab-milestone-tab").every((t) => !(t as HTMLButtonElement).disabled)).toBe(true);
    expect(container.querySelector(".lucide-lock")).toBeNull();
  });

  it("does not complete on a partial pass", () => {
    render(
      <LabWorkspace itemId="user.item.p" title="Shell" milestones={[view(0, "Parse", true)]} />
    );
    const onResult = lastProps.onResult as (r: { test: unknown }) => void;
    act(() => onResult({ test: { status: "ok", total: 2, passed: 1, staleDefinition: false } }));
    expect(screen.queryByTestId("lab-complete-banner")).toBeNull();
    expect(mockedComplete).not.toHaveBeenCalled();
  });
});
