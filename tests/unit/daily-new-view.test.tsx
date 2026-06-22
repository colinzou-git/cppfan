import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DailyNew } from "@/features/goals/daily-new";
import type { DailyNewAction, DailyNewPlan } from "@/features/goals/daily-new-model";

const allocateExtra = vi.fn();
const refresh = vi.fn();
vi.mock("@/app/goals/actions", () => ({
  allocateExtraGoalInlineAction: (...args: unknown[]) => allocateExtra(...args)
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

function action(overrides: Partial<DailyNewAction> = {}): DailyNewAction {
  return {
    id: "goal:goal-1:revision:revision-1:target:target-1:item:item-1",
    algorithmVersion: "daily-new-v1",
    localPlanDate: "2026-06-19",
    timezone: "America/Los_Angeles",
    dailyPlanVersion: 2,
    itemId: "item-1",
    skillId: "cpp.program_basics.structure",
    title: "A minimal C++ program",
    reason: "Continue the unfinished acquisition path for A minimal C++ program.",
    reasonCodes: ["START_NEW_GOAL_SKILL"],
    href: "/learn/item-1",
    estimatedMinutes: 3,
    goalIds: ["goal-1"],
    goalTitles: ["C++ foundations"],
    targetIds: ["target-1"],
    primaryGoalId: "goal-1",
    revisionId: "revision-1",
    primaryTargetId: "target-1",
    actionKind: "start_new_skill",
    destinationKind: "learning_item",
    destinationId: "item-1",
    acquisitionStepId: "item-1",
    acquisitionState: "not_started",
    acquisitionContractId: "skill-initial-learning",
    acquisitionContractVersion: 1,
    completionEvidenceRule: "A trusted qualifying learning event for this exact learning item satisfies this acquisition step.",
    platformSuitability: "all_devices",
    platformNote: "This learning-item step works on Windows, iPad, and iPhone.",
    source: "planned",
    isFsrsReview: false,
    ...overrides
  };
}

function plan(overrides: Partial<DailyNewPlan> = {}): DailyNewPlan {
  return {
    state: "ready",
    authenticated: true,
    activeGoalCount: 1,
    dailyCap: 1,
    localPlanDate: "2026-06-19",
    timezone: "America/Los_Angeles",
    dailyPlanVersion: 2,
    actions: [action()],
    allocatedExtraActions: [],
    eligibleActions: [action()],
    extraAction: null,
    noMoreReason: null,
    ...overrides
  };
}

describe("DailyNew", () => {
  it("renders planned acquisition context and completion semantics on each tile", () => {
    render(<DailyNew plan={plan()} />);

    const item = screen.getByTestId("daily-new-action");
    expect(item).toHaveAttribute("data-action-id", "goal:goal-1:revision:revision-1:target:target-1:item:item-1");
    expect(within(item).getByRole("link", { name: /planned: start this skill - a minimal c\+\+ program/i }))
      .toHaveAttribute("href", "/learn/item-1");
    expect(within(item).getByText("Planned")).toBeVisible();
    expect(within(item).getByText("Start this skill")).toBeVisible();
    expect(within(item).getByText("C++ foundations - about 3 min")).toBeVisible();
    expect(within(item).getByText("Not started - learning item - 2026-06-19 - America/Los_Angeles")).toBeVisible();
    expect(within(item).getByText(/Completion: A trusted qualifying learning event/)).toBeVisible();
    expect(within(item).getByText(/works on Windows, iPad, and iPhone/)).toBeVisible();
  });

  it("renders allocated extra actions with an Extra label and continuation context", () => {
    render(<DailyNew plan={plan({
      actions: [],
      allocatedExtraActions: [action({
        id: "extra-action",
        actionKind: "continue_acquisition",
        acquisitionState: "in_progress",
        source: "learn_extra"
      })],
      eligibleActions: [],
      extraAction: null
    })} />);

    const item = screen.getByTestId("daily-new-action");
    expect(within(item).getByText("Extra")).toBeVisible();
    expect(within(item).getByText("Continue learning")).toBeVisible();
    expect(within(item).getByText("In progress - learning item - 2026-06-19 - America/Los_Angeles")).toBeVisible();
  });

  it("keeps no-goal, complete, and unavailable states distinct", () => {
    const { rerender } = render(<DailyNew plan={plan({ activeGoalCount: 0, actions: [], eligibleActions: [] })} />);
    expect(screen.getByText("Set a dated goal to receive unfinished-learning steps.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Set a learning goal" })).toHaveAttribute("href", "/goals");

    rerender(<DailyNew plan={plan({ actions: [], eligibleActions: [], noMoreReason: "all_goal_work_complete" })} />);
    expect(screen.getByText(/planned acquisition work is complete/i)).toBeVisible();
    expect(screen.getByText(/All active-goal acquisition work is complete/i)).toBeVisible();

    rerender(<DailyNew plan={plan({ state: "unavailable", actions: [], eligibleActions: [] })} />);
    expect(screen.getByText("Goal learning recommendations are temporarily unavailable.")).toBeVisible();
    expect(screen.queryByText(/planned acquisition work is complete/i)).not.toBeInTheDocument();

    rerender(<DailyNew plan={plan({ state: "unconfigured", activeGoalCount: 0, actions: [], eligibleActions: [] })} />);
    expect(screen.getByText(/Demo mode: Daily New for Goals is not personalized or saved/i)).toBeVisible();
    expect(screen.queryByRole("link", { name: "Set a learning goal" })).not.toBeInTheDocument();
  });

  it("announces one-at-a-time Learn Extra allocation and refreshes the plan", async () => {
    allocateExtra.mockResolvedValue({ status: "ok", allocationId: "allocation-1", dailyPlanVersion: 3, replayed: false });
    render(<DailyNew plan={plan({ extraAction: action({ id: "extra-candidate", source: "learn_extra" }) })} />);

    fireEvent.click(screen.getByRole("button", { name: /Learn Extra:/i }));
    expect(screen.getByRole("button", { name: /Finding the next goal skill/i })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Extra action added."));
    expect(allocateExtra).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("does not blame stale Learn Extra allocation on another tab", async () => {
    allocateExtra.mockResolvedValue({ status: "stale" });
    render(<DailyNew plan={plan({ extraAction: action({ id: "extra-candidate", source: "learn_extra" }) })} />);

    fireEvent.click(screen.getByRole("button", { name: /Learn Extra:/i }));

    await waitFor(() => expect(screen.getByRole("status"))
      .toHaveTextContent("The plan changed while adding extra work. Refresh and try again."));
    expect(screen.getByRole("status")).not.toHaveTextContent("another tab");
  });
});
