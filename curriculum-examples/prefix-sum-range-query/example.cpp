// Positive example for dsa.techniques.prefix_sums.lesson.
// A prefix-sum array (prefix[0] = 0, prefix[i] = sum of the first i elements)
// answers any subarray sum [l, r] as prefix[r + 1] - prefix[l] in O(1).
#include <iostream>
#include <vector>

int main() {
    std::vector<int> a = {2, 4, 1, 3, 5};
    std::vector<int> prefix(a.size() + 1, 0);
    for (std::size_t i = 0; i < a.size(); ++i) {
        prefix[i + 1] = prefix[i] + a[i];
    }

    int l = 1, r = 3; // sum of a[1..3] = 4 + 1 + 3
    std::cout << prefix[r + 1] - prefix[l] << "\n"; // 8
    std::cout << prefix[a.size()] - prefix[0] << "\n"; // 15: whole array
    return 0;
}
