# Utilities: file extension summary

**Skills:** std::filesystem paths, string parsing, std::map
· **Difficulty:** intermediate · **~25 min**

Summarize how many file names carry each extension.

## Requirements

- Use `std::filesystem::path` to read each name's extension (pure parsing — do
  not touch the real disk).
- Group names with no extension (including dotfiles like `.gitignore`) under
  the key `"(none)"`.
- Return a `std::map<std::string, int>` from extension (e.g. `.txt`) to count.
- `"archive.tar.gz"` has extension `.gz` (only the last one).

Edit only `extension_summary.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh filesystem-extension-summary
# ...edit exercises/filesystem-extension-summary/work/extension_summary.hpp...
scripts/exercises/test.sh filesystem-extension-summary
scripts/exercises/reset.sh filesystem-extension-summary
```

When all tests pass, mark the exercise complete in cppFan.
