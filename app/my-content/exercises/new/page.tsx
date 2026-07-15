import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { ExerciseEditor } from "@/features/user-content/exercise-editor";
import { requireOwnerSession } from "@/features/user-content/require-owner";
import { getMyExerciseGroups } from "@/features/user-content/exercise-group-queries";
import { nativeExerciseGroupOptions } from "@/features/exercises/exercise-group-options";

export const dynamic = "force-dynamic";

export default async function NewExercisePage() {
  await requireOwnerSession("/my-content/exercises/new");
  const customGroups = (await getMyExerciseGroups()).map((g) => ({ id: g.id, title: g.name }));
  return (
    <PageShell className="grid gap-6" size="reading">
      <header className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <Link href="/my-content" className="text-sm font-bold text-blue-700">← My Content</Link>
        <h1 className="mt-2 text-3xl font-black text-slate-950">New exercise</h1>
        <p className="text-slate-600">Draft autosaves as you type.</p>
      </header>
      <ExerciseEditor nativeGroups={nativeExerciseGroupOptions()} customGroups={customGroups} />
    </PageShell>
  );
}
