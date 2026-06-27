#pragma once
#include <vector>
inline int* find_first(std::vector<int>& values, int target){ for(int& value: values) if(value==target) return &value; return nullptr; }
inline const int* find_first(const std::vector<int>& values, int target){ for(const int& value: values) if(value==target) return &value; return nullptr; }
