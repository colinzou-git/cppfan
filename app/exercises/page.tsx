import { createClient } from "@/lib/supabase/server";
import { ExerciseCatalogView } from "@/features/exercises/exercise-catalog-view";
import { ExercisesPageShell } from "@/features/exercises/exercises-page-shell";
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
    <ExercisesPageShell>
      <ExerciseCatalogView exercises={exercises} initialProgress={progress} authenticated={authenticated} />
    </ExercisesPageShell>
  );
}
