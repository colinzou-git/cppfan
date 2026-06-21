import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContextCoveragePanel } from "@/features/mastery/context-coverage-panel";
import { getCoverageForSkill } from "@/features/mastery/context-coverage";

describe("ContextCoveragePanel", () => {
  it("marks covered contexts done and lists what is missing", () => {
    const coverage = getCoverageForSkill({
      skillId: "cpp.x",
      events: [{ event_type: "quiz_correct" }]
    });
    render(<ContextCoveragePanel coverage={coverage} />);

    const recognitionItem = screen
      .getAllByTestId("context-coverage-item")
      .find((el) => el.getAttribute("data-context") === "recognition");
    expect(recognitionItem).toHaveAttribute("data-covered", "true");

    const codeLabItem = screen
      .getAllByTestId("context-coverage-item")
      .find((el) => el.getAttribute("data-context") === "code_lab");
    expect(codeLabItem).toHaveAttribute("data-covered", "false");

    expect(screen.getByTestId("context-coverage-missing")).toHaveTextContent(/delayed review/i);
  });
});
