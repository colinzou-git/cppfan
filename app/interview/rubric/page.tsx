import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAllRubricScores } from "@/features/interview/rubric-store";
import { RubricReview } from "@/features/interview/rubric-review";

export const metadata = {
  title: "Interview rubric review — cppFan"
};

export default async function InterviewRubricPage() {
  const initialScores = await getAllRubricScores();

  let authenticated = false;
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    authenticated = Boolean(user);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <Link href="/interview" className="text-sm font-bold text-blue-700">
          ← Interview practice
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <ClipboardCheck className="h-7 w-7 text-blue-700" />
          Rubric review
        </h1>
        <p className="mt-1 text-slate-600">
          After a session, score each interview dimension separately (0-4) as yourself or a peer
          interviewer. Automated judge/session evidence is shown read-only alongside. You get a
          per-dimension heat map, category averages, and focused remediation — not a single pass/fail.
        </p>
      </header>

      <RubricReview initialScores={initialScores} authenticated={authenticated} />
    </main>
  );
}
