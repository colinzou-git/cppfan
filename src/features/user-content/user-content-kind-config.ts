import {
  publishContent,
  publishExercise,
  publishInterview,
  publishLab,
  type PublishResult
} from "./user-content-actions";
import type { UserContentKind } from "./user-content-types";

/**
 * Single exhaustive dispatch contract for a user-created content kind (#606).
 *
 * My Content routing, previews, publishing, labels, and exports previously
 * distinguished only `exercise` from an implicit `lesson`, which silently sent
 * `lab` and `interview_problem` rows through the lesson editor, preview route,
 * and (worse) the lesson publish validator. This maps every kind to its own
 * route segment, publish action, user-facing label, and export filename slug so
 * the UI can dispatch without repeated ternaries. The `switch` is exhaustive
 * with a `never` guard, so adding a fifth kind is a compile error rather than a
 * silent fall-through to lesson behavior.
 */
export type UserContentKindConfig = {
  /** Route segment under /my-content for edit + preview pages. */
  routeSegment: "lessons" | "exercises" | "labs" | "interview";
  /** Lowercase singular noun for inline copy ("lesson", "interview problem"). */
  singularLabel: string;
  /** Placeholder title for an untitled row ("Untitled lab"). */
  untitledLabel: string;
  /** Slug used in the export filename: cppfan-<slug>-<id>.zip. */
  exportSlug: string;
  /** The kind-specific publish server action. */
  publish: (input: { contentId: string; expectedRevision?: number | null }) => Promise<PublishResult>;
};

export function userContentKindConfig(kind: UserContentKind): UserContentKindConfig {
  switch (kind) {
    case "lesson":
      return {
        routeSegment: "lessons",
        singularLabel: "lesson",
        untitledLabel: "Untitled lesson",
        exportSlug: "lesson",
        publish: publishContent
      };
    case "exercise":
      return {
        routeSegment: "exercises",
        singularLabel: "exercise",
        untitledLabel: "Untitled exercise",
        exportSlug: "exercise",
        publish: publishExercise
      };
    case "lab":
      return {
        routeSegment: "labs",
        singularLabel: "lab",
        untitledLabel: "Untitled lab",
        exportSlug: "lab",
        publish: publishLab
      };
    case "interview_problem":
      return {
        routeSegment: "interview",
        singularLabel: "interview problem",
        untitledLabel: "Untitled interview problem",
        exportSlug: "interview-problem",
        publish: publishInterview
      };
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unhandled user content kind: ${String(_exhaustive)}`);
    }
  }
}
