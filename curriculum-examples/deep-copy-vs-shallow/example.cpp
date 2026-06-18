// Positive example for cpp.value_semantics.deep_copy.lesson.
// A deep copy allocates a new buffer and copies the contents, so each object has
// independent state (no shared buffer, no double free). Here the copy operations
// are hand-written to duplicate the owned value.
#include <iostream>
#include <memory>

class Buffer {
public:
    explicit Buffer(int v) : data_(std::make_unique<int>(v)) {}
    Buffer(const Buffer& other) : data_(std::make_unique<int>(*other.data_)) {} // deep copy
    Buffer& operator=(const Buffer& other) {
        data_ = std::make_unique<int>(*other.data_); // deep copy
        return *this;
    }
    int get() const { return *data_; }
    void set(int v) { *data_ = v; }

private:
    std::unique_ptr<int> data_;
};

int main() {
    Buffer a(10);
    Buffer b = a; // deep copy: b owns its own int
    b.set(99);
    std::cout << a.get() << "\n"; // 10: unchanged (independent state)
    std::cout << b.get() << "\n"; // 99
    return 0;
}
