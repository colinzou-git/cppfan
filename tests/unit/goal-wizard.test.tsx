import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoalForm } from "@/features/goals/goal-form";

vi.mock("@/app/goals/actions", () => ({ createGoalAction: vi.fn() }));

const DRAFT_KEY = "cppfan:goal-wizard:v1";

describe("GoalForm wizard", () => {
  beforeEach(() => window.localStorage.clear());

  it("defaults to a seven-day inclusive goal and keeps the Evaluation round-trip draft", async () => {
    render(<GoalForm recommendedSkillIds={["cpp.program_basics.structure"]} recommendationReason="Evaluation reason" />);

    expect(screen.getByLabelText("Goal duration")).toHaveValue("7");
    expect(screen.getByText(/Inclusive range:/)).toHaveTextContent(/through/);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("link", { name: /30-question Evaluation/i })).toHaveAttribute("href", "/goals/evaluation");

    await waitFor(() => expect(window.localStorage.getItem(DRAFT_KEY)).toContain('"step":2'));
  });

  it("lets recommended goal cards toggle into the customized target list", () => {
    render(<GoalForm recommendedSkillIds={["cpp.program_basics.structure"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("0 of 1 recommended target selected")).toBeVisible();

    const recommendedGoal = screen.getByRole("button", { name: /Program structure and main/i });
    expect(recommendedGoal).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(recommendedGoal);
    expect(recommendedGoal).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1 of 1 recommended target selected")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    const skills = screen.getByLabelText("Skills");
    const option = skills.querySelector('option[value="cpp.program_basics.structure"]') as HTMLOptionElement;
    expect(option.selected).toBe(true);
  });

  it("restores a saved draft without overwriting it during hydration", async () => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({
      step: 3,
      duration: 10,
      start: "2026-06-20",
      timezone: "America/Los_Angeles",
      title: "Saved foundations plan",
      note: "Keep the exact draft.",
      skillIds: ["cpp.program_basics.structure"]
    }));

    render(<GoalForm recommendedSkillIds={["cpp.ownership.raii"]} />);

    await waitFor(() => expect(screen.getByLabelText("Goal title")).toHaveValue("Saved foundations plan"));
    expect(screen.getByRole("status")).toHaveTextContent("Your saved draft was restored.");
    expect(window.localStorage.getItem(DRAFT_KEY)).toContain("Saved foundations plan");
    expect(window.localStorage.getItem(DRAFT_KEY)).toContain("cpp.program_basics.structure");
  });

  it("reviews a customized target before enabling save", () => {
    render(<GoalForm />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.change(screen.getByLabelText("Goal title"), { target: { value: "Refresh foundations" } });
    const skills = screen.getByLabelText("Skills");
    const option = skills.querySelector('option[value="cpp.program_basics.structure"]') as HTMLOptionElement;
    option.selected = true;
    fireEvent.change(skills);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText(/Refresh foundations/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Create goal" })).toBeEnabled();
    expect(screen.getByText(/Daily Review load stays separate/)).toBeVisible();
  });
});
