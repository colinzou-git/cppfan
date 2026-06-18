#include <iostream>
#include <vector>

int range_sum(const std::vector<int>& prefix, int left, int right) {
  return prefix[right + 1] - prefix[left];
}

int main() {
  const std::vector<int> values{2, 4, -1, 6, 3};
  std::vector<int> prefix(values.size() + 1, 0);

  for (std::size_t i = 0; i < values.size(); ++i) {
    prefix[i + 1] = prefix[i] + values[i];
  }

  std::cout << range_sum(prefix, 1, 3) << '\n';
  return 0;
}
