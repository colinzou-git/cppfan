// Positive example for dsa.sorting.comparator.lesson.
// std::sort orders with < by default; passing a comparator sorts by a custom
// order. The comparator returns true when a should come before b — here it
// sorts a vector of structs by a chosen field (score, descending).
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Player {
    std::string name;
    int score;
};

int main() {
    std::vector<Player> players = {{"alice", 30}, {"bob", 50}, {"carol", 40}};

    std::sort(players.begin(), players.end(),
              [](const Player& a, const Player& b) { return a.score > b.score; });

    for (const auto& p : players) {
        std::cout << p.name << " " << p.score << "\n"; // bob 50 / carol 40 / alice 30
    }
    return 0;
}
