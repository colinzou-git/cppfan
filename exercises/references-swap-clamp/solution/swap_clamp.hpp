#pragma once
inline void swap_values(int& a, int& b) { int tmp = a; a = b; b = tmp; }
inline void clamp_in_place(int& value, int low, int high) { if (value < low) value = low; else if (value > high) value = high; }
