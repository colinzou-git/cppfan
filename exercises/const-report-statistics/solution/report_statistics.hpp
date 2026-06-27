#pragma once
#include <cstddef>
#include <vector>
inline long long sumValues(const std::vector<int>& values){ long long sum=0; for(int v:values) sum+=v; return sum; }
inline double averageValue(const std::vector<int>& values){ return values.empty()?0.0:static_cast<double>(sumValues(values))/values.size(); }
inline bool isSortedNondecreasing(const std::vector<int>& values){ for(std::size_t i=1;i<values.size();++i) if(values[i]<values[i-1]) return false; return true; }
