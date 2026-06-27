#include "check.hpp"
#include "point_distance.hpp"
void test_three_four_five_squared(){ CHECK(squared_distance({0,0},{3,4})==25);}
void test_same_point(){ CHECK(squared_distance({2,-5},{2,-5})==0);}
void test_negative_coordinates(){ CHECK(squared_distance({-1,-2},{2,2})==25);}
void test_large_coordinates(){ CHECK(squared_distance({100000,100000},{99999,99998})==5);}
int main(){ test_three_four_five_squared(); test_same_point(); test_negative_coordinates(); test_large_coordinates(); return REPORT();}
