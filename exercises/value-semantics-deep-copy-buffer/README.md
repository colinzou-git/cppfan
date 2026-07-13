# Value semantics: deep-copy buffer

**Skills:** deep copy, rule of five, move semantics
· **Difficulty:** advanced · **~40 min**

Give an owning int buffer full value semantics (the rule of five).

## Requirements

- `Buffer(n)` allocates `n` zero-initialized ints (`n == 0` owns no memory).
- Copy constructor / copy assignment make a **deep** copy with independent
  memory. Copy assignment is self-assignment safe and leaks nothing.
- Move constructor / move assignment steal the pointer and leave the source
  empty (size 0) but valid.
- The destructor frees the memory exactly once.

The tests run under AddressSanitizer, so leaks and double-frees fail.

Edit only `buffer.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh value-semantics-deep-copy-buffer
# ...edit exercises/value-semantics-deep-copy-buffer/work/buffer.hpp...
scripts/exercises/test.sh value-semantics-deep-copy-buffer
scripts/exercises/reset.sh value-semantics-deep-copy-buffer
```

When all tests pass, mark the exercise complete in cppFan.
