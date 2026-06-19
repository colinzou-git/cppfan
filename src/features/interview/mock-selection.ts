import { getPracticeMockPacks, type MockPack, type MockPackCategory } from "./mock-packs";

export type InterviewModePack = Omit<MockPack, "patternCoverage">;

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (const character of seed) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rank(pack: MockPack, seed: string) {
  return hashSeed(`${seed}:${pack.id}:${pack.version}`);
}

export function toInterviewModePack(pack: MockPack): InterviewModePack {
  const { patternCoverage: _hiddenPatternCoverage, ...safe } = pack;
  return safe;
}

export function selectBalancedPracticePacks(
  count: number,
  seed: string,
  recentlyCoveredPatterns: readonly string[] = []
): MockPack[] {
  const limit = Math.max(0, Math.min(count, getPracticeMockPacks().length));
  const recent = new Set(recentlyCoveredPatterns);
  const categoryOrder: MockPackCategory[] = ["core_algorithm", "ds_implementation", "cpp_debugging"];
  const selected: MockPack[] = [];
  const remaining = [...getPracticeMockPacks()];

  while (selected.length < limit && remaining.length > 0) {
    const wanted = categoryOrder[selected.length % categoryOrder.length];
    const candidates = remaining.filter((pack) => pack.category === wanted);
    const pool = candidates.length > 0 ? candidates : remaining;
    pool.sort((left, right) => {
      const leftFresh = left.patternCoverage.every((pattern) => !recent.has(pattern)) ? 0 : 1;
      const rightFresh = right.patternCoverage.every((pattern) => !recent.has(pattern)) ? 0 : 1;
      return leftFresh - rightFresh || rank(left, seed) - rank(right, seed) || left.id.localeCompare(right.id);
    });
    const chosen = pool[0];
    selected.push(chosen);
    for (const pattern of chosen.patternCoverage) recent.add(pattern);
    remaining.splice(remaining.findIndex((pack) => pack.id === chosen.id), 1);
  }

  return selected;
}
