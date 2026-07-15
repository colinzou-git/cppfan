import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { ExerciseEditor } from "@/features/user-content/exercise-editor";
import { getContentVersions, getExerciseForOwner } from "@/features/user-content/user-content-queries";
import { requireOwnerSession } from "@/features/user-content/require-owner";

export const dynamic = "force-dynamic";

export default async function EditExercisePage({ params }: { params: Promise<{ contentId: string }> }) {
  const { contentId } = await params;
  await requireOwnerSession(`/my-content/exercises/${contentId}/edit`);
  const detail = await getExerciseForOwner(contentId);
  if (!detail) {
    notFound();
  }
  const versions = await getContentVersions(contentId);

  return (
    <PageShell className="grid gap-6" size="reading">
      <header className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <Link href="/my-content" className="text-sm font-bold text-blue-700">← My Content</Link>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Edit exercise</h1>
        <p className="text-slate-600">Draft autosaves as you type.</p>
      </header>
      <ExerciseEditor
        initialContentId={detail.id}
        initialRevision={detail.draftRevision}
        initialPayload={detail.draftPayload ?? detail.publishedPayload}
        initialLifecycle={detail.lifecycleStatus}
        initialVersions={versions}
      />
    </PageShell>
  );
}
