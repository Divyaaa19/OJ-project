#!/bin/bash

echo "=== Testing All Languages in Docker Container ==="

# Test C
echo "1. Testing C..."
cat > test.c << 'EOF'
#include <stdio.h>
int main() {
    printf("Hello from C!\n");
    return 0;
}
EOF
gcc -o test_c test.c
./test_c
echo "C test completed."

# Test C++
echo "2. Testing C++..."
cat > test.cpp << 'EOF'
#include <iostream>
int main() {
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}
EOF
g++ -o test_cpp test.cpp
./test_cpp
echo "C++ test completed."

# Test Java
echo "3. Testing Java..."
cat > Test.java << 'EOF'
public class Test {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}
EOF
javac Test.java
java Test
echo "Java test completed."

# Test Python
echo "4. Testing Python..."
cat > test.py << 'EOF'
print("Hello from Python!")
EOF
python3 test.py
echo "Python test completed."

echo "=== All language tests completed! ==="

# Clean up
rm -f test.c test.cpp test_c test_cpp Test.java Test.class test.py