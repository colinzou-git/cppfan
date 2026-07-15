import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearningItemWithDetails } from "@/features/learning-items/learning-item-queries";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";
import { CodeLabWorkspace } from "@/features/code-lab/code-lab-workspace";
import { getProjectLabById } from "@/features/labs/project-labs";
import { getExerciseById } from "@/features/exercises/exercise-catalog";
import { getInterviewProblem } from "@/features/interview/problem-catalog";
import { getExerciseForOwner, getLabForOwner } from "@/features/user-content/user-content-queries";
import { exercisePayloadToCodeLabConfig } from "@/features/user-content/exercise-code-lab";
import { labMilestoneViews } from "@/features/user-content/lab-code-lab";
import { LabWorkspace } from "@/features/user-content/lab-workspace";
import { contentIdFromUserItemId, isUserLearningItemId } from "@/features/user-content/user-content-id";

/**
 * Dedicated full-page Code Lab (#431, #439, #440). Resolves lesson Code Labs,
 * write-code exercises, and project-level Project Labs. Other ids 404 so the
 * route can't be used as a generic shell. The workspace owns the wide, resizable
 * layout, so this page renders nearly full-bleed.
 */
export default async function CodeLabPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const decodedId = decodeURIComponent(itemId);

  // Published user-created exercises (#488) carry no static config; resolve the
  // learner-safe Code Lab (visible tests only) from the owner's published payload.
  if (isUserLearningItemId(decodedId)) {
    const userContentId = contentIdFromUserItemId(decodedId);
    const exercise = userContentId ? await getExerciseForOwner(userContentId) : null;
    if (exercise?.publishedPayload) {
      return (
        <main className="p-3 xl:p-6">
          <CodeLabWorkspace
            itemId={decodedId}
            title={exercise.title}
            config={exercisePayloadToCodeLabConfig(exercise.publishedPayload)}
            sourceVersion={`user-exercise:${exercise.publishedVersionId ?? "1"}`}
            contentVersionId={exercise.publishedVersionId ?? undefined}
            backHref="/my-content"
            backLabel="Back to My Content"
          />
        </main>
      );
    }
    // Published user labs (#489): a milestone navigator over one shared codebase.
    const lab = userContentId ? await getLabForOwner(userContentId) : null;
    if (lab?.publishedPayload) {
      return (
        <main className="p-3 xl:p-6">
          <LabWorkspace
            itemId={decodedId}
            title={lab.title}
            milestones={labMilestoneViews(lab.publishedPayload)}
            contentVersionId={lab.publishedVersionId ?? undefined}
            backHref="/my-content"
            backLabel="Back to My Content"
          />
        </main>
      );
    }
  }

  const config = getCodeLabConfigForItem(decodedId);
  if (!config) {
    notFound();
  }

  // Write-code exercises (#440) carry no learning_items row; resolve them from
  // the static catalog and render the workspace with an exercise-level back link.
  const exercise = getExerciseById(decodedId);
  if (exercise) {
    return (
      <main className="p-3 xl:p-6">
        <CodeLabWorkspace
          itemId={decodedId}
          title={exercise.title}
          config={config}
          sourceVersion="write-code-exercise:1"
          backHref="/exercises"
          backLabel="Back to write-code exercises"
        />
      </main>
    );
  }

  // Project labs (#439) carry no learning_items row; resolve them from the static
  // catalog and render the same workspace with project-level back link + chat.
  const project = getProjectLabById(decodedId);
  if (project) {
    return (
      <main className="p-3 xl:p-6">
        <CodeLabWorkspace
          itemId={decodedId}
          title={project.title}
          config={config}
          sourceVersion={project.version ?? "project-lab:1"}
          backHref="/labs"
          backLabel="Back to project labs"
        />
      </main>
    );
  }

  // Interview problems (#444) carry no learning_items row; resolve them from the
  // interview catalog and render the same workspace with an /interview back link,
  // so the Code button opens the full Code Lab + Debug tab.
  const interviewProblem = getInterviewProblem(decodedId);
  if (interviewProblem) {
    return (
      <main className="p-3 xl:p-6">
        <CodeLabWorkspace
          itemId={decodedId}
          title={interviewProblem.title}
          config={config}
          sourceVersion={`interview:${interviewProblem.version}`}
          backHref="/interview"
          backLabel="Back to interview practice"
        />
      </main>
    );
  }

  const result = await getLearningItemWithDetails(decodedId);

  if (result.status === "error") {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href={`/learn/${encodeURIComponent(decodedId)}`} className="text-sm font-bold text-blue-700">
          ← Back to lesson
        </Link>
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <p className="font-bold">This Code Lab is temporarily unavailable.</p>
          <p className="mt-1">We couldn’t load it from the database just now. Please refresh or try again shortly.</p>
        </div>
      </main>
    );
  }

  const title = result.status === "ok" ? result.data.item.title : "Code Lab";
  const sourceVersion = result.status === "ok" ? result.data.item.updated_at ?? "1" : "1";

  return (
    <main className="p-3 xl:p-6">
      <CodeLabWorkspace
        itemId={decodedId}
        title={title}
        config={config}
        sourceVersion={sourceVersion}
      />
    </main>
  );
}
