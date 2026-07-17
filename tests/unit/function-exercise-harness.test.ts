import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildFunctionExerciseTranslationUnit,
  functionExerciseStarter,
  parseFunctionSignature
} from "@/features/user-content/function-exercise-harness";

function hasGpp(): boolean {
  try {
    execFileSync("g++", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/** Compile a generated TU with g++ and run it against `stdin`, returning stdout. */
function compileAndRun(source: string, stdin: string): { ok: boolean; stdout: string; stderr: string } {
  const dir = mkdtempSync(join(tmpdir(), "fnharness-"));
  try {
    const src = join(dir, "main.cpp");
    const bin = join(dir, "run");
    writeFileSync(src, source);
    try {
      execFileSync("g++", ["-std=c++20", "-O0", "-w", src, "-o", bin], { stdio: "pipe" });
    } catch (e) {
      return { ok: false, stdout: "", stderr: String((e as { stderr?: Buffer }).stderr ?? e) };
    }
    const stdout = execFileSync(bin, { input: stdin, encoding: "utf8" });
    return { ok: true, stdout, stderr: "" };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("parseFunctionSignature (#607)", () => {
  it("parses a supported scalar signature", () => {
    const r = parseFunctionSignature("int add(int a, int b)");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.signature).toEqual({ returnType: "int", name: "add", paramTypes: ["int", "int"] });
    }
  });

  it("parses vector and string types, dropping std::", () => {
    const r = parseFunctionSignature("std::vector<int> two_sum(std::vector<int> nums, int target)");
    expect(r.ok && r.signature.returnType).toBe("vector<int>");
    expect(r.ok && r.signature.paramTypes).toEqual(["vector<int>", "int"]);
  });

  it("rejects an unsupported parameter type with a precise issue", () => {
    const r = parseFunctionSignature("int f(std::map<int,int> m)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.issues[0].message).toMatch(/unsupported parameter type/i);
  });

  it("rejects a void return type", () => {
    const r = parseFunctionSignature("void f(int a)");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.issues[0].message).toMatch(/non-void/i);
  });

  it("rejects a malformed signature", () => {
    expect(parseFunctionSignature("not a signature").ok).toBe(false);
    expect(parseFunctionSignature("").ok).toBe(false);
  });
});

describe("buildFunctionExerciseTranslationUnit (#607)", () => {
  it("generates exactly one main() and includes the learner source", () => {
    const built = buildFunctionExerciseTranslationUnit({
      learnerSource: "int add(int a, int b){ return a + b; }",
      functionSignature: "int add(int a, int b)"
    });
    expect(built.ok).toBe(true);
    if (built.ok) {
      expect(built.source.match(/int main\(/g)?.length).toBe(1);
      expect(built.source).toContain("int add(int a, int b){ return a + b; }");
    }
  });

  it("fails to build on an unsupported signature (used to block publication)", () => {
    const built = buildFunctionExerciseTranslationUnit({ learnerSource: "", functionSignature: "int f(std::set<int> s)" });
    expect(built.ok).toBe(false);
  });

  it("produces a function stub starter without a main", () => {
    const stub = functionExerciseStarter("std::vector<int> solve(std::vector<int> v, int k)");
    expect(stub).toContain("std::vector<int> solve(std::vector<int> arg0, int arg1)");
    expect(stub).not.toContain("main");
  });
});

const maybe = hasGpp() ? describe : describe.skip;

maybe("function harness executes real submissions (#607)", () => {
  function build(learnerSource: string, signature: string): string {
    const r = buildFunctionExerciseTranslationUnit({ learnerSource, functionSignature: signature });
    if (!r.ok) throw new Error("build failed: " + JSON.stringify(r.issues));
    return r.source;
  }

  it("scalar function reads args from stdin and prints the result", () => {
    const src = build("int add(int a, int b){ return a + b; }", "int add(int a, int b)");
    expect(compileAndRun(src, "2 3\n").stdout.trim()).toBe("5");
    // negative integers serialize correctly
    expect(compileAndRun(src, "-4 1\n").stdout.trim()).toBe("-3");
  });

  it("vector<int> parameter uses a count prefix; empty vector works", () => {
    const src = build("int sumv(std::vector<int> v){ int s=0; for(int x:v) s+=x; return s; }", "int sumv(std::vector<int> v)");
    expect(compileAndRun(src, "3\n1 2 3\n").stdout.trim()).toBe("6");
    expect(compileAndRun(src, "0\n").stdout.trim()).toBe("0");
  });

  it("string in/out round-trips", () => {
    const src = build("std::string echo(std::string s){ return s; }", "std::string echo(std::string s)");
    expect(compileAndRun(src, "hello\n").stdout.trim()).toBe("hello");
  });

  it("vector<string> return prints space-separated", () => {
    const src = build(
      "std::vector<std::string> rev(std::vector<std::string> v){ std::reverse(v.begin(), v.end()); return v; }",
      "std::vector<std::string> rev(std::vector<std::string> v)"
    );
    expect(compileAndRun(src, "3\na b c\n").stdout.trim()).toBe("c b a");
  });

  it("bool return prints true/false", () => {
    const src = build("bool even(int n){ return n % 2 == 0; }", "bool even(int n)");
    expect(compileAndRun(src, "4\n").stdout.trim()).toBe("true");
    expect(compileAndRun(src, "5\n").stdout.trim()).toBe("false");
  });

  it("a learner compile error is reported by the compiler, not a fake pass", () => {
    const src = build("int add(int a, int b){ return a + ; }", "int add(int a, int b)");
    expect(compileAndRun(src, "1 2\n").ok).toBe(false);
  });
});
