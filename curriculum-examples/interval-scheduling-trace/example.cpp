// Positive example for dsa.techniques.interval_scheduling.code_trace.
// Earliest-finish-time greedy leaves the most room for later intervals.
#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>

int main() {
    std::vector<std::pair<int, int>> intervals{{1, 4}, {2, 3}, {3, 5}, {0, 6}, {5, 7}};
    std::sort(intervals.begin(), intervals.end(), [](const auto& left, const auto& right) {
        if (left.second != right.second) return left.second < right.second;
        return left.first < right.first;
    });

    std::vector<std::pair<int, int>> chosen;
    int lastFinish = -1;
    for (const auto& interval : intervals) {
        if (interval.first >= lastFinish) {
            chosen.push_back(interval);
            lastFinish = interval.second;
        }
    }

    for (std::size_t i = 0; i < chosen.size(); ++i) {
        if (i > 0) std::cout << " ";
        std::cout << "[" << chosen[i].first << "," << chosen[i].second << "]";
    }
    std::cout << "\n";
    return 0;
}
