# STL: browser history

**Skills:** public/private, index arithmetic, class invariants
· **Difficulty:** intermediate · **~30 min**

Model browser history with a back/forward cursor.

## Requirements

- Construct with a homepage; `current()` is that page.
- `visit(url)` — drop any forward history, append `url`, and land on it.
- `back(steps)` — move back up to `steps` pages, clamping at the first page;
  return the new current page.
- `forward(steps)` — move forward up to `steps` pages, clamping at the last
  page; return the new current page.
- Negative `steps` count as 0.

Edit only `browser_history.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh deque-browser-history
# ...edit exercises/deque-browser-history/work/browser_history.hpp...
scripts/exercises/test.sh deque-browser-history
scripts/exercises/reset.sh deque-browser-history
```

When all tests pass, mark the exercise complete in cppFan.
