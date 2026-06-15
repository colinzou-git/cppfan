// Positive example for cpp.values_types.signed_unsigned.lesson.
// Corrected companion to signed-unsigned-pitfall: the index stays signed and is
// compared against a signed bound, so the backward walk stops at i == -1 instead
// of wrapping around an unsigned comparison.
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v{10, 20, 30};
    for (int i = static_cast<int>(v.size()) - 1; i >= 0; --i) {
        std::cout << v[i] << "\n";
    }
    return 0;
}
