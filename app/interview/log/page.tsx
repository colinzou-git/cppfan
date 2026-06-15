import Link from "next/link";
import { NotebookPen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getInterviewProblems } from "@/features/interview/problem-catalog";
import { EvidenceLog, type EvidenceProblemOption } from "@/features/interview/evidence-log";

export const metadata = {
  title: "Log interview practice — cppFan"
};

export default async function InterviewLogPage() {
  const problems: EvidenceProblemOption[] = getInterviewProblems().map((problem) => ({
    id: problem.id,
    title: problem.title,
    group: problem.group
  }));

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
          <NotebookPen className="h-7 w-7 text-blue-700" />
          Log a practice outcome
        </h1>
        <p className="mt-1 text-slate-600">
          After working a problem, record how it went. This builds the evidence your{" "}
          <Link href="/interview/readiness" className="font-bold text-blue-700">
            readiness report
          </Link>{" "}
          uses — recovery and transfer to unseen problems, not how many problems you have done.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm">
        <EvidenceLog problems={problems} authenticated={authenticated} />
      </section>
    </main>
  );
}
