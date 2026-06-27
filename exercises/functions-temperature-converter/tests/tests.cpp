#include "check.hpp"
#include "temperature_converter.hpp"
void test_fahrenheit_to_celsius(){ CHECK(convertTemperature('C', 212.0) == "100.0"); }
void test_celsius_to_fahrenheit(){ CHECK(convertTemperature('F', 0.0) == "32.0"); }
void test_invalid_command(){ CHECK(convertTemperature('X', 10.0) == "invalid"); }
void test_negative_temperature(){ CHECK(convertTemperature('F', -40.0) == "-40.0"); }
int main(){ test_fahrenheit_to_celsius(); test_celsius_to_fahrenheit(); test_invalid_command(); test_negative_temperature(); return REPORT(); }
