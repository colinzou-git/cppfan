"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemHelpLinks } from "@/components/item-help-links";
import type { AiChatContext } from "@/features/ai-chat/ai-chat-types";
import type { ProjectDifficulty } from "./project-labs";
import type { ProjectProgressStatus } from "./project-progress";
import { markProjectComplete } from "./project-actions";

export type ProjectCardData = {
  id: string;
  title: string;
  summary: string;
  difficulty?: ProjectDifficulty;
  focus?: string[];
  prerequisiteTitles?: string[];
  milestones: string[];
  sourceVersion?: string;
};

/**
 * Unified Project Labs card (#439). Every project — capstone-track or flat —
 * renders the same simplified card: title, summary, tags, milestones as plain
 * text guidance, and exactly four project-level actions (Code, AI Chat, Chat
 * history, Mark complete). It never renders milestone-level actions, milestone
 * code previews, "Mark started", or reflection textareas. Code always opens the
 * single project codebase at /lab/<projectId>.
 */
export function ProjectCard({
  project,
  completionStatus
}: {
  project: ProjectCardData;
  completionStatus?: ProjectProgressStatus;
}) {
  const [status, setStatus] = useState<ProjectProgressStatus>(completionStatus ?? "not_started");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const context: AiChatContext = {
    schemaVersion: 1,
    sourceKind: "project_lab",
    sourceId: project.id,
    sourceVersion: project.sourceVersion ?? "1",
    title: project.title,
    prompt: project.summary,
    topic: project.focus && project.focus.length > 0 ? project.focus.join(", ") : undefined,
    instructions: project.milestones,
    assessmentState: "instructional",
    revealPolicy: "normal",
    metadata: {
      difficulty: project.difficulty ?? null,
      milestoneCount: project.milestones.length
    }
  };

  function onMarkComplete() {
    setNotice(null);
    startTransition(async () => {
      const result = await markProjectComplete({ projectId: project.id });
      if (result.status === "ok") {
        setStatus("completed");
      } else if (result.status === "signed_out") {
        setNotice("Sign in to save project progress.");
      } else if (result.status === "unavailable") {
        setNotice("Progress saving is temporarily unavailable. Please try again soon.");
      } else {
        setNotice("Could not save that just now. Please try again.");
      }
    });
  }

  return (
    <article
      className="grid min-w-0 gap-3 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur"
      data-testid="project-lab"
      data-project-id={project.id}
    >
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {project.difficulty ? (
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
              {project.difficulty}
            </span>
          ) : null}
          {status === "completed" ? (
            <span
              className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800"
              data-testid="project-completed-badge"
            >
              Completed
            </span>
          ) : null}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{project.title}</h3>
        <p className="text-sm text-slate-600">{project.summary}</p>
        {project.prerequisiteTitles && project.prerequisiteTitles.length > 0 ? (
          <p className="text-xs font-medium text-slate-500">
            Recommended first: {project.prerequisiteTitles.join(", ")}
          </p>
        ) : null}
      </div>

      {project.focus && project.focus.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {project.focus.map((tag) => (
            <span key={tag} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-900">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <ol className="grid list-decimal gap-1 pl-5 text-sm text-slate-700">
        {project.milestones.map((milestone) => (
          <li key={milestone} data-testid="project-milestone">
            {milestone}
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild data-testid="project-code">
          <Link href={`/lab/${encodeURIComponent(project.id)}`}>
            <Code2 className="h-4 w-4" aria-hidden="true" />
            Code
          </Link>
        </Button>
        <ItemHelpLinks context={context} />
        <Button
          type="button"
          variant="secondary"
          onClick={onMarkComplete}
          disabled={pending || status === "completed"}
          data-testid="project-mark-complete"
        >
          {status === "completed" ? "Completed" : "Mark complete"}
        </Button>
      </div>

      {notice ? (
        <p className="text-xs font-semibold text-amber-700" role="alert" data-testid="project-notice">
          {notice}
        </p>
      ) : null}
    </article>
  );
}
