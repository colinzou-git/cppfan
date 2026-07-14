import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentSourceBadge } from "@/features/user-content/content-source-badge";

describe("ContentSourceBadge (#487)", () => {
  it("renders the exact approved source labels", () => {
    const { rerender } = render(<ContentSourceBadge source="user" />);
    expect(screen.getByText("User-Created")).toBeTruthy();

    rerender(<ContentSourceBadge source="native" />);
    expect(screen.getByText("Native cppFan")).toBeTruthy();
  });
});
