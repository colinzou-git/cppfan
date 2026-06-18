// Positive example for cpp.value_semantics.special_members.lesson.
// Construction (T b = a) builds a new object; assignment (b = a) updates an
// existing one. An rvalue source selects the move members instead of the copy
// members. Each special member here announces when it runs.
#include <iostream>
#include <utility>

struct Widget {
    Widget() { std::cout << "default\n"; }
    Widget(const Widget&) { std::cout << "copy ctor\n"; }
    Widget& operator=(const Widget&) {
        std::cout << "copy assign\n";
        return *this;
    }
    Widget(Widget&&) noexcept { std::cout << "move ctor\n"; }
    Widget& operator=(Widget&&) noexcept {
        std::cout << "move assign\n";
        return *this;
    }
};

int main() {
    Widget a;                // default
    Widget b = a;            // copy ctor (construction)
    Widget c;                // default
    c = a;                   // copy assign (existing object)
    Widget d = std::move(a); // move ctor
    c = std::move(b);        // move assign
    (void)d;
    return 0;
}
