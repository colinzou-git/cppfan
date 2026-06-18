// Positive example for cpp.references.interface_intent.lesson.
// The function borrows read-only data with std::span and returns optional for absence.
#include <iostream>
#include <optional>
#include <span>
#include <vector>

std::optional<std::size_t> find_index(std::span<const int> values, int needle) {
    for (std::size_t i = 0; i < values.size(); ++i) {
        if (values[i] == needle) {
            return i;
        }
    }
    return std::nullopt;
}

int main() {
    const std::vector<int> values{4, 8, 15, 16};

    if (const auto index = find_index(values, 15)) {
        std::cout << *index << "\n";
    }
    if (!find_index(values, 23)) {
        std::cout << "missing\n";
    }

    return 0;
}
