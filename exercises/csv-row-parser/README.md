# Parsing: CSV row with quotes

**Skills:** string parsing, parsing edge cases, stream validation
· **Difficulty:** intermediate · **~35 min**

Split one CSV row into its fields, handling quoted fields with embedded commas
and escaped quotes.

## Requirements

- Fields are separated by commas.
- A field may be wrapped in double quotes; inside quotes a comma is literal.
- Inside a quoted field, `""` is an escaped double quote.
- A quote only opens a quoted field when it is the first character of the field.
- An empty line is a single empty field `{""}`; `a,,c` is `{"a","","c"}`.

Edit only `csv_parser.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh csv-row-parser
# ...edit exercises/csv-row-parser/work/csv_parser.hpp...
scripts/exercises/test.sh csv-row-parser
scripts/exercises/reset.sh csv-row-parser
```

When all tests pass, mark the exercise complete in cppFan.
