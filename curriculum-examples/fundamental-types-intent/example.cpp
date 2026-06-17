// Positive example for cpp.values_types.fundamental_types.lesson.
// int is exact, double is approximate (so 0.1 + 0.2 != 0.3), bool is a flag,
// char is a single character — choose the type by range and intent.
#include <iostream>

int main() {
    int count = 42;           // exact whole number
    double sum = 0.1 + 0.2;   // approximate floating point
    bool ready = true;        // a yes/no flag
    char grade = 'A';         // a single character

    std::cout << count << "\n";                                   // 42
    std::cout << (sum == 0.3 ? "equal" : "not equal") << "\n";    // not equal
    std::cout << (ready ? "ready" : "waiting") << "\n";           // ready
    std::cout << grade << "\n";                                   // A
    return 0;
}
