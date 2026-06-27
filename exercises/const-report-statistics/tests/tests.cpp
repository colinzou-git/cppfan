#include "check.hpp"
#include "report_statistics.hpp"
#include <vector>
void test_sum_and_average(){ std::vector<int> v{1,2,6}; CHECK(sumValues(v)==9); CHECK(averageValue(v)==3.0);}
void test_empty_average(){ std::vector<int> v; CHECK(sumValues(v)==0); CHECK(averageValue(v)==0.0); CHECK(isSortedNondecreasing(v));}
void test_sorted_true(){ CHECK(isSortedNondecreasing(std::vector<int>{1,1,2,3}));}
void test_sorted_false(){ CHECK(!isSortedNondecreasing(std::vector<int>{1,3,2}));}
void test_const_vector_compiles(){ const std::vector<int> v{-2,2}; CHECK(sumValues(v)==0);}
int main(){ test_sum_and_average(); test_empty_average(); test_sorted_true(); test_sorted_false(); test_const_vector_compiles(); return REPORT();}
