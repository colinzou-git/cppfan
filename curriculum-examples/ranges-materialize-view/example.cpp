// Positive example for cpp.templates.view_lifetime.bug_return_view.
// A view over a local vector would dangle after return; materialize the filtered
// values into an owning vector when the result must outlive the source range.
#include <iostream>
#include <ranges>
#include <vector>

std::vector<int> small_values() {
    std::vector<int> values{1, 2, 3, 4};
    std::vector<int> result;

    for (int x : values | std::views::filter([](int n) { return n < 3; })) {
        result.push_back(x);
    }

    return result;
}

int main() {
    for (int x : small_values()) {
        std::cout << x << " ";
    }
    std::cout << "\n";
    return 0;
}
