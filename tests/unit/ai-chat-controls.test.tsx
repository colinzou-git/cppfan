import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItemHelpLinks } from "@/components/item-help-links";

const context = {
  schemaVersion: 1,
  sourceKind: "learning_item",
  sourceId: "lesson.raii",
  sourceVersion: "1",
  title: "RAII",
  prompt: "Explain RAII.",
  assessmentState: "instructional",
  revealPolicy: "normal"
} as const;

describe("AI chat item controls", () => {
  it("renders adjacent AI Chat and Chat history actions with item context", () => {
    render(<ItemHelpLinks context={context} />);

    const chat = screen.getByRole("link", { name: "AI Chat" });
    const history = screen.getByRole("link", { name: "Chat history" });
    expect(chat.parentElement).toBe(history.parentElement);
    expect(chat).toHaveAttribute("target", "_blank");
    expect(chat.getAttribute("href")).toContain("/tutor?mode=conversation");
    expect(chat.getAttribute("href")).toContain("sourceId%22%3A%22lesson.raii");
    expect(history.getAttribute("href")).toContain("mode=history");
  });
});
