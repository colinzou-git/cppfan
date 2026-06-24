"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { CapstoneTrackView } from "./capstone-view";
import { getProjectLabById } from "./project-labs";
import { ProjectCard, type ProjectCardData } from "./project-card";
import type { ProjectProgress, ProjectProgressStatus } from "./project-progress";

/**
 * Capstone tracks (#129/#130, simplified for #439). Tracks keep their title and
 * summary; each project renders as the same unified ProjectCard used by the flat
 * project list — milestones are plain-text guidance and the only actions are the
 * project-level Code / AI Chat / Chat history / Mark complete. No milestone-level
 * code, "Mark started", reflection textareas, or per-milestone progress remain.
 */
export function CapstoneTracksView({
  tracks,
  projectProgress,
  authenticated,
  linkToTrack = true
}: {
  tracks: CapstoneTrackView[];
  /** Project-level completion rows for the signed-in learner. */
  projectProgress?: ProjectProgress[];
  authenticated: boolean;
  /** Show a per-track link to its overview page (off on the track page itself). */
  linkToTrack?: boolean;
}) {
  const statusByProject = useMemo(() => {
    const map = new Map<string, ProjectProgressStatus>();
    for (const row of projectProgress ?? []) {
      map.set(row.project_id, row.status);
    }
    return map;
  }, [projectProgress]);

  return (
    <section className="grid gap-5" data-testid="capstone-tracks" aria-label="Capstone tracks">
      <div>
        <h2 className="text-xl font-black text-slate-900">Capstone tracks</h2>
        <p className="mt-1 text-sm text-slate-600">
          Sequenced projects that build on each other. Prerequisites are recommendations, not locks —
          start any project whenever you like. Each project is one codebase; milestones are checkpoints
          inside it.
        </p>
      </div>

      {tracks.map((track) => (
        <div key={track.id} className="grid gap-3" data-testid="capstone-track" data-track-id={track.id}>
          <div>
            <h3 className="text-base font-bold text-slate-800">{track.title}</h3>
            <p className="text-sm text-slate-600">{track.summary}</p>
            {linkToTrack ? (
              <Link
                href={`/labs/tracks/${encodeURIComponent(track.id)}`}
                className="text-sm font-bold text-blue-700"
                data-testid="capstone-track-link"
              >
                View track →
              </Link>
            ) : null}
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {track.projects.map((project) => {
              const lab = getProjectLabById(project.id);
              const card: ProjectCardData = {
                id: project.id,
                title: project.title,
                summary: project.summary,
                difficulty: lab?.difficulty,
                focus: lab?.focus,
                prerequisiteTitles: project.prerequisiteTitles,
                milestones: project.milestones.map((milestone) => milestone.title),
                sourceVersion: lab?.version
              };
              return (
                <ProjectCard
                  key={project.id}
                  project={card}
                  completionStatus={statusByProject.get(project.id)}
                />
              );
            })}
          </div>
        </div>
      ))}

      {!authenticated ? (
        <p className="text-xs font-medium text-slate-500">Sign in to save project progress across sessions.</p>
      ) : null}
    </section>
  );
}
