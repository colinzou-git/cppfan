#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import ts from "typescript";

const roots = ["src", "tests", "scripts"];
const output = process.argv[2] ?? ".ai/repo-map.code-index.json";
const extensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const ignored = new Set([".ai", ".git", ".next", "coverage", "node_modules", "playwright-report", "test-results"]);

function estimateTokens(characters) {
  return Math.ceil(characters / 4);
}

async function walk(directory, files) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(entryPath, files);
    else if (entry.isFile() && extensions.has(extname(entry.name))) files.push(entryPath);
  }
}

function exported(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));
}

function symbolsFrom(sourceFile, filePath) {
  const symbols = [];
  for (const node of sourceFile.statements) {
    let kind = null;
    if (ts.isFunctionDeclaration(node)) kind = "function";
    else if (ts.isClassDeclaration(node)) kind = "class";
    else if (ts.isInterfaceDeclaration(node)) kind = "interface";
    else if (ts.isTypeAliasDeclaration(node)) kind = "type";
    else if (ts.isEnumDeclaration(node)) kind = "enum";
    if (!kind || !node.name) continue;
    const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
    symbols.push({ name: node.name.getText(sourceFile), kind, path: filePath, line, exported: exported(node) });
  }
  return symbols;
}

function importsFrom(sourceFile, filePath) {
  const imports = [];
  for (const node of sourceFile.statements) {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue;
    imports.push({ path: filePath, module: node.moduleSpecifier.text });
  }
  return imports;
}

const files = [];
for (const root of roots) await walk(resolve(root), files);
files.sort();

const indexedFiles = [];
const fileStats = [];
const symbols = [];
const imports = [];
let totalCharacters = 0;

for (const file of files) {
  const filePath = relative(process.cwd(), file).replaceAll("\\", "/");
  const source = await readFile(file, "utf8");
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);
  indexedFiles.push(filePath);
  fileStats.push({ path: filePath, characters: source.length, estimatedTokens: estimateTokens(source.length) });
  totalCharacters += source.length;
  symbols.push(...symbolsFrom(sourceFile, filePath));
  imports.push(...importsFrom(sourceFile, filePath));
}

const index = {
  generatedAt: new Date().toISOString(),
  tokenEstimate: {
    method: "characters-divided-by-4",
    note: "Approximation for observability only; provider tokenization varies."
  },
  summary: {
    files: indexedFiles.length,
    symbols: symbols.length,
    imports: imports.length,
    characters: totalCharacters,
    estimatedTokens: estimateTokens(totalCharacters)
  },
  files: indexedFiles,
  fileStats,
  symbols,
  imports
};

const outputPath = resolve(output);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
console.log(
  `Indexed ${indexedFiles.length} files, ${symbols.length} symbols, and ${imports.length} imports ` +
    `(~${index.summary.estimatedTokens.toLocaleString()} source tokens).`
);
