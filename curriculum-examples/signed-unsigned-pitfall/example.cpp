// BUG-SPOTTING example for cpp.values_types.signed_unsigned.lesson.
// Defect: `i >= 0` is always true because comparing the signed `i` to the unsigned
// `v.size()` in the loop condition promotes `i` to unsigned, and a decremented
// past-zero `i` becomes a huge value rather than -1. This is intentionally wrong;
// see the corrected companion (signed-unsigned-fixed). Not compiled as a positive.
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{10, 20, 30};
    // Intends to walk backwards, but `i < v.size()` mixes signed/unsigned.
    for (int i = static_cast<int>(v.size()) - 1; i < v.size(); --i) {
        std::cout << v[i] << "\n";
    }
    return 0;
}
