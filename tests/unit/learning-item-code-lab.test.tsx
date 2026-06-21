import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MaybeCodeLab } from "@/features/code-lab/maybe-code-lab";
import { getCodeLabConfigForItem, isCodeLabItem } from "@/features/code-lab/code-lab-catalog";

// The real editor lazily loads Monaco, which needs browser APIs unavailable in
// jsdom. Replace it with a lightweight textarea so the mount logic is testable.
vi.mock("@/features/code-lab/monaco-code-editor", () => ({
  default: ({ value }: { value: string }) => <textarea defaultValue={value} data-testid="monaco-mock" />
}));

describe("metadata-driven Code Lab mount", () => {
  it("renders the Code Lab and editor for a code-capable item", () => {
    render(<MaybeCodeLab itemId="cpp.program_basics.structure.lesson" />);
    expect(screen.getByTestId("code-lab")).toBeInTheDocument();
    expect(screen.getByTestId("code-editor")).toBeInTheDocument();
    expect(screen.getByTestId("code-controls")).toBeInTheDocument();
  });

  it("renders nothing for an item without code-lab metadata", () => {
    const { container } = render(<MaybeCodeLab itemId="cpp.program_basics.structure.mc_entry" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("catalog helpers agree on which items are code-capable", () => {
    expect(isCodeLabItem("cpp.program_basics.io.lesson")).toBe(true);
    expect(getCodeLabConfigForItem("cpp.program_basics.io.lesson")?.language).toBe("cpp");
    expect(isCodeLabItem("cpp.program_basics.structure.mc_entry")).toBe(false);
  });
});
