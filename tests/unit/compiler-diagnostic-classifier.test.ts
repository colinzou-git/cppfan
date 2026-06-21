import { describe, expect, it } from "vitest";
import { classifyCompilerDiagnostics } from "@/features/code-lab/compiler-diagnostic-classifier";

describe("classifyCompilerDiagnostics", () => {
  it("tags a missing semicolon", () => {
    const tags = classifyCompilerDiagnostics("main.cpp:3:10: error: expected ';' before 'return'");
    expect(tags.map((t) => t.tag)).toContain("cpp.compile.syntax");
    expect(tags[0].source).toBe("compiler");
  });

  it("tags an undeclared identifier", () => {
    const gcc = classifyCompilerDiagnostics("error: 'x' was not declared in this scope");
    const clang = classifyCompilerDiagnostics("error: use of undeclared identifier 'x'");
    expect(gcc.map((t) => t.tag)).toContain("cpp.compile.name_not_declared");
    expect(clang.map((t) => t.tag)).toContain("cpp.compile.name_not_declared");
  });

  it("tags a missing include for a standard facility", () => {
    const tags = classifyCompilerDiagnostics("error: 'std::vector' was not declared in this scope");
    expect(tags.map((t) => t.tag)).toContain("cpp.compile.missing_include");
  });

  it("tags a type mismatch and a missing return", () => {
    expect(
      classifyCompilerDiagnostics("error: cannot convert 'std::string' to 'int'").map((t) => t.tag)
    ).toContain("cpp.compile.type_mismatch");
    expect(
      classifyCompilerDiagnostics("warning: control reaches end of non-void function").map((t) => t.tag)
    ).toContain("cpp.function.missing_return");
  });

  it("returns nothing for empty or unrecognised output and never throws", () => {
    expect(classifyCompilerDiagnostics("")).toEqual([]);
    expect(classifyCompilerDiagnostics("some unrelated note")).toEqual([]);
  });
});
