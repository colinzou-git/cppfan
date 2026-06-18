// Compile-check structured curriculum code examples (#98).
//
// Each example lives in curriculum-examples/<id>/ with a meta.json and an
// example.cpp. POSITIVE examples must compile clean under their declared standard
// with strong warnings, and (when expectedOutput is set) run and match it.
// On Linux/macOS the positive examples are also rebuilt and run with ASan/UBSan.
// BUG_SPOTTING examples are intentionally defective and are NOT compiled here —
// their structure is validated by tests/unit/curriculum-examples.test.ts. Fails
// with the owning learning-item id and the compiler/runtime output.
//
// Cross-platform (Node + g++); set CXX to override the compiler.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const EXAMPLES_DIR = join(ROOT, "curriculum-examples");
const CXX = process.env.CXX || "g++";
const STD_FLAG = { "c++17": "-std=c++17", "c++20": "-std=c++20", "c++23": "-std=c++23" };
const RUN_SANITIZERS = process.env.CPPFAN_SKIP_SANITIZERS !== "1" && process.platform !== "win32";
const SANITIZER_FLAGS = ["-fsanitize=address,undefined", "-fno-omit-frame-pointer"];

const failures = [];

function fail(id, itemId, message) {
  failures.push(`[${id}] (${itemId}) ${message}`);
}

const dirs = readdirSync(EXAMPLES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

let positives = 0;
let sanitized = 0;
for (const id of dirs) {
  const dir = join(EXAMPLES_DIR, id);
  const metaPath = join(dir, "meta.json");
  if (!existsSync(metaPath)) {
    fail(id, "?", "missing meta.json");
    continue;
  }
  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  const itemId = meta.itemId ?? "?";

  if (meta.kind === "bug_spotting") {
    continue; // structurally validated by the unit test, not compiled
  }
  if (meta.kind !== "positive") {
    fail(id, itemId, `unknown kind "${meta.kind}"`);
    continue;
  }

  const std = STD_FLAG[meta.standard];
  if (!std) {
    fail(id, itemId, `unsupported standard "${meta.standard}"`);
    continue;
  }

  const src = join(dir, "example.cpp");
  if (!existsSync(src)) {
    fail(id, itemId, "missing example.cpp");
    continue;
  }

  const tmp = mkdtempSync(join(tmpdir(), "cppfan-example-"));
  const bin = join(tmp, "a.out");
  const sanitizedBin = join(tmp, "a.san.out");
  try {
    try {
      execFileSync(CXX, [std, "-Wall", "-Wextra", "-Wpedantic", "-Werror", src, "-o", bin], {
        stdio: "pipe"
      });
    } catch (err) {
      fail(id, itemId, `did not compile clean:\n${err.stderr?.toString() ?? err.message}`);
      continue;
    }
    positives += 1;

    if (typeof meta.expectedOutput === "string") {
      let out = "";
      try {
        out = execFileSync(bin, [], { stdio: "pipe" }).toString();
      } catch (err) {
        fail(id, itemId, `ran with a non-zero exit:\n${err.stderr?.toString() ?? err.message}`);
        continue;
      }
      // Normalize line endings so the contract is OS-independent (MinGW emits CRLF).
      const actual = out.replace(/\r\n/g, "\n");
      const expected = meta.expectedOutput.replace(/\r\n/g, "\n");
      if (actual !== expected) {
        fail(id, itemId, `output mismatch.\n expected: ${JSON.stringify(expected)}\n actual:   ${JSON.stringify(actual)}`);
      }
    }

    if (RUN_SANITIZERS) {
      try {
        execFileSync(
          CXX,
          [std, "-Wall", "-Wextra", "-Wpedantic", "-Werror", ...SANITIZER_FLAGS, src, "-o", sanitizedBin],
          { stdio: "pipe" }
        );
      } catch (err) {
        fail(id, itemId, `sanitizer build failed:\n${err.stderr?.toString() ?? err.message}`);
        continue;
      }
      try {
        const sanitizedOut = execFileSync(sanitizedBin, [], { stdio: "pipe" }).toString();
        sanitized += 1;
        if (typeof meta.expectedOutput === "string") {
          const actual = sanitizedOut.replace(/\r\n/g, "\n");
          const expected = meta.expectedOutput.replace(/\r\n/g, "\n");
          if (actual !== expected) {
            fail(
              id,
              itemId,
              `sanitizer output mismatch.\n expected: ${JSON.stringify(expected)}\n actual:   ${JSON.stringify(actual)}`
            );
          }
        }
      } catch (err) {
        fail(id, itemId, `sanitizer run failed:\n${err.stderr?.toString() ?? err.message}`);
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

if (failures.length > 0) {
  console.error(`curriculum example verification FAILED (${failures.length}):`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
const sanitizerSummary = RUN_SANITIZERS ? `; ${sanitized} sanitizer-backed runs` : "; sanitizer runs skipped";
console.log(
  `all curriculum examples verified (${positives} positive compiled/ran across ${dirs.length} examples${sanitizerSummary})`
);
