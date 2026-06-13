# STL: text statistics

**Skills:** `std::map`, STL algorithms, string parsing
· **Difficulty:** intermediate · **~30 min**

Implement word statistics over a block of text using STL containers.

## Requirements

- `analyze(text)` splits `text` into words on whitespace, lowercases each word
  (ASCII `A-Z` → `a-z`), and returns the total `word_count` plus a
  `word → count` map (`freq`).
- `top_n(stats, n)` returns the `n` most frequent words as `(word, count)`
  pairs, sorted by **count descending**, ties broken by **word ascending**. If
  `n` exceeds the number of distinct words, return all of them.

Edit only `text_stats.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh stl-text-stats
# ...edit exercises/stl-text-stats/work/text_stats.hpp...
scripts/exercises/test.sh stl-text-stats
scripts/exercises/reset.sh stl-text-stats
```

When all tests pass, mark the exercise complete in cppFan.
