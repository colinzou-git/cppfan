#include "check.hpp"
#include "swap_clamp.hpp"
void test_swap_values(){ int a=2,b=7; swap_values(a,b); CHECK(a==7); CHECK(b==2);}
void test_clamp_low(){ int v=-5; clamp_in_place(v,0,10); CHECK(v==0);}
void test_clamp_high(){ int v=99; clamp_in_place(v,0,10); CHECK(v==10);}
void test_already_in_range(){ int v=5; clamp_in_place(v,0,10); CHECK(v==5);}
void test_equal_bounds(){ int v=3; clamp_in_place(v,8,8); CHECK(v==8);}
int main(){ test_swap_values(); test_clamp_low(); test_clamp_high(); test_already_in_range(); test_equal_bounds(); return REPORT();}
