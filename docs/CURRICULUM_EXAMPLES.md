# Curriculum executable examples (#98)

Structured C++ examples that CI compiles (and, where a contract is declared, runs)
so curriculum code is verified rather than assumed correct. This is the
non-regex-scraping representation called for in #98: each example is a real file
tied to a learning item, with explicit metadata.

## Layout

Each example is a directory under `curriculum-examples/<example-id>/`:

```
curriculum-examples/<example-id>/
  meta.json
  example.cpp
```

### `meta.json`

| field            | required            | meaning                                                                 |
| ---------------- | ------------------- | ----------------------------------------------------------------------- |
| `itemId`         | yes                 | The learning-item ID this example belongs to (must exist in the seed).  |
| `kind`           | yes                 | `positive` (must compile/behave) or `bug_spotting` (intentionally defective). |
| `standard`       | yes                 | `c++17`, `c++20`, or `c++23` — the standard it is compiled under.        |
| `expectedOutput` | positive, optional  | Exact stdout contract (line endings normalized); checked when present.  |
| `defect`         | bug_spotting        | Short description of the intended defect.                               |
| `correctedBy`    | bug_spotting, optional | Example ID of the corrected companion (must exist and be `positive`).|
| `note`           | optional            | Authoring note; not validated.                                          |

## What CI does

`scripts/curriculum-examples/verify.mjs` (in the **C++ exercises** job):

- compiles every `positive` example with `-std=<standard> -Wall -Wextra -Wpedantic -Werror`;
- runs it and compares stdout to `expectedOutput` when that contract is set (line
  endings normalized so the contract is OS-independent);
- **skips** `bug_spotting` examples — they are intentionally defective and must not
  be mistaken for positive examples;
- fails with the owning learning-item ID and the compiler/runtime output.

`tests/unit/curriculum-examples.test.ts` validates the manifest contract (real
`itemId`, valid `kind`/`standard`, `example.cpp` present, bug-spotting examples
document a defect and any `correctedBy` companion exists and is positive).

## Authoring workflow

1. Pick the learning item the example illustrates; note its ID.
2. Create `curriculum-examples/<example-id>/` with `meta.json` and `example.cpp`.
3. Keep positive examples **self-contained** (include the headers they use); declare
   an `expectedOutput` when the program prints a deterministic result.
4. For a defect, add a `bug_spotting` example documenting the `defect`, and prefer a
   corrected `positive` companion referenced via `correctedBy`.
5. Verify locally: `node scripts/curriculum-examples/verify.mjs` (needs `g++`; set
   `CXX` to override) and `pnpm test`.

## Scope / not yet covered

Lesson prompts still embed illustrative snippets inline; migrating those into this
structured representation (so they are compiled too) is the remaining #98 work, as
is sanitizer coverage on suitable examples.
