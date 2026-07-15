# User-Created Content

Status: **#487 Phase 1 — complete.** Authenticated users can create private
lessons, author them manually or with the configured AI provider, publish them,
and then learn, review, and build mastery from them through the same cppFan
learning loop as native content. This document is the reference for the model,
security, projection, attachments, AI authoring, versioning, and the portable
export package.

## Concepts

- **Kinds** (`UserContentKind`): `lesson`, `exercise`, `lab`, `interview_problem`.
  Phase 1 exposes only `lesson`; the union and tables are ready for later phases.
- **Lifecycle** (`UserContentLifecycle`): `draft` → `published` → `archived`.
  `Save` writes a draft; publishing is a separate explicit action.
- **Source** (`ContentSource`): `native` or `user`. The exact visible labels are
  `Native cppFan` and `User-Created` (`SOURCE_LABELS`), shown everywhere the item
  appears (`ContentSourceBadge`).
- **Attachment visibility** (`AttachmentVisibility`): `author_source` (default;
  visible to the owner/AI only) or `learner_resource` (shown on the learner page).

All content is private to its owner in this release; sign-in is required.

## Persistence and RLS

Three owner-scoped tables (`supabase/migrations/20260714100000_create_user_content.sql`):

- `user_content_items` — identity, kind, title, `native_module_id`,
  `lifecycle_status`, `recommendation_enabled`, current draft/published version
  refs, `draft_revision` (optimistic concurrency), timestamps.
- `user_content_versions` — immutable snapshots: monotonic `version_number`,
  `schema_version`, `version_state` (`draft`/`published`/`superseded`), `payload`.
- `user_content_attachments` — `attachment_kind`
  (`file`/`image`/`pdf`/`url`/`github_url`/`lesson_ref`), `visibility`,
  `storage_path`, `external_url`, `referenced_learning_item_id`, `filename`,
  `mime_type`, `size_bytes`.

Every table has RLS restricting all access to `auth.uid() = user_id`. Writes go
through `SECURITY DEFINER` RPCs (`save_user_content_draft`, `publish_user_content`,
`archive_/restore_/delete_user_content`, `add_external_attachment`,
`add_file_attachment`, `set_attachment_visibility`, `delete_attachment`,
`reset_review_cards_for_content`) that re-check ownership and optimistic
concurrency (stale writes raise `40001` → surfaced as a conflict).

## Projected IDs

Publishing materializes owner-scoped rows in the existing `skills` /
`learning_items` tables (nullable `owner_user_id` / `content_item_id` /
`content_version_id` / `source_kind` columns; native rows stay owner-null and
behaviorally unchanged). IDs derive from the content UUID (never a mutable
title). `user-content-id.ts` is the single source of truth:

```text
user.skill.<contentId>
user.item.<contentId>
user.item.<contentId>.review.<reviewCardId>
```

Because `learning_items` is the projection target, `/learn/[itemId]` resolves a
published user lesson through the normal path with no separate resolver;
`learning-item-view.tsx` adds the `User-Created` badge for `isUserLearningItemId`
items, and `learner-resources.tsx` lists `learner_resource` attachments.

## Lesson payload (schema v1)

`LessonPayload` (`user-content-types.ts`) captures the structured editor fields.
Only `itemType`, `title`, `content`, `explanation` are mandatory to save.
`itemType` reuses `LearningItemType` (`lesson`, `concept_check`,
`multiple_choice`, `code_reading`, `bug_spotting`, `parsons`, `worked_example`,
`completion`). Optional: `difficulty`, `estimatedMinutes`, `tags`,
`learningObjectives`, `sourceNotes`, structured `sections`, `examples`, separate
`sampleCode`/`starterCode`/`referenceSolution`/`expectedOutput`/`solutionExplanation`,
and `choices`/`parsonsBlocks`/`completionBlanks` for interactive types.

### Validation

