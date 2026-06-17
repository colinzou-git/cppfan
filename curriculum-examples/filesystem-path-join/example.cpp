// Positive example for cpp.utilities.file_io.lesson.
// Build paths with std::filesystem::path and operator/ rather than hand-concatenating
// strings — it inserts the platform separator for you. generic_string() prints with
// '/' on every OS, so this output is portable.
#include <filesystem>
#include <iostream>

namespace fs = std::filesystem;

int main() {
    fs::path dir = "logs";
    fs::path full = dir / "app.txt";
    std::cout << full.generic_string() << "\n";
    return 0;
}
