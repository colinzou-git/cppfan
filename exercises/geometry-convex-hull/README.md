# Geometry: convex hull

**Skills:** convex hull, geometry, cross products
· **Difficulty:** advanced · **~45 min**

Compute the convex hull of a set of 2-D points.

## Requirements

- Return the vertices of the convex hull (smallest convex polygon containing all
  points).
- Drop interior points **and** points on the interior of a hull edge (only true
  corners remain).
- With fewer than 3 distinct points, return the distinct points themselves.
- Tests compare the hull as an unordered vertex set, so any correct winding is
  accepted (Andrew's monotone chain is a clean approach).

Edit only `convex_hull.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh geometry-convex-hull
# ...edit exercises/geometry-convex-hull/work/convex_hull.hpp...
scripts/exercises/test.sh geometry-convex-hull
scripts/exercises/reset.sh geometry-convex-hull
```

When all tests pass, mark the exercise complete in cppFan.
