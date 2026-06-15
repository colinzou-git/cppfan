# Pull Request

## Summary

Describe what changed and why.

## Linked issue

<!--
Closure discipline (see CLAUDE.md + #147). Fill in all three fields.
- Issue: the issue this PR advances, e.g. #120
- Completion status: `partial` or `complete`
- Reference keyword:
    - For `partial` work, use `Part of #N`. NEVER use Closes/Fixes/Resolves.
    - For `complete` work, use `Closes #N` ONLY when every box below is true.
-->

Issue:
Completion status: partial | complete
Reference keyword: Part of #N | Closes #N

### If `complete`, confirm (required to use a closing keyword):

- [ ] Every checkbox in the issue body has been reviewed
- [ ] Every acceptance criterion is mapped to code/test/doc evidence (or an explicitly justified removal)
- [ ] No issue comment says work remains ("still open", "not closing", "remaining work")
- [ ] All dependent UI, persistence, migration, accessibility, device, and E2E requirements are addressed
- [ ] A `## Final closure audit` comment is prepared/posted on the issue

### If `partial`, confirm:

- [ ] This PR uses `Part of #N` (no closing keyword)
- [ ] Remaining-work summary is included below

Remaining work (for partial PRs):

## Spec/docs checked

- [ ] Read `CLAUDE.md`
- [ ] Read relevant spec under `specs/`
- [ ] Updated docs if behavior or architecture changed

## Scope control

- [ ] Listed allowed edit zones before implementation
- [ ] Avoided unrelated files
- [ ] Did not change dependencies unless explicitly required
- [ ] Did not change database migrations/RLS unless explicitly required
- [ ] Did not change auth unless explicitly required

## Tests

Commands run:

```bash
# paste commands here
```

Results:

- [ ] Lint passed or not applicable
- [ ] Typecheck passed or not applicable
- [ ] Unit tests passed or not applicable
- [ ] E2E tests passed or not applicable

## UI evidence

For UI changes, add screenshots or Playwright traces.

## Known limitations

List any remaining limitations or follow-up issues.

## Rollback plan

Explain how to safely revert this change.
