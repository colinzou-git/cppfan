// Positive example for cpp.value_semantics.rule_of_zero_five.lesson.
// Rule of Zero: when members manage their own resources (std::string,
// std::vector), the class needs no custom destructor, copy, or move — the
// compiler-generated special members are already correct.
#include <iostream>
#include <string>
#include <vector>

struct Account {
    std::string owner;
    std::vector<int> transactions;
    // no destructor, copy, or move declared — the defaults do the right thing
};

int main() {
    Account a{"alice", {100, -20, 50}};

    Account b = a; // default copy is a correct deep copy
    b.owner = "bob";
    b.transactions.push_back(10);

    std::cout << a.owner << " " << a.transactions.size() << "\n"; // alice 3
    std::cout << b.owner << " " << b.transactions.size() << "\n"; // bob 4
    return 0;
}
