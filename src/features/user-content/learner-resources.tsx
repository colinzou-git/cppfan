import { getLearnerResourceAttachments } from "./user-content-queries";
import { contentIdFromUserItemId } from "./user-content-id";

/**
 * Learner-visible attachments on a published user lesson (#487). Renders nothing
 * for native items or when the lesson exposes no learner_resource files. Links
 * use short-lived signed URLs; author-only source material never appears here.
 */
export async function LearnerResources({ itemId }: { itemId: string }) {
  const contentId = contentIdFromUserItemId(itemId);
  if (!contentId) {
    return null;
  }
  const resources = await getLearnerResourceAttachments(contentId);
  if (resources.length === 0) {
    return null;
  }
  return (
    <section className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm" data-testid="learner-resources">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Resources</h2>
      <ul className="mt-2 grid gap-1.5">
        {resources.map((resource) => (
          <li key={resource.id}>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-blue-700 hover:underline"
            >
              {resource.filename || "Download"} <span className="font-normal text-slate-400">· {resource.kind}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
