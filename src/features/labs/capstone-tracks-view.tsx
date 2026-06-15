"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setMilestone } from "./capstone-actions";
import type { CapstoneTrackView } from "./capstone-view";
import type { MilestoneProgress, MilestoneStatus } from "./milestone-progress";

type ProgressEntry = { status: MilestoneStatus; reflection: string | null };

const STATUS_LABEL: Record<MilestoneStatus | "none", string> = {
  none: "Not started",
  started: "In progress",
  completed: "Completed"
};

export function CapstoneTracksView({
  tracks,
  initialProgress,
  authenticated
}: {
  tracks: CapstoneTrackView[];
  initialProgress: MilestoneProgress[];
  authenticated: boolean;
}) {
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>(() =>
    Object.fromEntries(
      initialProgress.map((p) => [p.milestone_id, { status: p.status, reflection: p.reflection }])
    )
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const draftFor = (id: string) => drafts[id] ?? progress[id]?.reflection ?? "";

  function apply(milestoneId: string, status: MilestoneStatus, reflection: string | null) {
    setNotice(null);
    setPendingId(milestoneId);
    startTransition(async () => {
      const result = await setMilestone({ milestoneId, status, reflection });
      setPendingId(null);
      if (result.status === "ok") {
        setProgress((prev) => ({ ...prev, [milestoneId]: { status, reflection } }));
      } else if (result.status === "signed_out") {
        setNotice("Sign in to save your capstone progress.");
      } else {
        setNotice("Could not save that just now. Please try again.");
      }
    });
  }

  const totalMilestones = useMemo(
    () => tracks.reduce((n, t) => n + t.projects.reduce((m, p) => m + p.milestones.length, 0), 0),
    [tracks]
  );
  const completedCount = Object.values(progress).filter((p) => p.status === "completed").length;

  return (
    <section className="grid gap-5" data-testid="capstone-tracks" aria-label="Capstone tracks">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-black text-slate-900">Capstone tracks</h2>
        <span className="text-xs font-semibold text-slate-500" data-testid="capstone-progress-count">
          {completedCount} / {totalMilestones} milestones done
        </span>
      </div>
      <p className="text-sm text-slate-600">
        Sequenced projects with individually-trackable milestones. Prerequisites are recommendations,
        not locks — start any project whenever you like.
      </p>

      {notice ? (
        <p className="text-sm font-semibold text-amber-700" role="alert" data-testid="capstone-notice">
          {notice}
        </p>
      ) : null}

      {tracks.map((track) => (
        <div key={track.id} className="grid gap-3" data-testid="capstone-track" data-track-id={track.id}>
          <div>
            <h3 className="text-base font-bold text-slate-800">{track.title}</h3>
            <p className="text-sm text-slate-600">{track.summary}</p>
          </div>

          {track.projects.map((project) => (
            <article
              key={project.id}
              className="grid gap-3 rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm"
              data-testid="capstone-project"
              data-project-id={project.id}
            >
              <div>
                <h4 className="font-bold text-slate-900">{project.title}</h4>
                <p className="text-sm text-slate-600">{project.summary}</p>
                {project.prerequisiteTitles.length > 0 ? (
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Recommended first: {project.prerequisiteTitles.join(", ")}
                  </p>
                ) : null}
              </div>

              <ol className="grid gap-3">
                {project.milestones.map((milestone, index) => {
                  const entry = progress[milestone.id] as ProgressEntry | undefined;
                  const status: MilestoneStatus | "none" = entry ? entry.status : "none";
                  const isPending = pendingId === milestone.id;
                  return (
                    <li
                      key={milestone.id}
                      className="grid gap-2 rounded-xl border border-slate-200 px-3 py-3"
                      data-testid="capstone-milestone"
                      data-milestone-id={milestone.id}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          M{index + 1}. {milestone.title}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {milestone.required ? "Required" : "Optional"}
                        </span>
                        <span className="text-xs font-medium text-slate-400">~{milestone.estimatedMinutes} min</span>
                        <span
                          className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${
                            status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : status === "started"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-600"
                          }`}
                          data-testid="capstone-milestone-status"
                        >
                          {STATUS_LABEL[status]}
                        </span>
                      </div>

                      <p className="text-xs italic text-slate-500">Reflect: {milestone.reflectionPrompt}</p>
                      {milestone.extensionTask ? (
                        <p className="text-xs font-medium text-slate-500">Stretch: {milestone.extensionTask}</p>
                      ) : null}

                      {status !== "none" ? (
                        <textarea
                          className="min-h-[3rem] rounded-lg border border-slate-200 px-2 py-1 text-sm"
                          placeholder="Your reflection (optional)"
                          aria-label={`Reflection for ${milestone.title}`}
                          value={draftFor(milestone.id)}
                          readOnly={status === "completed"}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [milestone.id]: e.target.value }))}
                          data-testid="capstone-reflection"
                        />
                      ) : null}

                      <div className="flex flex-wrap gap-2">
                        {status === "none" ? (
                          <Button
                            type="button"
                            onClick={() => apply(milestone.id, "started", null)}
                            disabled={isPending}
                            data-testid="capstone-milestone-start"
                          >
                            Mark started
                          </Button>
                        ) : null}
                        {status === "started" ? (
                          <Button
                            type="button"
                            onClick={() => apply(milestone.id, "completed", draftFor(milestone.id) || null)}
                            disabled={isPending}
                            data-testid="capstone-milestone-complete"
                          >
                            Mark complete
                          </Button>
                        ) : null}
                        {status === "completed" ? (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => apply(milestone.id, "started", progress[milestone.id]?.reflection ?? null)}
                            disabled={isPending}
                            data-testid="capstone-milestone-reopen"
                          >
                            Reopen
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </article>
          ))}
        </div>
      ))}

      {!authenticated ? (
        <p className="text-xs font-medium text-slate-500">Sign in to save milestone progress across sessions.</p>
      ) : null}
    </section>
  );
}
