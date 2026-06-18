// Positive example for cpp.value_semantics.self_assignment.lesson.
// A hand-written copy-assignment operator must survive being assigned to itself.
// A self-check guard (`if (this == &other) return *this;`) avoids freeing the
// buffer it is about to read.
#include <iostream>
#include <memory>

class Holder {
public:
    explicit Holder(int v) : data_(std::make_unique<int>(v)) {}
    Holder(const Holder& other) : data_(std::make_unique<int>(*other.data_)) {}
    Holder& operator=(const Holder& other) {
        if (this == &other) return *this; // self-assignment guard
        data_ = std::make_unique<int>(*other.data_);
        return *this;
    }
    int get() const { return *data_; }

private:
    std::unique_ptr<int> data_;
};

int main() {
    Holder a(42);
    Holder& alias = a;
    a = alias; // self-assignment through an alias: must stay valid
    std::cout << a.get() << "\n"; // 42

    Holder b(7);
    a = b;
    std::cout << a.get() << "\n"; // 7
    return 0;
}
