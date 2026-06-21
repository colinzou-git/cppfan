import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TutorMessageContent } from "@/features/ai-chat/tutor-conversation";

describe("TutorMessageContent", () => {
  it("renders markdown tables as readable HTML tables", () => {
    render(
      <TutorMessageContent
        content={[
          "Below is a compact reference table.",
          "",
          "| Category | Type | Remarks |",
          "|---|---|---|",
          "| **Integer** | `int` | Whole numbers |",
          "| **Floating** | `double` | Decimal literals default here |",
          "",
          "Use suffixes when you need a different literal type."
        ].join("\n")}
      />
    );

    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: "Category" })).toBeInTheDocument();
    expect(within(table).getByRole("cell", { name: "int" }).tagName).toBe("TD");
    expect(within(table).getByText("int").tagName).toBe("CODE");
    expect(screen.queryByText("| Category | Type | Remarks |")).not.toBeInTheDocument();
    expect(screen.getByText("Use suffixes when you need a different literal type.")).toBeInTheDocument();
  });

  it("renders Gemini-style headings and fenced C++ snippets without raw markdown fences", () => {
    render(
      <TutorMessageContent
        content={[
          "### The Core Idea",
          "",
          "A reference is an alias for another object.",
          "",
          "```cpp",
          "int x = 5;",
          "int& r = x;",
          "r = 10;",
          "```",
          "",
          "---",
          "",
          "Use `r` after binding."
        ].join("\n")}
      />
    );

    expect(screen.getByRole("heading", { name: "The Core Idea", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("cpp")).toBeInTheDocument();
    expect(screen.getByText(/int& r = x;/).tagName).toBe("CODE");
    expect(screen.getByText("r").tagName).toBe("CODE");
    expect(screen.queryByText("### The Core Idea")).not.toBeInTheDocument();
    expect(screen.queryByText("```cpp")).not.toBeInTheDocument();
    expect(screen.queryByText("```")).not.toBeInTheDocument();
    expect(screen.queryByText("---")).not.toBeInTheDocument();
  });
});
