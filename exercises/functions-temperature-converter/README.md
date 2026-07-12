# Functions: temperature converter

**Skills:** functions, decomposition, numeric conversions
· **Difficulty:** beginner · **~15 min**

Implement four small, single-purpose conversion functions. The point is
**function decomposition**: each formula lives in its own named function.

## Requirements

- `celsius_to_fahrenheit(c) = c * 9 / 5 + 32`
- `fahrenheit_to_celsius(f) = (f - 32) * 5 / 9`
- `celsius_to_kelvin(c) = c + 273.15`
- `kelvin_to_celsius(k) = k - 273.15`
- Use floating-point division (e.g. `9.0 / 5.0`), never integer division.

Edit only `temperature_converter.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh functions-temperature-converter
# ...edit exercises/functions-temperature-converter/work/temperature_converter.hpp...
scripts/exercises/test.sh functions-temperature-converter
scripts/exercises/reset.sh functions-temperature-converter
```

When all tests pass, mark the exercise complete in cppFan.
