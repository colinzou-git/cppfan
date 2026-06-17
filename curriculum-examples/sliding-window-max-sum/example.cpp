// Positive example for dsa.techniques.sliding_window.lesson.
// A fixed-length window slides across the array: each step adds the new element
// and drops the one that left, so the whole scan is O(n) rather than O(n*k).
#include <iostream>
#include <vector>

int main() {
    std::vector<int> a = {1, 4, 2, 10, 2, 3, 1, 0, 20};
    const int k = 3;

    int windowSum = 0;
    for (int i = 0; i < k; ++i) windowSum += a[i]; // first window
    std::cout << windowSum << "\n"; // 7

    int best = windowSum;
    for (std::size_t i = k; i < a.size(); ++i) {
        windowSum += a[i] - a[i - k]; // add the new element, drop the oldest
        if (windowSum > best) best = windowSum;
    }
    std::cout << best << "\n"; // 21: best sum of any window of length 3
    return 0;
}
