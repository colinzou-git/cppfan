#include "check.hpp"
#include "fraction.hpp"
#include <sstream>
void test_reduces_and_normalizes_sign(){ Fraction f(2,-4); CHECK(f.numerator()==-1); CHECK(f.denominator()==2);}
void test_zero_numerator(){ Fraction f(0,5); CHECK(f.numerator()==0); CHECK(f.denominator()==1);}
void test_addition(){ Fraction f = Fraction(1,2) + Fraction(1,3); CHECK(f == Fraction(5,6));}
void test_equality_after_reduction(){ CHECK(Fraction(2,4) == Fraction(1,2));}
void test_stream_insertion(){ std::ostringstream out; out << Fraction(-2,4); CHECK(out.str()=="-1/2");}
int main(){ test_reduces_and_normalizes_sign(); test_zero_numerator(); test_addition(); test_equality_after_reduction(); test_stream_insertion(); return REPORT();}
