// Tests for graph-maze-shortest-path. Build with -I _harness and the implementation dir.
#include <string>
#include <vector>

#include "check.hpp"
#include "maze_route.hpp"

static void test_shortest_route_exists() {
  const std::vector<std::string> grid{
      "S.#",
      "..#",
      "..G",
  };
  CHECK(shortest_maze_route(grid) == 4);
}

static void test_start_is_goal() {
  const std::vector<std::string> grid{"S"};
  CHECK(shortest_maze_route(grid) == 0);
}

static void test_unreachable_goal() {
  const std::vector<std::string> grid{
      "S#.",
      "###",
      ".#G",
  };
  CHECK(shortest_maze_route(grid) == -1);
}

static void test_rejects_missing_start_or_goal() {
  CHECK(shortest_maze_route({}) == -1);
  CHECK(shortest_maze_route({"..", ".G"}) == -1);
  CHECK(shortest_maze_route({"S.", ".."}) == -1);
  CHECK(shortest_maze_route({"S..", ".G"}) == -1);
}

static void test_handles_single_corridor() {
  const std::vector<std::string> grid{"S..G"};
  CHECK(shortest_maze_route(grid) == 3);
}

int main() {
  test_shortest_route_exists();
  test_start_is_goal();
  test_unreachable_goal();
  test_rejects_missing_start_or_goal();
  test_handles_single_corridor();
  return REPORT();
}
