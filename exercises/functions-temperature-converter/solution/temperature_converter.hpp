#pragma once
#include <iomanip>
#include <sstream>
#include <string>

inline double fahrenheitToCelsius(double f) { return (f - 32.0) * 5.0 / 9.0; }
inline double celsiusToFahrenheit(double c) { return c * 9.0 / 5.0 + 32.0; }
inline std::string formatOneDecimal(double value) { std::ostringstream out; out << std::fixed << std::setprecision(1) << value; return out.str(); }
inline std::string convertTemperature(char command, double value) {
  if (command == 'C') return formatOneDecimal(fahrenheitToCelsius(value));
  if (command == 'F') return formatOneDecimal(celsiusToFahrenheit(value));
  return "invalid";
}
