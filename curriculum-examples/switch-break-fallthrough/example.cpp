// Positive example for cpp.control_flow.switch_statement.lesson.
// switch matches a value against case labels; a standalone case ends with break
// or return, stacked empty labels share code, and [[fallthrough]] marks an
// intentional fall-through. default handles every other value.
#include <iostream>

const char* classify(int n) {
    switch (n) {
        case 0:
            return "zero";
        case 1:
        case 2: // stacked labels: 1 and 2 share this code
            return "small";
        case 3:
            [[fallthrough]]; // intentional fall-through into case 4
        case 4:
            return "three-or-four";
        default:
            return "big";
    }
}

int main() {
    std::cout << classify(0) << "\n"; // zero
    std::cout << classify(1) << "\n"; // small
    std::cout << classify(2) << "\n"; // small
    std::cout << classify(3) << "\n"; // three-or-four
    std::cout << classify(9) << "\n"; // big
    return 0;
}
