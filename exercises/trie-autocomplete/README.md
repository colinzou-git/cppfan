# Strings: trie autocomplete

**Skills:** tries, string traversal, prefix queries  
**Difficulty:** advanced · **Estimated time:** 35 min

Build a small autocomplete index backed by prefix operations.

## Requirements

- Construct an index from an initial list of words.
- `insert(word)` adds a word. Duplicate inserts should not create duplicate suggestions.
- `contains(word)` returns whether the exact word exists.
- `suggestions(prefix, limit)` returns up to `limit` words that start with `prefix`, sorted lexicographically.
- `limit <= 0` returns no suggestions.

Edit only `autocomplete.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh trie-autocomplete
# ...edit exercises/trie-autocomplete/work/autocomplete.hpp...
scripts/exercises/test.sh trie-autocomplete
scripts/exercises/reset.sh trie-autocomplete
```

When all tests pass, mark the exercise complete in cppFan.
