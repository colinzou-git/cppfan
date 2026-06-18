// Positive example for cpp.references.views.lesson.
// std::string_view and std::span are non-owning (pointer + length) views that
// borrow data without copying, replacing raw pointer+length parameters with
// bounds-aware objects. (A view never extends the lifetime of what it borrows.)
#include <iostream>
#include <span>
#include <string>
#include <string_view>
#include <vector>

std::size_t length(std::string_view sv) { return sv.size(); } // borrows characters

int sum(std::span<const int> s) { // borrows a contiguous int range
    int total = 0;
    for (int x : s) total += x;
    return total;
}

int main() {
    std::string owner = "hello world";
    std::string_view first(owner.data(), 5); // view of "hello"
    std::cout << first << "\n";        // hello
    std::cout << length(first) << "\n"; // 5

    std::vector<int> v = {2, 4, 6, 8};
    std::cout << sum(v) << "\n"; // 20: span borrows the vector's storage
    return 0;
}
