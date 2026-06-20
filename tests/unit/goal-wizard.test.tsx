import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoalForm } from "@/features/goals/goal-form";

vi.mock("@/app/goals/actions", () => ({ createGoalAction: vi.fn() }));

describe("GoalForm wizard", () => {
  beforeEach(() => window.localStorage.clear());

  it("defaults to a seven-day inclusive goal and keeps the Evaluation round-trip draft", async () => {
    render(<GoalForm recommendedSkillIds={["cpp.program_basics.structure"]} recommendationReason="Evaluation reason" />);

    expect(screen.getByLabelText("Goal duration")).toHaveValue("7");
    expect(screen.getByText(/Inclusive range:/)).toHaveTextContent(/through/);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("link", { name: /30-question Evaluation/i })).toHaveAttribute("href", "/goals/evaluation");

    await waitFor(() => expect(window.localStorage.getItem("cppfan:goal-wizard:v1")).toContain('"step":2'));
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
