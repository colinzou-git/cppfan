// Positive example for cpp.functions.declarations_definitions.lesson.
// The declaration is enough for main to call area; the definition supplies the body.
#include <iostream>

int area(int width, int height);

int main() {
    std::cout << area(3, 4) << "\n";
    return 0;
}

int area(int width, int height) {
    return width * height;
}
