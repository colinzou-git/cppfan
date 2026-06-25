import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MaybeCodeLab } from "@/features/code-lab/maybe-code-lab";
import { getCodeLabConfigForItem, isCodeLabItem } from "@/features/code-lab/code-lab-catalog";
import {
  getGeneratedItemLinksBySkill,
  getGeneratedLearningItemById,
  getGeneratedLearningItemIdForSkill
} from "@/features/learning-items/generated-skill-learning-items";

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

  it("renders nothing for a multiple-choice item without code-lab metadata", () => {
    const { container } = render(<MaybeCodeLab itemId="cpp.program_basics.structure.mc_entry" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("catalog helpers agree on which explicit items are code-capable", () => {
    expect(isCodeLabItem("cpp.program_basics.io.lesson")).toBe(true);
    expect(getCodeLabConfigForItem("cpp.program_basics.io.lesson")?.language).toBe("cpp");
    expect(isCodeLabItem("cpp.program_basics.structure.mc_entry")).toBe(false);
  });

  it("generates a runnable Code Lab for later skill lessons", () => {
    const config = getCodeLabConfigForItem("cpp.values_types.variables.lesson");
    expect(config?.language).toBe("cpp");
    expect(config?.starterCode).toContain("Skill: Variables, types, and initialization");
    expect(config?.visibleTests[0]?.expectedStdout).toBe("Practice: Variables, types, and initialization\n");
  });

  it("generates a Code Lab for non-quiz skill-map item shapes", () => {
    expect(isCodeLabItem("cpp.structs_classes.public_private.concept_access")).toBe(true);
    expect(getCodeLabConfigForItem("cpp.structs_classes.public_private.concept_access")?.skillTags).toEqual([
      "cpp.structs_classes.public_private"
    ]);
  });

  it("uses distinct generated sample-code pages for later skill-map preview links", () => {
    const links = getGeneratedItemLinksBySkill({
      "cpp.program_basics.structure": "cpp.program_basics.structure.lesson",
      "cpp.program_basics.exit_status": "cpp.program_basics.exit_status.lesson",
      "cpp.values_types.variables": "cpp.values_types.variables.lesson",
      "cpp.values_types.initialization_pitfalls": "cpp.values_types.initialization_pitfalls.lesson"
    });

    expect(links["cpp.program_basics.structure"]).toBe("cpp.program_basics.structure.lesson");
    expect(links["cpp.program_basics.exit_status"]).toBe("cpp.program_basics.exit_status.sample_code");
    expect(links["cpp.values_types.variables"]).toBe("cpp.values_types.variables.sample_code");
    expect(links["cpp.values_types.initialization_pitfalls"]).toBe(
      "cpp.values_types.initialization_pitfalls.sample_code"
    );
  });

  it("creates generated sample-code learning items that do not collide with seeded lesson ids", () => {
    const itemId = getGeneratedLearningItemIdForSkill("cpp.values_types.variables");
    const item = getGeneratedLearningItemById(itemId);

    expect(itemId).toBe("cpp.values_types.variables.sample_code");
    expect(item?.item.title).toBe("Variables, types, and initialization sample code");
    expect(item?.item.prompt).toContain("```cpp");
    expect(item?.item.prompt).toContain("Skill: Variables, types, and initialization");
    expect(getCodeLabConfigForItem(itemId)?.starterCode).toContain("Skill: Variables, types, and initialization");
  });

  it("also serves generated sample content from legacy lesson URLs after the first three skills", () => {
    const item = getGeneratedLearningItemById("cpp.program_basics.exit_status.lesson");

    expect(item?.item.title).toBe("main() return value and exit status sample code");
    expect(item?.item.prompt).toContain("```cpp");
    expect(item?.item.prompt).toContain("Skill: main() return value and exit status");
    expect(getCodeLabConfigForItem("cpp.program_basics.exit_status.lesson")?.starterCode).toContain(
      "Skill: main() return value and exit status"
    );
  });

  it("keeps the first three hand-authored lesson URLs on explicit Code Lab content", () => {
    expect(getGeneratedLearningItemById("cpp.program_basics.structure.lesson")).toBeNull();
    expect(getCodeLabConfigForItem("cpp.program_basics.structure.lesson")?.prompt).toContain("Hello, cppFan!");
  });
});
