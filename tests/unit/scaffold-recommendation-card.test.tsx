import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScaffoldRecommendationCard } from "@/features/recommendations/scaffold-recommendation-card";
import type { ScaffoldRecommendation } from "@/features/recommendations/scaffold-selector-types";

const rec: ScaffoldRecommendation = {
  skillId: "s1",
  level: "completion",
  itemId: "comp.1",
  reason: "Recommended because recent syntax errors suggest a guided completion.",
  priority: "medium"
};

describe("ScaffoldRecommendationCard", () => {
  it("renders the level, reason, link, and a not-a-hard-lock message", () => {
    render(<ScaffoldRecommendationCard recommendation={rec} />);
    const card = screen.getByTestId("scaffold-recommendation");
    expect(card).toHaveAttribute("data-level", "completion");
    expect(card).toHaveTextContent(/Completion exercise/i);
    expect(card).toHaveTextContent(/guided completion/i);
    expect(screen.getByTestId("scaffold-recommendation-link")).toHaveAttribute(
      "href",
      "/learn/comp.1#code-lab"
    );
    expect(card).toHaveTextContent(/practice anything you like/i);
  });

  it("renders nothing without a recommendation", () => {
    const { container } = render(<ScaffoldRecommendationCard recommendation={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
