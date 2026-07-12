// Reference solution for functions-temperature-converter.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

inline double celsius_to_fahrenheit(double c) {
  return c * 9.0 / 5.0 + 32.0;
}

inline double fahrenheit_to_celsius(double f) {
  return (f - 32.0) * 5.0 / 9.0;
}

inline double celsius_to_kelvin(double c) {
  return c + 273.15;
}

inline double kelvin_to_celsius(double k) {
  return k - 273.15;
}
