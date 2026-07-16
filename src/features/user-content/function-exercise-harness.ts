/*
 * Deterministic server-side harness builder for function-mode user exercises
 * (#607). A function-mode exercise declares a C++ `functionSignature`; the
 * learner writes ONLY that function (no `main`). This module wraps the learner's
 * (or the author's starter/reference) source into a complete, single-`main`
 * translation unit that reads the function arguments from stdin, calls the
 * function, and prints the result deterministically.
 *
 * The SAME builder is used for starter validation, reference validation, learner
 * Run, and visible/hidden Test — there is exactly one harness semantics. Because
 * the generated `main` reads arguments from stdin, the translation unit is
 * constant per exercise and every test simply supplies different stdin (reusing
 * the existing stdin runner path).
 *
 * ## Authoring contract (bounded, documented)
 *
 * Supported parameter/return types: `int`, `long long`, `double`, `bool`,
 * `char`, `std::string`, and `std::vector<>` of int / long long / double /
 * string. `void` returns are unsupported (the harness prints a result).
 *
 * stdin format — one whitespace/newline-separated stream, arguments in order:
 *   - scalar (`int`/`long long`/`double`/`char`): one token;
 *   - `bool`: `1`/`0` or `true`/`false`;
 *   - `std::string`: one whitespace-delimited token (no embedded spaces);
 *   - `std::vector<T>`: an element count `n`, then `n` element tokens.
 *
 * expected-output format — how the harness prints the return value:
 *   - scalar: the value (`bool` as `true`/`false`);
 *   - `std::string`: verbatim;
 *   - `std::vector<T>`: elements space-separated on one line (empty => blank).
 * Grading uses a trimmed comparison, so a trailing newline never fails a test.
 */

import type { ValidationIssue } from "./user-content-types";

/** Canonical supported types (after normalization: no `std::`, single spaces). */
const SCALAR_TYPES = new Set(["int", "long long", "double", "bool", "char", "string"]);
const VECTOR_ELEMENT_TYPES = new Set(["int", "long long", "double", "string"]);

export type ParsedFunctionSignature = {
  returnType: string;
  name: string;
  paramTypes: string[];
};

export type ParseFunctionSignatureResult =
  | { ok: true; signature: ParsedFunctionSignature }
  | { ok: false; issues: ValidationIssue[] };

export type FunctionExerciseBuildInput = {
  learnerSource: string;
  functionSignature: string;
  harnessContract?: string;
};

export type FunctionExerciseBuildResult =
  | { ok: true; source: string }
  | { ok: false; issues: ValidationIssue[] };

/** Normalize a type: drop `std::`, collapse whitespace, trim. */
function normalizeType(raw: string): string {
  return raw.replace(/std::/g, "").replace(/\s+/g, " ").trim();
}

/** Is `type` (normalized) one of the supported parameter/return types? */
export function isSupportedFunctionType(type: string): boolean {
  const t = normalizeType(type);
  if (SCALAR_TYPES.has(t)) return true;
  const vec = /^vector<\s*(.+?)\s*>$/.exec(t);
  return vec ? VECTOR_ELEMENT_TYPES.has(vec[1]) : false;
}

/**
 * Parse a declared C++ function signature into { returnType, name, paramTypes }.
 * Only the bounded supported type vocabulary is accepted; anything else yields a
 * precise issue so publication fails early with an actionable message.
 */
