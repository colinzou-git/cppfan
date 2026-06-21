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
});
