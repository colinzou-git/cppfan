# Utilities: filesystem inventory

**Skills:** filesystem paths, file streams, stream validation
* **Difficulty:** intermediate * **~35 min**

Build a small directory inventory helper with portable `std::filesystem`
operations.

## Requirements

- `summarize_directory(root)` returns an empty summary when `root` is missing or
  is not a directory.
- Traverse `root` recursively.
- Count regular files and directories below `root` (do not count `root`
  itself).
- Sum regular-file sizes.
- Count file extensions in `extension_counts`; use the exact extension string
  from `path.extension()` and `"(none)"` for files without an extension.
- Handle expected filesystem errors with `std::error_code` instead of throwing.

Edit only `inventory.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh filesystem-inventory
# ...edit exercises/filesystem-inventory/work/inventory.hpp...
scripts/exercises/test.sh filesystem-inventory
scripts/exercises/reset.sh filesystem-inventory
```

When all tests pass, mark the exercise complete in cppFan.
