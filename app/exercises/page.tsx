import Link from "next/link";
import { Code2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { createClient } from "@/lib/supabase/server";
import { ExerciseCatalogView } from "@/features/exercises/exercise-catalog-view";
import { buildExerciseCatalogView } from "@/features/exercises/exercise-view";
import { getExerciseProgressForUser } from "@/features/exercises/exercise-progress";

export const metadata = {
  title: "Write-code exercises — cppFan"
};

export default async function ExercisesPage() {
  const exercises = buildExerciseCatalogView();
  const progress = await getExerciseProgressForUser();

  let authenticated = false;
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    authenticated = Boolean(user);
  }

  return (
    <PageShell className="grid gap-6" size="wide">
      <header>
        <Link href="/dashboard" className="text-sm font-bold text-blue-700">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <Code2 className="h-7 w-7 text-blue-700" />
          Write-code exercises
        </h1>
      </header>

      <ExerciseCatalogView exercises={exercises} initialProgress={progress} authenticated={authenticated} />
    </PageShell>
  );
}
