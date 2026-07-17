import Link from "next/link";
import { ItemHelpLinks } from "@/components/item-help-links";
import { createClient } from "@/lib/supabase/server";
import { getInterviewProblems } from "@/features/interview/problem-catalog";
import { resolveInterviewProblemRef } from "@/features/interview/interview-problem-resolver";
import { getCurrentSession, saveCurrentSession } from "@/features/interview/interview-session-store";
import { getJudgeIoDescription } from "@/features/interview/judge-test-suites";
import { resolveSessionWithFallback } from "@/features/interview/session-fallback";
import { currentPhase } from "@/features/interview/session-machine";
import { SessionRunner } from "@/features/interview/session-runner";
import { FollowUpDrill } from "@/features/interview/follow-up-drill";

export const metadata = {
  title: "Interview session — cppFan"
};

export default async function InterviewSessionPage({
  searchParams
}: {
  searchParams: Promise<{ problem?: string | string[] }>;
}) {
  const saved = await getCurrentSession();

  // A `?problem=<id>` entry point (from the catalog Code button, #431) starts a
  // fresh session on that problem unless the saved session is already on it.
  const requested = await searchParams;
  const requestedId = typeof requested.problem === "string" ? requested.problem : undefined;
  // Resolve native OR the owner's published user problem (#490).
  const requestedProblem = requestedId ? await resolveInterviewProblemRef(requestedId) : null;

  // Resume the saved session, or start a fresh practice session on the requested
  // (or first) catalog problem. If the chosen problem no longer resolves (a saved
  // user problem was archived/deleted/unpublished), start a FRESH session on the
  // fallback problem so the runner, draft, judge, and follow-up never act on a
  // stale id behind a different displayed problem (#608 Problem B).
  const problems = getInterviewProblems();
  const fallbackProblemId = problems[0]?.id ?? "";
  const { state, problem, staleReplaced } = await resolveSessionWithFallback({
    saved,
    requestedProblem,
    fallbackProblemId,
    durationMinutes: 45,
    resolve: resolveInterviewProblemRef
  });
  if (staleReplaced) {
    // Persist the replacement so the stale session does not resurface.
    await saveCurrentSession(state).catch(() => "error");
  }
  const judgeIoDescription = problem ? getJudgeIoDescription(problem.id) : null;

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
          {staleReplaced ? (
            <div
              className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800"
              role="status"
              data-testid="session-stale-replaced"
            >
              The previous problem is no longer available; a new session was started.
            </div>
          ) : null}
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
                ...(judgeIoDescription ? [`Executable contract: ${judgeIoDescription}`] : []),
                ...problem.requiredEdgeCases.map((edgeCase) => `Edge case to consider: ${edgeCase}`),
                ...problem.visibleExamples.map((example) => `Visible example: ${example.input} → ${example.output}`)
              ],
              assessmentState: "timed",
              revealPolicy: "interviewer",
              metadata: {
                difficulty: problem.difficulty,
                sessionMode: state.mode,
                sessionStatus: `${state.status}:${currentPhase(state)}`,
                durationMinutes: state.durationMinutes
              }
            }}
          />
          {judgeIoDescription ? (
            <section
              className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4"
              aria-labelledby="judge-io-heading"
              data-testid="judge-io-contract"
            >
              <h2 id="judge-io-heading" className="text-sm font-black text-blue-950">
                Executable input/output contract
              </h2>
              <p className="mt-1 whitespace-pre-wrap font-mono text-xs leading-5 text-blue-950">
                {judgeIoDescription}
              </p>
            </section>
          ) : null}
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
