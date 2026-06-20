import Link from "next/link";
import { ItemHelpLinks } from "@/components/item-help-links";
import { createClient } from "@/lib/supabase/server";
import { getInterviewProblem, getInterviewProblems } from "@/features/interview/problem-catalog";
import { getCurrentSession } from "@/features/interview/interview-session-store";
import { createSession, type SessionState } from "@/features/interview/session-machine";
import { SessionRunner } from "@/features/interview/session-runner";
import { FollowUpDrill } from "@/features/interview/follow-up-drill";

export const metadata = {
  title: "Interview session — cppFan"
};

export default async function InterviewSessionPage() {
  const saved = await getCurrentSession();

  // Resume the saved session, or start a fresh practice session on the first
  // catalog problem.
  const problems = getInterviewProblems();
  const fallbackProblemId = problems[0]?.id ?? "";
  const state: SessionState =
    saved ?? createSession({ problemId: fallbackProblemId, mode: "practice", durationMinutes: 45 });

  const problem = getInterviewProblem(state.problemId) ?? problems[0] ?? null;

  let authenticated = false;
  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    authenticated = Boolean(user);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="grid gap-1">
        <Link href="/interview" className="text-sm font-bold text-blue-700">
          ← Interview practice
        </Link>
        <h1 className="text-2xl font-black text-slate-900">Timed session</h1>
        <p className="text-sm text-slate-600">
          Move through the interview phases at your own pace. Practice mode lets you step back; an
          interview run is forward-only and keeps the solution hidden until the end.
        </p>
      </header>

      {problem ? (
        <>
          <ItemHelpLinks
            context={{
              schemaVersion: 1,
              sourceKind: "timed_interview_question",
              sourceId: problem.id,
              sourceVersion: String(problem.version),
              title: problem.title,
              prompt: problem.prompt,
              topic: problem.patternTags.join(", "),
              instructions: [
                `Constraints: ${problem.constraints}`,
                `Target complexity: ${problem.targetComplexity}`,
                ...problem.requiredEdgeCases.map((edgeCase) => `Edge case to consider: ${edgeCase}`),
                ...problem.visibleExamples.map((example) => `Visible example: ${example.input} → ${example.output}`)
              ],
              assessmentState: "timed",
              revealPolicy: "interviewer",
              metadata: {
                difficulty: problem.difficulty,
                sessionMode: state.mode,
                sessionStatus: state.phase,
                durationMinutes: state.durationMinutes
              }
            }}
          />
          <SessionRunner
            initialState={state}
            problemTitle={problem.title}
            problemPrompt={problem.prompt}
            authenticated={authenticated}
          />
          <FollowUpDrill problemId={state.problemId} durationMinutes={state.durationMinutes} />
        </>
      ) : (
        <p className="text-sm text-slate-600">No interview problems are available.</p>
      )}
    </main>
  );
}
