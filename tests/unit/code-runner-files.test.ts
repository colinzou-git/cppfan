import { describe, expect, it } from "vitest";
import { buildRunnerInput } from "@/features/code-lab/code-runner";

describe("buildRunnerInput read-only files (#489)", () => {
  it("omits files when none are supplied", () => {
    const input = buildRunnerInput({ source: "int main(){}", stdin: "", compilerFlags: ["-std=c++20"] });
    expect(input.files).toBeUndefined();
  });

  it("carries fixture files through to the runner input", () => {
    const input = buildRunnerInput({
      source: "int main(){}",
      stdin: "",
      compilerFlags: ["-std=c++20"],
      files: [{ name: "input.txt", content: "data" }]
    });
    expect(input.files).toEqual([{ name: "input.txt", content: "data" }]);
  });
});
