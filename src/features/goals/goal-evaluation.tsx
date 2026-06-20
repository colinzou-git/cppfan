"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  abandonGoalEvaluationAction,
  startGoalEvaluationAction,
  submitGoalEvaluationAction
} from "./evaluation-actions";
import { GOAL_EVALUATION_QUESTION_COUNT } from "./evaluation-catalog";
import { EvaluationResults } from "./evaluation-results";
import type { GoalEvaluationView } from "./evaluation-view";

export function GoalEvaluation({ initialView }: { initialView: GoalEvaluationView }) {
  const [view, setView] = useState(initialView);
  const [choiceId, setChoiceId] = useState("");
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function start() {
    setMessage(null);
    startTransition(async () => {
      const result = await startGoalEvaluationAction();
      if (result.status !== "ok") {
        setMessage(`Evaluation could not start: ${result.status.replaceAll("_", " ")}.`);
        return;
      }
      setChoiceId("");
      setView(result.view);
    });
  }

  function submit() {
    if (!choiceId || !view.sessionId) return;
    setMessage(null);
    startTransition(async () => {
      const result = await submitGoalEvaluationAction({
        sessionId: view.sessionId!,
        expectedQuestionIndex: view.questionIndex,
        submissionId,
        choiceId
      });
      if (result.status !== "ok") {
        setMessage(result.status === "stale"
          ? "This question changed in another tab. Refresh before continuing."
          : `Evaluation could not save this response: ${result.status.replaceAll("_", " ")}.`);
        return;
      }
      setMessage("Response recorded. Next question selected.");
      setChoiceId("");
      setSubmissionId(crypto.randomUUID());
      setView(result.view);
    });
  }

  function abandon() {
    if (!view.sessionId) return;
    startTransition(async () => {
      const result = await abandonGoalEvaluationAction(view.sessionId!);
      if (result.status === "ok") {
        setView(result.view);
        setChoiceId("");
        setMessage("Evaluation abandoned. You can start a fresh 30-question session later.");
      } else {
        setMessage(`Evaluation could not be abandoned: ${result.status.replaceAll("_", " ")}.`);
      }
    });
  }

  if (view.state !== "ready") {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-900">
        Evaluation is {view.state.replaceAll("_", " ")}. Existing goal and review data were not changed.
      </div>
    );
  }

  if (view.status === "completed") {
    return (
      <div className="grid gap-5" data-testid="goal-evaluation-complete">
        <div className="rounded-3xl bg-emerald-50 p-5">
          <h2 className="text-2xl font-black text-emerald-950">Evaluation complete</h2>
          <p className="mt-1 text-sm text-emerald-900">
            All {GOAL_EVALUATION_QUESTION_COUNT} responses are saved. These findings influence recommendations only; they do not mark mastery or create review cards.
          </p>
        </div>
        <EvaluationResults findings={view.findings} />
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link href="/goals">Use findings in Goals</Link></Button>
          <Button type="button" variant="secondary" onClick={start} disabled={isPending}>Retake</Button>
        </div>
      </div>
    );
  }

  if (view.status !== "active" || !view.currentQuestion) {
    return (
      <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <h2 className="text-2xl font-black text-slate-950">30-question adaptive Evaluation</h2>
        <p className="text-sm text-slate-600">
          Each next question is chosen after the previous response. It refreshes goal suggestions only and never locks content, changes mastery, or enrolls unseen review cards.
        </p>
        {message ? <p className="text-sm font-semibold text-slate-700" role="status">{message}</p> : null}
        <Button type="button" onClick={start} disabled={isPending} data-testid="goal-evaluation-start">
          {isPending ? "Starting…" : view.status === "abandoned" ? "Start a new Evaluation" : "Start Evaluation"}
        </Button>
      </div>
    );
  }

  const question = view.currentQuestion;
  return (
    <div className="grid gap-5" data-testid="goal-evaluation-active">
      <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm">
        <p className="text-sm font-black text-indigo-700" data-testid="goal-evaluation-progress">
          Question {view.questionIndex} of {GOAL_EVALUATION_QUESTION_COUNT}
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">{question.moduleTitle}</p>
        <fieldset className="mt-4 grid gap-3">
          <legend className="text-lg font-black text-slate-950">{question.prompt}</legend>
          {question.choices.map((choice) => (
            <label key={choice.id} className={`flex cursor-pointer gap-3 rounded-2xl border p-4 text-sm font-semibold ${choiceId === choice.id ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}>
              <input
                type="radio"
                name={`evaluation-${question.itemId}`}
                value={choice.id}
                checked={choiceId === choice.id}
                onChange={() => setChoiceId(choice.id)}
              />
              {choice.content}
            </label>
          ))}
        </fieldset>
      </div>

      {message ? <p className="rounded-2xl bg-slate-100 p-3 text-sm font-semibold text-slate-700" role="status">{message}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={submit} disabled={!choiceId || isPending} data-testid="goal-evaluation-submit">
          {isPending ? "Saving…" : "Submit and choose next"}
        </Button>
        <Button asChild variant="secondary"><Link href="/goals">Pause and return later</Link></Button>
        <Button type="button" variant="ghost" onClick={abandon} disabled={isPending}>Abandon</Button>
      </div>
    </div>
  );
}
