# Strings: group anagrams

**Skills:** hashing/signatures, character frequency, std::map
· **Difficulty:** intermediate · **~30 min**

Group words that are anagrams of one another.

## Requirements

- Two words are anagrams when their sorted characters are equal (byte-for-byte,
  case-sensitive).
- Within each group, sort the words ascending (keep duplicates).
- Sort the groups by their first (smallest) word, ascending.
- An empty input yields an empty result.

Edit only `anagram_groups.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh string-anagram-groups
# ...edit exercises/string-anagram-groups/work/anagram_groups.hpp...
scripts/exercises/test.sh string-anagram-groups
scripts/exercises/reset.sh string-anagram-groups
```

When all tests pass, mark the exercise complete in cppFan.
