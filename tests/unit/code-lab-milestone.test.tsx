import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CodeLabMilestone } from "@/features/labs/code-lab-milestone";
import { getCapstoneMilestone } from "@/features/labs/capstone-tracks";

// Monaco needs browser APIs unavailable in jsdom; replace it with a textarea.
vi.mock("@/features/code-lab/monaco-code-editor", () => ({
  default: ({ value }: { value: string }) => <textarea defaultValue={value} data-testid="monaco-mock" />
}));

describe("CodeLabMilestone", () => {
  it("renders the Code Lab and execution label for an in-app milestone", () => {
    render(<CodeLabMilestone milestone={getCapstoneMilestone("csv-table-summarizer.m1")!} />);
    expect(screen.getByTestId("code-lab-milestone")).toHaveTextContent(/in-app code lab/i);
    expect(screen.getByTestId("code-lab")).toBeInTheDocument();
    expect(screen.getByTestId("code-lab-milestone")).toHaveTextContent(/codespaces/i);
  });

  it("renders nothing for a milestone without in-app Code Lab metadata", () => {
    const { container } = render(
      <CodeLabMilestone milestone={getCapstoneMilestone("csv-table-summarizer.m2")!} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