- `parseLessonPayload(unknown)` normalizes untrusted editor/AI JSON into a
  bounded `LessonPayload` (trimming, `LESSON_LIMITS`, rejecting unknown item
  types and future schema versions) or returns `ValidationIssue`s.
- `validateLessonForPublication(payload)` adds type-specific publish
  requirements: multiple choice needs ≥2 choices with ≥1 correct, parsons ≥2
  solution blocks, completion non-empty answers.

## Versioning and substantial edits

Publishing freezes an immutable `user_content_versions` snapshot and supersedes
the prior one; editing published content starts a new draft from the latest
published version. The editor shows version history and can restore any prior
version as a new draft (`restoreVersionAsDraft`, which re-saves the snapshot's
payload — history is preserved). Re-publishing an already-published lesson opens
a substantial-edit choice: **continue schedule**, **publish as a new version**,
or **reset review cards** (`reset_review_cards_for_content` resets only the
owner's FSRS cards for this lesson to a fresh `new` state — FSRS scheduling and
skill mastery stay separate).

## Attachments and Storage

External references (`url`/`github_url`/`lesson_ref`) are recorded by
`add_external_attachment`. Uploaded files/images/PDFs use a **private** Supabase
Storage bucket `user-content-attachments` (25 MiB cap, image/pdf/text MIME
allowlist). Object paths are owner-namespaced:

```text
<user-id>/<content-item-id>/<attachment-id>/<safe-filename>
```

The browser uploads bytes, then `add_file_attachment` records metadata after
re-checking ownership, the owner+content path prefix, kind, and size. Storage RLS
on `storage.objects` restricts every operation to objects whose first path
segment is the caller's uid. Downloads use short-lived **signed URLs**; there are
no public URLs. `attachment-upload.ts` holds the pure MIME/size/path helpers.

## AI authoring

The editor's assistant reuses the configured provider under
`src/features/ai-chat` (no separate selector). `POST /api/ai/author` builds a
scoped prompt (`ai-authoring-policy.ts`) from the saved draft plus author-source
attachments and returns a structured **proposal**, never overwriting fields. The
operation union (`ai-authoring-proposal.ts`) includes `replace_field`,
`append_section`, `set_objectives`, `set_tags`, `add_choice`,
`add_parsons_block`, `add_completion_blank`; the editor lists them for per-item
accept/reject (`ai-proposal-panel.tsx`). No `AI-generated` marker is stored — the
visible source stays `User-Created`.

## Answer-key separation

Answer-bearing fields — `choice.isCorrect`, Parsons `correctOrder`/`isDistractor`,
completion `answer` — live in the authoring payload for the owner/AI side only
and are never included in a pre-answer learner payload; the projection keeps the
public path answer-free, as the native learning-item path already does.

## Export package (`EXPORT_SCHEMA_VERSION = 1`)

Export produces a portable ZIP (`buildUserContentZip`, using the dependency-free
`zip.ts` store writer) containing:

- `manifest.json` — a `UserContentExport`:

  ```jsonc
  {
    "exportSchemaVersion": 1,
    "exportedAt": "<ISO-8601>",
    "item": { "id", "kind", "title", "lifecycleStatus",
              "nativeModuleId", "draftRevision", "updatedAt", "publishedAt" },
    "draftPayload": <LessonPayload | null>,
    "publishedPayload": <LessonPayload | null>,
    "markdown": "<human-readable rendering>"
  }
  ```

- `lesson.md` — the human-readable Markdown rendering (`buildLessonMarkdown`).

The manifest is self-describing (`exportSchemaVersion` guards its shape) so a
future import can consume it. Exports never include secrets, provider keys,
signed URLs, or another user's data. Binary attachments will be added to the ZIP
once import lands; external references already travel in the payload.

## Deletion

Permanent deletion of content with history asks what to do rather than silently
cascading (`delete-content-dialog.tsx` → `delete_user_content(mode)`):
`archive` (keep everything, hide from learning), `delete_editable` (keep history
and evidence for export/audit), or `delete_all` (remove content and personal
learning history, behind a second confirmation).
