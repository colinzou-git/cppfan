import type { PublicLearningItemChoice } from "./learning-item-types";

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Display choices in a stable pseudo-random order without using the answer key.
 *
 * The curriculum seed and SQL migrations intentionally keep answer rows easy to
 * audit, which often means the correct choice is first. Learner-facing quiz,
 * placement, evaluation, and review surfaces must not preserve that authoring
 * order because it leaks a pattern. The original ids are preserved, so all
 * server-side grading and stored answers keep working.
 */
export function orderPublicChoices(
  choices: PublicLearningItemChoice[],
  seed: string
): PublicLearningItemChoice[] {
  if (choices.length < 2) return choices.slice();

  const ordered = choices
    .map((choice, index) => ({
      choice,
      index,
      score: stableHash(`${seed}:${choice.id}:${choice.content}:${index}`)
    }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((entry) => entry.choice);

  // Avoid preserving the original first option. In the seed/database content the
  // original first row is often the correct answer, so this closes the most
  // obvious answer-position leak even in the rare case where the hash puts it
  // back first.
  if (ordered[0]?.id === choices[0]?.id) {
    ordered.push(ordered.shift()!);
  }

  return ordered;
}
