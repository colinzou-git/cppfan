import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeErrorTagPanel } from "@/features/code-lab/code-error-tag-panel";

describe("CodeErrorTagPanel", () => {
  it("renders the tag, source, confidence, and explanation", () => {
    render(
      <CodeErrorTagPanel
        classifications={[
          {
            tag: "cpp.compile.syntax",
            source: "compiler",
            confidence: "high",
            message: "A statement is missing a semicolon."
          }
        ]}
      />
    );
    const panel = screen.getByTestId("code-error-tags");
    expect(panel).toHaveTextContent("cpp.compile.syntax");
    expect(panel).toHaveTextContent(/source: compiler/i);
    expect(panel).toHaveTextContent(/confidence: high/i);
    expect(panel).toHaveTextContent(/missing a semicolon/i);
  });

  it("renders nothing when there are no classifications", () => {
    const { container } = render(<CodeErrorTagPanel classifications={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
