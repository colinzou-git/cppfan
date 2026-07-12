// Tests for functions-temperature-converter. Build with -I _harness and the impl dir.
#include <cmath>

#include "check.hpp"
#include "temperature_converter.hpp"

static bool close(double a, double b) {
  return std::fabs(a - b) < 1e-9;
}

static void test_freezing_point() {
  CHECK(close(celsius_to_fahrenheit(0.0), 32.0));
  CHECK(close(fahrenheit_to_celsius(32.0), 0.0));
}

static void test_boiling_point() {
  CHECK(close(celsius_to_fahrenheit(100.0), 212.0));
  CHECK(close(fahrenheit_to_celsius(212.0), 100.0));
}

static void test_negative_temperatures() {
  CHECK(close(celsius_to_fahrenheit(-40.0), -40.0));
  CHECK(close(fahrenheit_to_celsius(-40.0), -40.0));
}

static void test_kelvin_conversions() {
  CHECK(close(celsius_to_kelvin(0.0), 273.15));
  CHECK(close(celsius_to_kelvin(-273.15), 0.0));
  CHECK(close(kelvin_to_celsius(300.0), 26.85));
}

static void test_round_trip() {
  CHECK(close(fahrenheit_to_celsius(celsius_to_fahrenheit(37.0)), 37.0));
  CHECK(close(kelvin_to_celsius(celsius_to_kelvin(21.5)), 21.5));
}

int main() {
  test_freezing_point();
  test_boiling_point();
  test_negative_temperatures();
  test_kelvin_conversions();
  test_round_trip();
  return REPORT();
}
