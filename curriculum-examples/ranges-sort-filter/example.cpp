// Positive example for cpp.templates.ranges.lesson.
// C++20 ranges call algorithms on a whole container (std::ranges::sort(v)); views
// compose lazy, non-owning pipelines (here, keep the even elements on demand).
#include <algorithm>
#include <iostream>
#include <ranges>
#include <vector>

int main() {
    std::vector<int> v{5, 2, 4, 1, 3, 6};
    std::ranges::sort(v);
    for (int x : v | std::views::filter([](int n) { return n % 2 == 0; })) {
        std::cout << x << " ";
    }
    std::cout << "\n";
    return 0;
}
