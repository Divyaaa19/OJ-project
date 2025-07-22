Write-Host "=== Testing All Languages in Docker Container ===" -ForegroundColor Green

# Test C
Write-Host "1. Testing C..." -ForegroundColor Yellow
@"
#include <stdio.h>
int main() {
    printf("Hello from C!\n");
    return 0;
}
"@ | Out-File -FilePath "test.c" -Encoding ASCII
gcc -o test_c.exe test.c
./test_c.exe
Write-Host "C test completed." -ForegroundColor Green

# Test C++
Write-Host "2. Testing C++..." -ForegroundColor Yellow
@"
#include <iostream>
int main() {
    std::cout << "Hello from C++!" << std::endl;
    return 0;
}
"@ | Out-File -FilePath "test.cpp" -Encoding ASCII
g++ -o test_cpp.exe test.cpp
./test_cpp.exe
Write-Host "C++ test completed." -ForegroundColor Green

# Test Java
Write-Host "3. Testing Java..." -ForegroundColor Yellow
@"
public class Test {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}
"@ | Out-File -FilePath "Test.java" -Encoding ASCII
javac Test.java
java Test
Write-Host "Java test completed." -ForegroundColor Green

# Test Python
Write-Host "4. Testing Python..." -ForegroundColor Yellow
@"
print("Hello from Python!")
"@ | Out-File -FilePath "test.py" -Encoding ASCII
python test.py
Write-Host "Python test completed." -ForegroundColor Green

Write-Host "=== All language tests completed! ===" -ForegroundColor Green

# Clean up
Remove-Item -Path "test.c", "test.cpp", "test_c.exe", "test_cpp.exe", "Test.java", "Test.class", "test.py" -ErrorAction SilentlyContinue