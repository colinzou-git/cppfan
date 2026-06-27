#pragma once
#include <cstdlib>
#include <ostream>
class Fraction { long long n_ = 0; long long d_ = 1; static long long gcd(long long a, long long b){ if(a<0)a=-a; if(b<0)b=-b; while(b){ long long t=a%b; a=b; b=t; } return a==0?1:a; } void normalize(){ if(d_<0){ n_=-n_; d_=-d_; } if(n_==0){ d_=1; return; } long long g=gcd(n_, d_); n_/=g; d_/=g; } public: Fraction(long long n = 0, long long d = 1): n_(n), d_(d==0?1:d){ normalize(); } long long numerator() const { return n_; } long long denominator() const { return d_; } friend Fraction operator+(const Fraction& a, const Fraction& b){ return Fraction(a.n_*b.d_ + b.n_*a.d_, a.d_*b.d_); } friend bool operator==(const Fraction& a, const Fraction& b){ return a.n_==b.n_ && a.d_==b.d_; } };
inline std::ostream& operator<<(std::ostream& os, const Fraction& f){ return os << f.numerator() << "/" << f.denominator(); }
