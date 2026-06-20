#!/usr/bin/env node
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const fixtureNames = [
  "catalog-fixtures-01.json",
  "catalog-fixtures-02.json",
  "catalog-fixtures-03a.json",
  "catalog-fixtures-03b1.json",
  "catalog-fixtures-03b2.json",
  "catalog-fixtures-03b3.json",
  "catalog-fixtures-03b4.json",
  "catalog-fixtures-03b5.json",
  "catalog-fixtures-04a.json",
  "catalog-fixtures-04b.json",
  "catalog-fixtures-05a.json",
  "catalog-fixtures-05b.json",
  "catalog-fixtures-06a.json",
  "catalog-fixtures-06b.json"
];
const fixturePaths = fixtureNames.map((name) =>
  join(repoRoot, "services/interview-judge", name)
);
const referenceChunkNames = [
  "reference-solutions.cpp.gz.b64.1",
  "reference-solutions.cpp.gz.b64.2",
  "reference-solutions.cpp.gz.b64.3.1",
  "reference-solutions.cpp.gz.b64.3.2",
  "reference-solutions.cpp.gz.b64.3.3",
  "reference-solutions.cpp.gz.b64.3.4"
];
const catalogs = await Promise.all(
  fixturePaths.map(async (path) => JSON.parse(await readFile(path, "utf8")))
);
const definitions = catalogs.flatMap((catalog) => catalog.definitions);

function requireCommand(command) {
  const result = spawnSync(command, ["--version"], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} is required to verify interview reference solutions`);
  }
}

function normalize(value) {
  return value.replace(/\r\n/g, "\n").trimEnd();
}

const compilers = [
  { command: "g++", label: "gcc" },
  { command: "clang++", label: "clang" }
];
for (const compiler of compilers) requireCommand(compiler.command);

const temp = await mkdtemp(join(tmpdir(), "cppfan-interview-catalog-"));
const sourcePath = join(temp, "reference-solutions.cpp");
const encodedSource = (
  await Promise.all(
    referenceChunkNames.map((name) =>
      readFile(join(repoRoot, "services/interview-judge", name), "utf8")
    )
  )
).join("");
await writeFile(sourcePath, gunzipSync(Buffer.from(encodedSource, "base64")));
let checked = 0;
try {
  for (const compiler of compilers) {
    for (const standard of ["c++17", "c++20"]) {
      const binary = join(temp, `${compiler.label}-${standard.replace("+", "p")}`);
      const compile = spawnSync(
        compiler.command,
        [`-std=${standard}`, "-O2", "-Wall", "-Wextra", sourcePath, "-o", binary],
        { encoding: "utf8", timeout: 120_000, maxBuffer: 4 * 1024 * 1024 }
      );
      if (compile.status !== 0) {
        throw new Error(
          `reference catalog failed to compile with ${compiler.label} ${standard}\n${compile.stdout}\n${compile.stderr}`
        );
      }

      // Compile the complete reference catalog under every supported toolchain.
      // Execute fixtures once with the canonical GCC/C++20 build so this gate
      // remains fast enough for every pull request.
      if (compiler.label === "gcc" && standard === "c++20") {
        for (const definition of definitions) {
          for (const test of definition.cases) {
            const run = spawnSync(binary, [], {
              input: `${definition.problemId}\n${test.stdin}`,
              encoding: "utf8",
              timeout: 5_000,
              maxBuffer: 1024 * 1024
            });
            if (run.status !== 0) {
              throw new Error(
                `${definition.problemId}/${test.id} failed under ${compiler.label} ${standard}: ` +
                  `${run.error?.message ?? run.stderr}`
              );
            }
            if (normalize(run.stdout) !== normalize(test.expectedStdout)) {
              throw new Error(
                `${definition.problemId}/${test.id} mismatch under ${compiler.label} ${standard}\n` +
                  `expected: ${JSON.stringify(normalize(test.expectedStdout))}\n` +
                  `actual:   ${JSON.stringify(normalize(run.stdout))}`
              );
            }
            checked += 1;
          }
        }
      }
    }
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}

console.log(
  `Interview catalog verified: ${definitions.length} problems, ` +
    `${checked} fixture executions, four compiler/standard builds.`
);
