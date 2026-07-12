# Parsing: contact line parser

**Skills:** getline input, stream validation, string parsing edge cases
· **Difficulty:** beginner · **~25 min**

Parse one line of the form `Name, email, phone` into a `Contact`, handling
messy whitespace and rejecting malformed input.

## Requirements

- Split the line on commas into exactly three fields.
- Trim leading/trailing whitespace from each field.
- Mark the contact `valid` only when all three fields are non-empty **and** the
  email field contains an `@`.
- If there are not exactly three comma-separated fields, return an invalid
  contact.

Edit only `contact_parser.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh getline-contact-parser
# ...edit exercises/getline-contact-parser/work/contact_parser.hpp...
scripts/exercises/test.sh getline-contact-parser
scripts/exercises/reset.sh getline-contact-parser
```

When all tests pass, mark the exercise complete in cppFan.
