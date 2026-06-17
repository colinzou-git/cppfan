// Positive example for dsa.techniques.greedy.lesson.
// Activity selection is a classic greedy win: sort by finish time, then always
// take the next activity that starts after the last one chosen finished.
#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>

int main() {
    std::vector<std::pair<int, int>> acts = {
        {1, 3}, {2, 5}, {4, 7}, {1, 8}, {5, 9}, {8, 10}}; // {start, finish}

    std::sort(acts.begin(), acts.end(),
              [](const auto& a, const auto& b) { return a.second < b.second; });

    int count = 0;
    int lastEnd = -1;
    for (const auto& [start, finish] : acts) {
        if (start >= lastEnd) { // compatible with the last chosen activity
            ++count;
            lastEnd = finish;
        }
    }
    std::cout << count << "\n";   // 3: most non-overlapping activities
    std::cout << lastEnd << "\n"; // 10: finish time of the last one chosen
    return 0;
}
