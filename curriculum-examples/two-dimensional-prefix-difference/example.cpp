// Positive example for dsa.techniques.prefix_2d.code_difference_trace.
// The same inclusion-exclusion idea powers 2-D prefix queries and 2-D
// difference-array rectangle updates.
#include <iostream>
#include <vector>

int main() {
    std::vector<std::vector<int>> grid{
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };
    const int rows = static_cast<int>(grid.size());
    const int cols = static_cast<int>(grid[0].size());

    std::vector<std::vector<int>> pref(rows + 1, std::vector<int>(cols + 1, 0));
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            pref[r + 1][c + 1] = grid[r][c] + pref[r][c + 1] + pref[r + 1][c] - pref[r][c];
        }
    }

    auto sumRect = [&](int r1, int c1, int r2, int c2) {
        return pref[r2][c2] - pref[r1][c2] - pref[r2][c1] + pref[r1][c1];
    };
    std::cout << "rect=" << sumRect(1, 1, 3, 3) << "\n";

    std::vector<std::vector<int>> diff(rows + 1, std::vector<int>(cols + 1, 0));
    auto addRect = [&](int r1, int c1, int r2, int c2, int value) {
        diff[r1][c1] += value;
        diff[r2 + 1][c1] -= value;
        diff[r1][c2 + 1] -= value;
        diff[r2 + 1][c2 + 1] += value;
    };

    addRect(0, 1, 1, 2, 5);
    int updated = 0;
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            if (r > 0) diff[r][c] += diff[r - 1][c];
            if (c > 0) diff[r][c] += diff[r][c - 1];
            if (r > 0 && c > 0) diff[r][c] -= diff[r - 1][c - 1];
            if (diff[r][c] == 5) ++updated;
        }
    }
    std::cout << "updated=" << updated << "\n";
    return 0;
}
