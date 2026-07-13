# Geometry: segment intersection

**Skills:** segment intersection, geometry, dot/cross products
· **Difficulty:** advanced · **~40 min**

Decide whether two closed line segments intersect.

## Requirements

- Points have integer coordinates. Return `true` when segments `p1-p2` and
  `p3-p4` share at least one point: a proper crossing, an endpoint touch, or a
  collinear overlap.
- Return `false` when disjoint (including collinear but separated).
- Use the orientation (cross-product) test; keep it integer-only (no floats).

Edit only `segment_intersection.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh geometry-segment-intersection
# ...edit exercises/geometry-segment-intersection/work/segment_intersection.hpp...
scripts/exercises/test.sh geometry-segment-intersection
scripts/exercises/reset.sh geometry-segment-intersection
```

When all tests pass, mark the exercise complete in cppFan.
