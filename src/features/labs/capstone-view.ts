// Pure view model for the capstone tracks UI (#129/#130). Resolves each track's
// structured projects (those with milestones) to their project-labs title/summary,
// in track + project order. DB-independent and unit-testable.
import { capstoneProjects, getCapstoneTracks, type CapstoneMilestone } from "./capstone-tracks";
import { projectLabs } from "./project-labs";
import { skillSeed } from "@/features/skills/skill-seed";

export type CapstoneProjectView = {
  id: string;
  title: string;
  summary: string;
  prerequisiteSkillIds: string[];
  /** Human-readable prerequisite skill titles (recommendations, not locks). */
  prerequisiteTitles: string[];
  milestones: CapstoneMilestone[];
};

export type CapstoneTrackView = {
  id: string;
  title: string;
  summary: string;
  projects: CapstoneProjectView[];
};

/**
 * The learner's next incomplete REQUIRED milestone, in track/project/milestone
 * order, or null when all required milestones are done. Used to suggest the next
 * capstone milestone in the daily plan (#130). Pure.
 */
export function nextCapstoneMilestone(
  view: CapstoneTrackView[],
  completedMilestoneIds: Set<string>
): { milestoneId: string; title: string; projectTitle: string } | null {
  for (const track of view) {
    for (const project of track.projects) {
      for (const milestone of project.milestones) {
        if (milestone.required && !completedMilestoneIds.has(milestone.id)) {
          return { milestoneId: milestone.id, title: milestone.title, projectTitle: project.title };
        }
      }
    }
  }
  return null;
}

/** Tracks with their structured (milestone-bearing) projects, in display order. */
export function buildCapstoneTrackView(): CapstoneTrackView[] {
  const labById = new Map(projectLabs.map((lab) => [lab.id, lab]));
  const projectById = new Map(capstoneProjects.map((project) => [project.id, project]));
  const skillTitleById = new Map(skillSeed.map((skill) => [skill.id, skill.title]));

  return getCapstoneTracks()
    .map((track) => {
      const projects = track.projectIds
        .map((projectId): CapstoneProjectView | null => {
          const project = projectById.get(projectId);
          const lab = labById.get(projectId);
          if (!project || !lab) {
            return null;
          }
          return {
            id: projectId,
            title: lab.title,
            summary: lab.summary,
            prerequisiteSkillIds: project.prerequisiteSkillIds,
            prerequisiteTitles: project.prerequisiteSkillIds.map(
              (skillId) => skillTitleById.get(skillId) ?? skillId
            ),
            milestones: project.milestones
          };
        })
        .filter((project): project is CapstoneProjectView => project !== null);

      return { id: track.id, title: track.title, summary: track.summary, projects };
    })
    .filter((track) => track.projects.length > 0);
}
