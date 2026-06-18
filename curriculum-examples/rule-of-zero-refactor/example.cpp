#include <iostream>
#include <utility>
#include <vector>

class Scores {
public:
  explicit Scores(std::vector<int> values) : data_(std::move(values)) {}

  int at(std::size_t index) const {
    return data_.at(index);
  }

  void set(std::size_t index, int value) {
    data_.at(index) = value;
  }

private:
  std::vector<int> data_;
};

int main() {
  Scores original({1, 2, 3});
  Scores copy = original;
  copy.set(1, 10);

  Scores moved = std::move(copy);
  moved.set(1, 20);

  std::cout << original.at(2) << ' ' << original.at(1) << '\n';
  std::cout << moved.at(2) << ' ' << moved.at(1) << '\n';
  return 0;
}
