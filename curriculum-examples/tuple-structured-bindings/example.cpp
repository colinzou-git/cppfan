// Positive example for cpp.utilities.tuples.lesson.
// std::pair / std::tuple group a fixed number of values (e.g. multiple return
// values); structured bindings unpack them into named variables.
#include <iostream>
#include <tuple>
#include <utility>

std::pair<int, int> divmod(int a, int b) {
    return {a / b, a % b};
}

int main() {
    auto [quotient, remainder] = divmod(17, 5);
    std::cout << quotient << " " << remainder << "\n"; // 3 2

    auto t = std::make_tuple(1, 2.5, 'x');
    auto [i, d, c] = t;
    std::cout << i << " " << d << " " << c << "\n"; // 1 2.5 x
    return 0;
}
