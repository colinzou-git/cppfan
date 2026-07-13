# Greedy: jump game

**Skills:** greedy, greedy correctness, array traversal
· **Difficulty:** intermediate · **~25 min**

Decide whether you can reach the last index by jumping forward.

## Requirements

- `nums[i]` is the maximum jump length from index `i` (`0 <= jump <= nums[i]`).
- Return `true` iff you can reach the last index starting from index 0.
- An empty vector and a single-element vector are trivially reachable.
- Greedy O(n): track the farthest index reachable so far.

Edit only `jump_game.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh greedy-jump-game
# ...edit exercises/greedy-jump-game/work/jump_game.hpp...
scripts/exercises/test.sh greedy-jump-game
scripts/exercises/reset.sh greedy-jump-game
```

When all tests pass, mark the exercise complete in cppFan.
