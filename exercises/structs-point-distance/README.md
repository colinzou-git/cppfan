# Structs: points and distance

**Skills:** struct syntax, const methods, array traversal
· **Difficulty:** beginner · **~25 min**

Define a small `Point` struct with a const method, and a free function that
walks a polygon.

## Requirements

- `Point` has public `double` fields `x` and `y`.
- `distance_to(other)` is a **const** method returning the Euclidean distance
  `sqrt((x - other.x)^2 + (y - other.y)^2)`.
- `perimeter(polygon)` sums the edge lengths around a **closed** polygon: the
  last vertex connects back to the first. Fewer than 2 points → `0`.

Edit only `point.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh structs-point-distance
# ...edit exercises/structs-point-distance/work/point.hpp...
scripts/exercises/test.sh structs-point-distance
scripts/exercises/reset.sh structs-point-distance
```

When all tests pass, mark the exercise complete in cppFan.
