# User-Created Content

Status: **#487 Phase 1 — foundation in progress.** This document tracks the
private user-created content model. This first slice adds the pure, DB-free
foundation (types, ID scheme, payload validation); persistence, RLS, projection,
editor UI, AI authoring, and the learning-loop integration land in later slices.

## Concepts

- **Kinds** (`UserContentKind`): `lesson`, `exercise`, `lab`, `interview_problem`.
  Phase 1 exposes only `lesson`; the union is ready for the later phases.
- **Lifecycle** (`UserContentLifecycle`): `draft` → `published` → `archived`.
  `Save` writes a draft; publishing is a separate explicit action.
- **Source** (`ContentSource`): `native` or `user`. The exact visible labels are
  `Native cppFan` and `User-Created` (`SOURCE_LABELS`), shown everywhere the item
  appears.
- **Attachment visibility** (`AttachmentVisibility`): `author_source` (default;
  visible to the owner/AI only) or `learner_resource` (shown on the learner page).

All content is private to its owner in this release.

## Projected IDs

Published user content materializes as owner-scoped rows in the existing
`skills` / `learning_items` tables, keyed by IDs derived from the content item's
UUID (never from a mutable title). `user-content-id.ts` is the single source of
truth:

```text
user.skill.<contentId>
user.item.<contentId>
user.item.<contentId>.review.<reviewCardId>
```

Helpers: `userSkillId`, `userLearningItemId`, `userReviewItemId`, the `isUser*`
guards, and the `contentIdFrom*` / `reviewCardIdFromUserItemId` parsers.

## Lesson payload (schema v1)

`LessonPayload` (in `user-content-types.ts`) captures the structured editor
fields. Only `itemType`, `title`, `content`, and `explanation` are mandatory to
save. `itemType` reuses the app's `LearningItemType`
(`lesson`, `concept_check`, `multiple_choice`, `code_reading`, `bug_spotting`,
`parsons`, `worked_example`, `completion`).

Optional fields: `difficulty`, `estimatedMinutes`, `tags`, `learningObjectives`,
`sourceNotes`, structured `sections` (introduction, syntax, examples, common
mistakes, best practices, practice, summary, further reading), `examples`, and
separate `sampleCode` / `starterCode` / `referenceSolution` / `expectedOutput` /
`solutionExplanation` code fields. Interactive types add `choices`,
`parsonsBlocks`, or `completionBlanks`.

### Validation

- `parseLessonPayload(unknown)` normalizes untrusted editor/AI JSON into a
  bounded `LessonPayload` (trimming strings, enforcing the length/array limits in
  `LESSON_LIMITS`, rejecting unknown item types and future schema versions) or
  returns a list of `ValidationIssue`s.
- `validateLessonForPublication(payload)` adds the type-specific requirements
  that only matter when publishing a graded item: multiple choice needs ≥2
  choices with ≥1 correct, parsons needs ≥2 solution blocks, completion needs
  blanks with non-empty answers. An empty result means the lesson is publishable.

## Answer-key separation

Answer-bearing fields — `choice.isCorrect`, Parsons `correctOrder` /
`isDistractor`, and completion `answer` — live in the authoring payload for the
owner/AI side only. They must never be included in a pre-answer learner payload;
the later projection/resolver slices keep the public projection answer-free (as
the native learning-item path already does).
