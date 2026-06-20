import { ItemHelpLinks } from "@/components/item-help-links";
import type { CapstoneTrackView } from "./capstone-view";

export function CapstoneHelp({ tracks }: { tracks: CapstoneTrackView[] }) {
  return (
    <section className="grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4" aria-label="Capstone milestone AI help">
      <div>
        <h2 className="text-lg font-black text-slate-900">AI help for capstone milestones</h2>
        <p className="text-sm text-slate-600">Each milestone has its own saved conversation history.</p>
      </div>
      {tracks.flatMap((track) =>
        track.projects.flatMap((project) =>
          project.milestones.map((milestone) => (
            <article key={milestone.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white bg-white/90 p-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{project.title}: {milestone.title}</p>
                <p className="text-xs text-slate-500">{track.title}</p>
              </div>
              <ItemHelpLinks
                context={{
                  schemaVersion: 1,
                  sourceKind: "capstone_milestone",
                  sourceId: milestone.id,
                  sourceVersion: "1",
                  title: `${project.title}: ${milestone.title}`,
                  prompt: project.summary,
                  topic: track.title,
                  instructions: [
                    milestone.reflectionPrompt,
                    ...(milestone.extensionTask ? [`Optional extension: ${milestone.extensionTask}`] : [])
                  ],
                  assessmentState: "instructional",
                  revealPolicy: "normal",
                  metadata: {
                    projectId: project.id,
                    required: milestone.required,
                    estimatedMinutes: milestone.estimatedMinutes
                  }
                }}
              />
            </article>
          ))
        )
      )}
    </section>
  );
}
