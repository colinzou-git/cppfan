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
- [ ] Read `docs/TEST_ENVIRONMENTS.md` when the change has UI, persistence, Auth, RPC, DB, or CI behavior
- [ ] Updated docs if behavior or architecture changed

## Scope control

- [ ] Listed allowed edit zones before implementation
- [ ] Avoided unrelated files
- [ ] Did not change dependencies unless explicitly required
- [ ] Did not change database migrations/RLS unless explicitly required
- [ ] Did not change auth unless explicitly required

## Tests

### Test environment selection

- [ ] Unit/component tests were required and run, or not applicable
- [ ] Public browser E2E was required and run, or not applicable
- [ ] Authenticated browser E2E with disposable local Supabase was required and run, or not applicable
- [ ] DB migration/integration validation was required and run, or not applicable
- [ ] Production operator verification was required, documented, and remains explicitly manual, or not applicable
- [ ] Existing CI/test environments were inspected before declaring anything blocked

Commands run:

```bash
# paste commands here
```

Results:

- [ ] Lint passed or not applicable
- [ ] Typecheck passed or not applicable
- [ ] Unit tests passed or not applicable
- [ ] Public E2E passed or not applicable
- [ ] Authenticated E2E passed or not applicable
- [ ] DB/integration checks passed or not applicable

Backend-dependent tests added or changed:

- Test file(s):
- Environment/classification:
- CI job/command:

## UI evidence

For UI changes, add screenshots or Playwright traces.

## Known limitations

List any remaining limitations or follow-up issues.

When deferring a test or acceptance criterion because of environment limits,
include the full `## Environment limitation analysis` required by `CLAUDE.md`.

## Rollback plan

Explain how to safely revert this change.
