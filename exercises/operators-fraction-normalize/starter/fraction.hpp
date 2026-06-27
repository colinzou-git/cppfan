#pragma once
#include <ostream>
class Fraction { public: Fraction(long long n = 0, long long d = 1){ (void)n; (void)d; } long long numerator() const { return 0; } long long denominator() const { return 1; } friend Fraction operator+(const Fraction&, const Fraction&){ return {}; } friend bool operator==(const Fraction&, const Fraction&){ return false; } };
inline std::ostream& operator<<(std::ostream& os, const Fraction& f){ return os << f.numerator() << "/" << f.denominator(); }
