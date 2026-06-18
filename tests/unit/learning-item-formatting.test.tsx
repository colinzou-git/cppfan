import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormattedContent } from "@/features/learning-items/formatted-content";
import { LearningItemView } from "@/features/learning-items/learning-item-view";
import type { LearningItemWithDetails } from "@/features/learning-items/learning-item-types";

const PROMPT =
  "Execution begins in `int main()`, and `<iostream>` provides console I/O. **Example:**\n\n```cpp\n#include <iostream>\nint main() {\n  std::cout << \"Hello\";\n  return 0;\n}\n```";

const DATA: LearningItemWithDetails = {
  item: {
    id: "cpp.program_basics.structure.lesson",
    type: "lesson",
    title: "A minimal C++ program",
    prompt: PROMPT,
    explanation: "Use `return 0;` to report success.",
    difficulty: "beginner",
    estimated_minutes: 3,
    order_index: 1,
    is_active: true
  },
  skills: [],
  choices: []
};

describe("learning item formatted content (#332)", () => {
  it("renders inline Markdown and fenced C++ as readable elements instead of raw syntax", () => {
    render(<LearningItemView data={DATA} />);

    expect(screen.getByText("<iostream>", { selector: "code" })).toBeTruthy();
    expect(screen.getByText("Example:", { selector: "strong" })).toBeTruthy();

    const codeBlock = screen.getByTestId("formatted-code-block");
    expect(codeBlock.textContent).toContain("C++");
    expect(codeBlock.querySelector("pre code")?.textContent).toContain("#include <iostream>");
    expect(codeBlock.textContent).not.toContain("```cpp");

    const explanation = screen.getByTestId("learning-item-explanation");
    expect(within(explanation).getByText("return 0;", { selector: "code" })).toBeTruthy();
  });

  it("keeps raw HTML inert while formatting supported Markdown", () => {
    const { container } = render(<FormattedContent content={'<script>alert("x")</script>'} />);

    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText('<script>alert("x")</script>')).toBeTruthy();
  });
});