export function parseFunctionSignature(signature: string): ParseFunctionSignatureResult {
  const issues: ValidationIssue[] = [];
  const sig = (signature ?? "").trim();
  if (!sig) {
    return { ok: false, issues: [{ field: "functionSignature", message: "function mode needs a declared signature" }] };
  }
  const open = sig.indexOf("(");
  const close = sig.lastIndexOf(")");
  if (open === -1 || close === -1 || close < open) {
    return { ok: false, issues: [{ field: "functionSignature", message: "the signature must look like `returnType name(type arg, …)`" }] };
  }

  const head = sig.slice(0, open).trim();
  const headMatch = /^(.*?)\s*\b([A-Za-z_]\w*)$/.exec(head);
  if (!headMatch || !headMatch[1].trim()) {
    return { ok: false, issues: [{ field: "functionSignature", message: "the signature needs a return type and a function name" }] };
  }
  const returnType = normalizeType(headMatch[1]);
  const name = headMatch[2];

  if (returnType === "void") {
    issues.push({ field: "functionSignature", message: "function mode needs a non-void return type so the result can be checked" });
  } else if (!isSupportedFunctionType(returnType)) {
    issues.push({ field: "functionSignature", message: `unsupported return type \`${returnType}\`. Supported: int, long long, double, bool, char, std::string, std::vector<int|long long|double|string>` });
  }

  const inner = sig.slice(open + 1, close).trim();
  const paramTypes: string[] = [];
  if (inner && normalizeType(inner) !== "void") {
    // Supported types contain no top-level commas, so a plain split is safe.
    for (const part of inner.split(",")) {
      const decl = part.trim();
      if (!decl) continue;
      // Strip a trailing parameter name if present: the type is everything else.
      const withName = /^(.*?)\s+([A-Za-z_]\w*)$/.exec(decl);
      const typeText = normalizeType(withName ? withName[1] : decl);
      if (!isSupportedFunctionType(typeText)) {
        issues.push({ field: "functionSignature", message: `unsupported parameter type \`${typeText}\`. Supported: int, long long, double, bool, char, std::string, std::vector<int|long long|double|string>` });
      } else {
        paramTypes.push(typeText);
      }
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }
  return { ok: true, signature: { returnType, name, paramTypes } };
}

/** C++ statements that declare `var` and read it from `std::cin`. */
function readerFor(type: string, varName: string): string {
  const vecMatch = /^vector<\s*(.+?)\s*>$/.exec(type);
  if (vecMatch) {
    const elem = cppType(vecMatch[1]);
    return (
      `  long long __n_${varName}; std::cin >> __n_${varName};\n` +
      `  std::vector<${elem}> ${varName}(__n_${varName} < 0 ? 0 : (size_t)__n_${varName});\n` +
      `  for (auto& __e : ${varName}) { ${readScalarInto(vecMatch[1], "__e")} }\n`
    );
  }
  if (type === "bool") {
    return `  std::string __t_${varName}; std::cin >> __t_${varName}; bool ${varName} = (__t_${varName} == "1" || __t_${varName} == "true" || __t_${varName} == "True");\n`;
  }
  return `  ${cppType(type)} ${varName}; ${readScalarInto(type, varName)}\n`;
}

/** Read one scalar of `type` into an already-declared lvalue `lv`. */
function readScalarInto(type: string, lv: string): string {
  if (type === "bool") {
    return `{ std::string __b; std::cin >> __b; ${lv} = (__b == "1" || __b == "true" || __b == "True"); }`;
  }
  return `std::cin >> ${lv};`;
}

/** Canonical, fully `std::`-qualified C++ spelling for a normalized type. */
function cppType(type: string): string {
  const vec = /^vector<\s*(.+?)\s*>$/.exec(type);
  if (vec) return `std::vector<${cppType(vec[1])}>`;
  if (type === "string") return "std::string";
  return type;
}

function buildEmitHelpers(): string {
  return [
    "static void __emit(long long __x) { std::cout << __x; }",
    "static void __emit(int __x) { std::cout << __x; }",
    "static void __emit(double __x) { std::cout << __x; }",
    'static void __emit(bool __x) { std::cout << (__x ? "true" : "false"); }',
    "static void __emit(char __x) { std::cout << __x; }",
    "static void __emit(const std::string& __x) { std::cout << __x; }",
    "template <class __T> static void __emit(const std::vector<__T>& __v) {",
    "  for (size_t __i = 0; __i < __v.size(); ++__i) { if (__i) std::cout << ' '; __emit(__v[__i]); }",
    "}"
  ].join("\n");
}

/**
 * Build the complete translation unit for a function-mode exercise. On an
 * unsupported/invalid signature returns typed issues (used to fail publication
 * with an actionable message rather than a confusing later compile error).
 */
export function buildFunctionExerciseTranslationUnit(input: FunctionExerciseBuildInput): FunctionExerciseBuildResult {
  const parsed = parseFunctionSignature(input.functionSignature);
  if (!parsed.ok) {
    return { ok: false, issues: parsed.issues };
  }
  const { name, paramTypes } = parsed.signature;

  const reads = paramTypes.map((type, i) => readerFor(type, `__arg${i}`)).join("");
  const args = paramTypes.map((_, i) => `__arg${i}`).join(", ");

  const source = [
    "#include <iostream>",
    "#include <vector>",
    "#include <string>",
    "#include <algorithm>",
    "#include <cstdint>",
    "",
    buildEmitHelpers(),
    "",
    "// ---- learner/author source (declares the required function) ----",
    input.learnerSource,
    "// ---- generated harness ----",
    "int main() {",
    "  std::ios_base::sync_with_stdio(false);",
    reads.length > 0 ? reads.replace(/\n$/, "") : "  // no parameters",
    `  auto __result = ${name}(${args});`,
    "  __emit(__result);",
    '  std::cout << "\\n";',
    "  return 0;",
    "}",
    ""
  ].join("\n");

  return { ok: true, source };
}

/** A learner-facing starter stub for a function-mode exercise (no `main`). */
export function functionExerciseStarter(signature: string): string {
  const parsed = parseFunctionSignature(signature);
  if (!parsed.ok) {
    return "// Implement the requested function.\n";
  }
  const { returnType, name, paramTypes } = parsed.signature;
  const params = paramTypes.map((type, i) => `${cppType(type)} arg${i}`).join(", ");
  return `${cppType(returnType)} ${name}(${params}) {\n  // TODO: implement\n}\n`;
}
