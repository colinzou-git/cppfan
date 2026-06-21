import type { PublicLearningItemChoice } from "./learning-item-types";

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function usesAuthoringFirstSuffix(choice: PublicLearningItemChoice | undefined) {
  return Boolean(choice?.id.endsWith(".a"));
}

/**
 * Display choices in a stable pseudo-random order without using hidden grading
 * data. The original ids are preserved, so server-side grading and saved answers
 * keep working.
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

  while (ordered.length > 1 && (ordered[0]?.id === choices[0]?.id || usesAuthoringFirstSuffix(ordered[0]))) {
    ordered.push(ordered.shift()!);
  }

  return ordered;
}
