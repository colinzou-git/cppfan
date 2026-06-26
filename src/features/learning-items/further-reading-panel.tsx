import { ExternalLink } from "lucide-react";
import { getResourceById } from "@/features/resources/resource-catalog";
import { getLessonResourceIds } from "@/features/resources/lesson-resource-links";

/**
 * Compact "Further reading" panel for lesson pages (#448). Resolves 1–3 curated
 * external resources from the shared `/resources` catalog via the lesson-resource
 * mapping (override → skill → prefix → domain fallback) and links out in a new
 * tab. Renders nothing when no resources map, so non-lesson or unmapped pages stay
 * clean. Opening a link is enrichment, never recorded as learning evidence.
 */
export function FurtherReadingPanel({
  itemId,
  skillIds
}: {
  itemId: string;
  skillIds: string[];
}) {
  const resources = getLessonResourceIds(itemId, skillIds)
    .map((id) => getResourceById(id))
    .filter((resource): resource is NonNullable<typeof resource> => resource !== null);

  if (resources.length === 0) return null;

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white/70 p-4"
      data-testid="further-reading"
      aria-label="Further reading"
    >
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Further reading</h2>
      <ul className="mt-2 grid gap-2">
        {resources.map((resource) => (
          <li key={resource.id}>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 rounded-xl p-2 hover:bg-slate-50"
              data-testid="further-reading-link"
            >
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-blue-700 group-hover:underline">
                    {resource.name}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    {resource.kind}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-slate-600">{resource.description}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
