# Smart pointers: shared/weak observer graph

**Skills:** shared_ptr, weak_ptr, breaking reference cycles
· **Difficulty:** advanced · **~35 min**

Link parent and child nodes without creating a reference cycle.

## Requirements

- A `Node` owns its children with `std::shared_ptr`.
- A `Node` points back to its parent with a `std::weak_ptr` (so the link does not
  leak).
- `add_child(parent, child)` appends `child` to `parent->children` and sets
  `child->parent` to the parent (weak reference).
- `parent_value(child)` returns the parent's value, or `-1` if the parent has
  been destroyed (weak_ptr expired).

Setting `child->parent = parent` must **not** raise the parent's use_count. Tests
run under AddressSanitizer.

Edit only `observer_graph.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh shared-weak-observer-graph
# ...edit exercises/shared-weak-observer-graph/work/observer_graph.hpp...
scripts/exercises/test.sh shared-weak-observer-graph
scripts/exercises/reset.sh shared-weak-observer-graph
```

When all tests pass, mark the exercise complete in cppFan.
