import Link from "next/link";
import { Target } from "lucide-react";
import { ItemHelpLinks } from "@/components/item-help-links";
import { groupInterviewProblems } from "@/features/interview/interview-catalog-view";

export const metadata = { title: "Interview practice — cppFan" };

const DIFFICULTY_STYLE: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  hard: "bg-rose-100 text-rose-800"
};

const NAV_LINKS = [
  ["/interview/target", "Interview target →", "target-profile-link"],
  ["/interview/diagnostic", "Baseline diagnostic →", "diagnostic-link"],
  ["/interview/session", "Start a timed session →", "session-link"],
  ["/interview/mocks", "Timed mock packs →", "mock-packs-link"],
  ["/interview/rubric", "Rubric self-review →", "rubric-link"],
  ["/interview/readiness", "Readiness report →", "readiness-link"],
  ["/interview/log", "Log a practice outcome →", "evidence-log-link"],
  ["/interview/plan", "Study plan →", "plan-link"],
  ["/interview/progress", "Weekly progress →", "progress-link"]
] as const;

export default function InterviewPage() {
  const groups = groupInterviewProblems();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <Link href="/dashboard" className="text-sm font-bold text-blue-700">← Back to dashboard</Link>
        <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950">
          <Target className="h-7 w-7 text-blue-700" /> Interview practice
        </h1>
        <p className="mt-1 text-slate-600">
          A curated set of original, Google-targeted coding problems grouped by pattern. These are practice materials, not confidential or guaranteed interview questions.
        </p>
        <div className="mt-2 flex flex-wrap gap-4">
          {NAV_LINKS.map(([href, label, testId]) => (
            <Link href={href} className="text-sm font-bold text-blue-700" data-testid={testId} key={href}>{label}</Link>
          ))}
        </div>
      </header>

      <div className="grid gap-6" data-testid="interview-catalog">
        {groups.map((group) => (
          <section key={group.group} className="grid gap-3" data-testid="interview-group" data-group-id={group.group}>
            <h2 className="text-lg font-black text-slate-900">{group.label}</h2>
            <div className="grid gap-3">
              {group.problems.map((problem) => (
                <article key={problem.id} className="grid gap-2 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm" data-testid="interview-problem" data-problem-id={problem.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900">{problem.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${DIFFICULTY_STYLE[problem.difficulty] ?? "bg-slate-100 text-slate-600"}`}>{problem.difficulty}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{problem.roleRelevance}</span>
                  </div>

                  <p className="whitespace-pre-wrap text-sm text-slate-700">{problem.prompt}</p>
                  <div className="flex flex-wrap gap-1">
                    {problem.patternTags.map((tag) => <span key={tag} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-900">{tag}</span>)}
                  </div>
                  <p className="text-xs font-medium text-slate-500">Target: {problem.targetComplexity} · Constraints: {problem.constraints}</p>

                  {problem.visibleExamples.length > 0 ? (
                    <ul className="grid gap-1">
                      {problem.visibleExamples.map((example, index) => (
                        <li key={index} className="rounded-lg bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                          {example.input} → {example.output}{example.note ? <span className="text-slate-600"> ({example.note})</span> : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <ItemHelpLinks
                    context={{
                      schemaVersion: 1,
                      sourceKind: "interview_question",
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
                      assessmentState: "unanswered",
                      revealPolicy: "hint_only",
                      metadata: {
                        difficulty: problem.difficulty,
                        sessionMode: "practice"
                      }
                    }}
                  />

                  {problem.hintLadder.length > 0 ? (
                    <details>
                      <summary className="cursor-pointer text-xs font-semibold text-slate-600">Hints ({problem.hintLadder.length})</summary>
                      <ol className="ml-4 list-decimal text-xs text-slate-600">
                        {problem.hintLadder.map((hint) => <li key={hint}>{hint}</li>)}
                      </ol>
                    </details>
                  ) : null}

                  {problem.externalLinks.length > 0 ? (
                    <div className="flex flex-wrap gap-3 text-xs">
                      {problem.externalLinks.map((link) => (
                        <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 underline">{link.annotation}</a>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
