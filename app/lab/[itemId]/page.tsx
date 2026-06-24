import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearningItemWithDetails } from "@/features/learning-items/learning-item-queries";
import { getCodeLabConfigForItem } from "@/features/code-lab/code-lab-catalog";
import { CodeLabWorkspace } from "@/features/code-lab/code-lab-workspace";
import { getProjectLabById } from "@/features/labs/project-labs";
import { getExerciseById } from "@/features/exercises/exercise-catalog";

/**
 * Dedicated full-page Code Lab (#431, #439, #440). Resolves lesson Code Labs,
 * write-code exercises, and project-level Project Labs. Other ids 404 so the
 * route can't be used as a generic shell. The workspace owns the wide, resizable
 * layout, so this page renders nearly full-bleed.
 */
export default async function CodeLabPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const decodedId = decodeURIComponent(itemId);

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
