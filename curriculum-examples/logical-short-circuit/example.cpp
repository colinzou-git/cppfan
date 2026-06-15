// Positive example for cpp.control_flow.logical_operators.lesson.
// && evaluates left to right and short-circuits: when the left operand is false,
// the right operand is never evaluated, so its side effect (incrementing `calls`)
// never happens. `calls` stays 0.
#include <iostream>

int main() {
    int calls = 0;
    auto ready = [&calls]() {
        ++calls;
        return true;
    };

    bool enabled = false;
    if (enabled && ready()) {
        std::cout << "ran the guarded branch\n";
    }

    std::cout << "calls=" << calls << "\n";
    return 0;
}
