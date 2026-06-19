import Link from "next/link";
import { redirect } from "next/navigation";
import { GoalEvaluation } from "@/features/goals/goal-evaluation";
import { getGoalEvaluationView } from "@/features/goals/evaluation-session-query";

export const metadata = { title: "Goal Evaluation — cppFan" };

export default async function GoalEvaluationPage() {
  const view = await getGoalEvaluationView();
  if (view.state === "signed_out") redirect("/login?next=/goals/evaluation");

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-3xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <Link href="/goals" className="text-sm font-bold text-blue-700">← Goals</Link>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Goal Evaluation</h1>
        <p className="mt-1 text-sm text-slate-600">
          An optional, low-stakes, 30-question adaptive diagnostic for better goal recommendations.
        </p>
      </header>
      <GoalEvaluation initialView={view} />
    </main>
  );
}
