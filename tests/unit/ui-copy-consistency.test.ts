import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// #149: learner-facing pages must present cppFan as the working app it is, with
// no scaffold/placeholder language and no completed capability described as
// future work. This source-level guard runs in `pnpm test`/CI so the stale
// wording cannot return (the landing/dashboard E2E specs assert it live).

const root = process.cwd();
const FORBIDDEN = [
  /scaffold/i,
  /placeholder/i,
  /will be implemented/i,
  /future coding/i,
  /FSRS-ready/i,
  /implementation milestones/i
];

describe("learner-facing UI copy (#149)", () => {
  for (const file of ["app/page.tsx", "app/dashboard/page.tsx"]) {
    it(`${file} has no scaffold/placeholder or future-as-available wording`, () => {
      const text = readFileSync(join(root, file), "utf8");
      for (const pattern of FORBIDDEN) {
        expect(pattern.test(text), `${file} contains stale wording matching ${pattern}`).toBe(false);
      }
    });
  }

  it("the landing page describes shipped capabilities", () => {
    const text = readFileSync(join(root, "app/page.tsx"), "utf8");
    expect(/FSRS review scheduling/i.test(text)).toBe(true);
    expect(/Open dashboard/.test(text)).toBe(true);
  });
});
