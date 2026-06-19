# Tooling: status parser with tests

**Skills:** debugging method, unit tests, regression tests, warnings, sanitizers, CMake
**Difficulty:** intermediate - **~35 min**

Implement a tiny parser for status lines such as `OK 200 ready` and
`ERR 404 missing page`. The exercise is intentionally small so you can practice
the toolchain loop: read failing tests, fix one behavior at a time, keep warnings
clean, and run sanitizer-backed tests.

## Requirements

- `parse_status_line(line)` returns `ParseResult{true, code, message}` for
  `OK <non-negative-code> <message>` and `ERR <non-negative-code> <message>`.
- It returns `ParseResult{false, -1, "malformed"}` when the status word, code,
  or message is missing or malformed.
- It returns `ParseResult{false, -1, "invalid code"}` for a negative code.
- Preserve spaces inside the message after the single separator following the
  code.

Edit only `status_parser.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh tooling-status-parser
# ...edit exercises/tooling-status-parser/work/status_parser.hpp...
scripts/exercises/test.sh tooling-status-parser
scripts/exercises/reset.sh tooling-status-parser
```

## Optional CMake workflow

Codespaces include CMake. To practice the target-based build directly:

```bash
cmake -S exercises/tooling-status-parser \
  -B exercises/tooling-status-parser/work/build \
  -DCPPFAN_IMPL_DIR=$PWD/exercises/tooling-status-parser/work \
  -DCPPFAN_ENABLE_SANITIZERS=ON \
  -DCMAKE_BUILD_TYPE=Debug
cmake --build exercises/tooling-status-parser/work/build
ctest --test-dir exercises/tooling-status-parser/work/build --output-on-failure
```

When all tests pass, mark the exercise complete in cppFan.
