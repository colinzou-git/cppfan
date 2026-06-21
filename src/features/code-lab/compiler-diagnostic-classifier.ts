import type { CodeErrorTag, CodeTagClassification } from "./code-error-tags";

/**
 * Deterministic compiler-diagnostic classifier (#412). Maps common g++/clang
 * diagnostic phrasing to stable CodeErrorTag values. AI-free and pattern-based;
 * it never throws on unrecognised output (returns []).
 */

export type CompilerDiagnosticPattern = {
  tag: CodeErrorTag;
  confidence: "low" | "medium" | "high";
  message: string;
  patterns: RegExp[];
};

export const COMPILER_DIAGNOSTIC_PATTERNS: CompilerDiagnosticPattern[] = [
  {
    tag: "cpp.compile.syntax",
    confidence: "high",
    message: "A statement is missing a semicolon.",
    patterns: [/expected\s+';'/i, /expected\s+`;'/i]
  },
  {
    tag: "cpp.compile.name_not_declared",
    confidence: "high",
    message: "A name is used before it is declared.",
    patterns: [
      /was not declared in this scope/i,
      /use of undeclared identifier/i,
      /undeclared identifier/i
    ]
  },
  {
    tag: "cpp.compile.missing_include",
    confidence: "medium",
    message: "A standard header may be missing (e.g. <vector>, <string>, <iostream>).",
    patterns: [
      /'?std::vector'?\s+(?:was not declared|has not been declared|is not a member)/i,
      /'?std::string'?\s+(?:was not declared|has not been declared|is not a member)/i,
      /'?std::(?:cout|cin|map|set|sort)'?\s+(?:was not declared|has not been declared|is not a member)/i
    ]
  },
  {
    tag: "cpp.compile.type_mismatch",
    confidence: "high",
    message: "A type does not match what the code expects.",
    patterns: [
      /no matching function for call/i,
      /cannot convert/i,
      /invalid conversion/i,
      /no match for '?operator/i
    ]
  },
  {
    tag: "cpp.function.missing_return",
    confidence: "medium",
    message: "A non-void function may be missing a return statement.",
    patterns: [/control reaches end of non-void function/i, /no return statement in function returning non-void/i]
  }
];

export function hasCompilerPattern(stderr: string, pattern: CompilerDiagnosticPattern): boolean {
  return pattern.patterns.some((re) => re.test(stderr));
}

export function classifyCompilerDiagnostics(stderr: string): CodeTagClassification[] {
  if (!stderr) return [];
  const out: CodeTagClassification[] = [];
  for (const pattern of COMPILER_DIAGNOSTIC_PATTERNS) {
    if (hasCompilerPattern(stderr, pattern)) {
      out.push({
        tag: pattern.tag,
        source: "compiler",
        confidence: pattern.confidence,
        message: pattern.message
      });
    }
  }
  return out;
}
