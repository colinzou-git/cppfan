# Generated skill sample-code fallback

This note documents the correction after issue #445 exposed that generated fallback pages collided with existing `.lesson` seed/DB item IDs.

## Correct behavior

The C++ skill map preview should route every active skill to a sample-code page with Code Lab.

The first three hand-authored lessons keep their existing links:

- `cpp.program_basics.structure` -> `cpp.program_basics.structure.lesson`
- `cpp.program_basics.io` -> `cpp.program_basics.io.lesson`
- `cpp.program_basics.statements_comments` -> `cpp.program_basics.statements_comments.lesson`

Every other active skill now routes to a generated, non-colliding sample page:

```text
<skill_id>.sample_code
```

Examples:

- `cpp.program_basics.exit_status` -> `cpp.program_basics.exit_status.sample_code`
- `cpp.values_types.variables` -> `cpp.values_types.variables.sample_code`
- `cpp.values_types.initialization_pitfalls` -> `cpp.values_types.initialization_pitfalls.sample_code`
- `cpp.values_types.fundamental_types` -> `cpp.values_types.fundamental_types.sample_code`

## Why `.sample_code` is required

The first implementation generated fallback IDs as:

```text
<skill_id>.lesson
```

That collided with many existing seed/DB lessons, such as:

- `cpp.program_basics.exit_status.lesson`
- `cpp.values_types.variables.lesson`
- `cpp.values_types.initialization_pitfalls.lesson`

Because `getLearningItemWithDetails()` checks DB/seed content before generated content, those existing text lessons won and the generated prompt sample code was not shown. The `.sample_code` suffix avoids that collision.

## Key files

- `src/features/learning-items/generated-skill-learning-items.ts`
  - Generates sample-code item IDs.
  - Generates sample C++ program text.
  - Generates fallback learning items.
  - Rewrites skill-map preview links to generated `.sample_code` pages except the first three hand-authored sample lessons.

- `src/features/learning-items/learning-item-queries.ts`
  - Uses generated learning items when a generated `.sample_code` page is requested.

- `src/features/code-lab/code-lab-catalog.ts`
  - Generates Code Lab config for eligible skill-linked items.

- `tests/unit/learning-item-code-lab.test.tsx`
  - Verifies generated `.sample_code` IDs do not collide with seeded lessons.
  - Verifies later skill-map preview links are rewritten to generated sample-code pages.

## Manual verification

Open the dashboard skill map preview and click these skills:

- `main() return value and exit status`
- `Variables and fundamental types` / `Variables, types, and initialization`
- `Initialization and const intent`
- `Choosing a fundamental type`

Expected URL suffixes:

- `/learn/cpp.program_basics.exit_status.sample_code`
- `/learn/cpp.values_types.variables.sample_code`
- `/learn/cpp.values_types.initialization_pitfalls.sample_code`
- `/learn/cpp.values_types.fundamental_types.sample_code`

Expected page behavior:

- Title ends with `sample code`.
- Prompt includes a fenced `cpp` sample.
- Code Lab appears beside or below the prompt.
- Starter code prints `Practice: <skill title>`.
