import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CodeFieldsEditor, EMPTY_CODE_FIELDS } from "@/features/user-content/code-fields-editor";

describe("CodeFieldsEditor (#487)", () => {
  it("renders all code-bearing fields", () => {
    render(<CodeFieldsEditor values={EMPTY_CODE_FIELDS} onChange={vi.fn()} />);
    for (const label of ["Sample code", "Starter code", "Reference solution", "Expected output", "Solution explanation"]) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
  });

  it("emits a patch for the edited field only", () => {
    const onChange = vi.fn();
    render(<CodeFieldsEditor values={EMPTY_CODE_FIELDS} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Reference solution"), { target: { value: "int main(){}" } });
    expect(onChange).toHaveBeenCalledWith({ referenceSolution: "int main(){}" });

    fireEvent.change(screen.getByLabelText("Expected output"), { target: { value: "42" } });
    expect(onChange).toHaveBeenCalledWith({ expectedOutput: "42" });
  });

  it("shows current values", () => {
    render(
      <CodeFieldsEditor
        values={{ ...EMPTY_CODE_FIELDS, sampleCode: "cout << 1;" }}
        onChange={vi.fn()}
      />
    );
    expect((screen.getByLabelText("Sample code") as HTMLTextAreaElement).value).toBe("cout << 1;");
  });
});
