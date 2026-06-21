import { getCodeLabConfigForItem } from "./code-lab-catalog";
import { CodeLab } from "./code-lab";

/**
 * Metadata-driven Code Lab mount (#407). Render this wherever a learning item /
 * exercise / lab / interview / practice card can carry code-lab metadata. It
 * renders the shared CodeLab only when the item opts in, so no page duplicates
 * runner/editor logic.
 */
export function MaybeCodeLab({ itemId }: { itemId: string }) {
  const config = getCodeLabConfigForItem(itemId);
  if (!config) return null;
  return <CodeLab itemId={itemId} config={config} />;
}
