# Issue #470 reviewed patch package (v2)

Use this package instead of the earlier generated `.patch` comment/file.

## Review findings from the previous patch

1. The generated unified diff `cppfan-debug-tab-side-by-side-ui.patch` is malformed around `DebugInfoContent`; it contains mixed add/remove context and should not be applied as-is.
2. Unit tests must mock `explainDebugRequest`; otherwise `useCodeDebugger` imports a missing mocked function.
3. `ProgramOutputContent` should still show `exitCode` even when stdout/stderr are empty.
4. Variable array rendering should support both current string-style values (`{1, 2, 3}`, `[0] = 1`) and a future optional `children` shape from the GDB service.
5. The DEBUG INFO popup and expanded internal windows should close on `Escape`.
6. The DEBUG INFO popup should expose dialog semantics for accessibility.
7. A nullable/fallback array child expression was rewritten to avoid unsafe `??`/`||` mixing.

## Correct artifacts to use

Use the v2 issue comment titled **Reviewed v2 patch package — use this instead of earlier patch** as the source of truth. It includes corrected replacement-file guidance for:

- `src/features/code-lab/debug-tab-panel.tsx`
- `tests/unit/debug-tab-panel.test.tsx`
- `tests/e2e/code-lab-debugger.spec.ts`

Optional type improvement for future GDB child variables:

```diff
diff --git a/src/features/code-lab/code-debug-types.ts b/src/features/code-lab/code-debug-types.ts
--- a/src/features/code-lab/code-debug-types.ts
+++ b/src/features/code-lab/code-debug-types.ts
@@
 export type CodeDebugVariable = {
   name: string;
   value: string;
   type?: string;
   changed?: boolean;
+  /** Optional structured children for arrays, vectors, structs, and pretty-printer output. */
+  children?: CodeDebugVariable[];
 };
```

The reviewed `debug-tab-panel` implementation compiles without this type change by using a local safe cast, but adding `children` to the shared type is the right long-term contract.

## Implementation notes

- Do not apply the old `cppfan-debug-tab-side-by-side-ui.patch` directly.
- Prefer replacing the affected files from the v2 issue comment, then run formatting/linting.
- Keep the real Code Lab layout unchanged: Problem panel | editor | right dock.
- This feature is Debug-tab UI only. Do not change FSRS, learning progress, AI chat, normal Run/Tests behavior, Supabase, or learning content.

## Verification commands

```bash
pnpm lint
pnpm typecheck
pnpm test -- tests/unit/debug-tab-panel.test.tsx
pnpm test:e2e -- tests/e2e/code-lab-debugger.spec.ts
pnpm build
```

## Acceptance checks

- Debug tab shows compact toolbar.
- `BREAKPOINTS` is no longer a main internal window.
- CALLSTACK and VARIABLES are side by side.
- PROGRAM OUTPUT only contains program stdout/stderr and exit code.
- Compiler/debugger/service details appear only after clicking the small DEBUG INFO button.
- PROGRAM OUTPUT has `resize-y` behavior.
- CALLSTACK, VARIABLES, and PROGRAM OUTPUT each have a corner popout button.
- VARIABLES expands array-like values.
- Unconfigured debugger still shows a friendly message and keeps other tabs usable.
