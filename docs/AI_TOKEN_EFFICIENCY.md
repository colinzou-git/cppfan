# AI token-efficiency workflow

Use repository structure and machine-readable queries before asking Codex or Claude Code to scan broad directories.

## Recommended order

1. **TypeScript language service first.** `.vscode/settings.json` pins the workspace TypeScript SDK and excludes generated directories from search and file watching. Agents with LSP support should use definitions, references, diagnostics, and rename results instead of reading many files manually.
2. **Root instructions.** Read `AGENTS.md` or `CLAUDE.md` before editing.
3. **Path-scoped rules.** Codex automatically picks up the nearest nested `AGENTS.md`; Claude loads matching files under `.claude/rules/`.
4. **Quiet tests.** Use the quiet Vitest config while iterating:

   ```bash
   pnpm exec vitest run --config vitest.quiet.config.ts
   ```

   Run the normal repository checks before merging so CI behavior remains unchanged.
5. **Queryable symbol/import index.** Build the index only when code has changed materially:

   ```bash
   node scripts/ai/code-index.mjs
   node scripts/ai/query-code-index.mjs getExerciseById
   node scripts/ai/query-code-index.mjs @/features/exercises --limit 10
   ```

The generated index is `.ai/repo-map.code-index.json`. It matches the existing `.ai/repo-map.*` ignore rule and must not be committed.

## What the index contains

The indexer uses the existing `typescript` dependency and records:

- TypeScript/JavaScript source paths under `src`, `tests`, and `scripts`;
- top-level functions, classes, interfaces, types, and enums;
- import module specifiers;
- declaration line numbers and whether declarations are exported.

This is intentionally smaller than a full repository dump. It answers common navigation questions without consuming tokens on unrelated implementation details.

## Agent workflow

Before opening broad files:

```text
issue/spec
  -> LSP definition/reference lookup
  -> code-index query
  -> read the smallest relevant files
  -> focused edit
  -> quiet focused tests
  -> normal validation and CI
```

Regenerate the index after moving or renaming source files. Do not use the generated index as a correctness source; the compiler, tests, and current source files remain authoritative.
