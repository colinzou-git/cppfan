# Content expansion plan

Decision record for the next practice-content slices (issue #51). Each slice is
sized for **one focused PR**, following `docs/QUESTION_FAMILIES.md` and the
established migration ↔ seed lockstep.

## Current coverage (C++)

| Module | Skills | Status |
|---|---|---|
| `cpp.structs_classes` | syntax, public/private, const methods, invariants | items seeded |
| `cpp.constructors` | default, parameterized, init list, destructor | items seeded |
| `cpp.raii` | resource lifetime, destructor cleanup, exception safety, ownership boundary | items seeded |
| `cpp.smart_pointers` | unique/shared/weak, cyclic, ownership choice, ownership transfer | items seeded |

The four foundational C++ ownership modules are covered (2+ items per skill).

## Ordered next slices

1. **STL sequence containers** (`cpp.stl.*` — first slice of issue #46): `vector`
   and `string`. ~2 skills × 2 items. Unblocks most DSA practice.
2. **STL associative containers**: `map`/`unordered_map`, `set`. ~2 skills × 2 items.
3. **STL algorithms + iterators**: `sort`/`find`/`accumulate`, range-based loops,
   small lambdas. ~2–3 skills.
4. **DSA arrays & strings** (first slice of issue #48, `dsa.arrays.*`): indexing,
   traversal, two-pointers. Connects C++ STL to algorithmic practice.
5. **DSA sorting & searching**: binary search, comparator-based sorting.

## Sizing rule

Keep each slice to one module/skill-group (≈2 skills, ≈4 items) per PR. Deepen a
skill with more of the question family only after every skill in a module has its
first pass, so coverage stays even.

## Item-variety gaps to revisit

Once breadth is in place, the highest-value depth additions are `code_reading` and
`bug_spotting` items for the constructors and RAII modules, which currently lean on
lessons and multiple-choice.

## Skill-map integrity rule (#97)

Coverage is enforced automatically by `tests/unit/skill-map-integrity.test.ts`,
which derives expectations from the **active skill seed** — there is no
hand-maintained list to update. Run it (and everything else) with `pnpm verify`
(or `pnpm test`) locally or in a Codespace. The invariants:

- module ids are unique and module `order_index` values are unambiguous (unique);
- every skill belongs to a declared module;
- prerequisite edges are unique, have no self-edges, reference only active skills,
  and form no direct or indirect cycles;
- **every active skill has at least one learning item**, and every covered skill
  has at least two, unless it is listed in `CONTENT_FREE_SKILLS` /
  `SINGLE_ITEM_SKILLS` in that test (each exception is itself validated, so stale
  exceptions fail too).

So: when you add an active skill, add its content in the same change — or add an
explicit, justified exception. (The DB↔TypeScript-seed *parity* exporter that
compares the migrated database against the seed is tracked separately in #97 and
still to do; this slice covers the seed-side integrity + derived coverage.)
