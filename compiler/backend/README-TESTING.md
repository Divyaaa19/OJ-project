# Testing All 4 Languages in Docker Container

## Prerequisites
1. Make sure Docker Desktop is running
2. Navigate to the `compiler/backend` directory

## Method 1: Build and Test in One Go

```bash
# Build the Docker image
docker build -t oj-compiler .

# Run the container and test all languages
docker run --rm oj-compiler bash -c "chmod +x test-languages.sh && ./test-languages.sh"
```

## Method 2: Interactive Testing

```bash
# Build the Docker image
docker build -t oj-compiler .

# Run container interactively
docker run -it --rm oj-compiler bash

# Inside the container, run the test script
chmod +x test-languages.sh
./test-languages.sh
```

## Method 3: Test Individual Languages

### Test C
```bash
docker run --rm oj-compiler bash -c "
echo '#include <stdio.h>
int main() { printf(\"Hello from C!\"); return 0; }' > test.c &&
gcc -o test_c test.c && ./test_c"
```

### Test C++
```bash
docker run --rm oj-compiler bash -c "
echo '#include <iostream>
int main() { std::cout << \"Hello from C++!\" << std::endl; return 0; }' > test.cpp &&
g++ -o test_cpp test.cpp && ./test_cpp"
```

### Test Java
```bash
docker run --rm oj-compiler bash -c "
echo 'public class Test { public static void main(String[] args) { System.out.println(\"Hello from Java!\"); } }' > Test.java &&
javac Test.java && java Test"
```

### Test Python
```bash
docker run --rm oj-compiler bash -c "
echo 'print(\"Hello from Python!\")' > test.py &&
python3 test.py"
```

## Expected Output

If all languages are working correctly, you should see:

```
=== Testing All Languages in Docker Container ===
1. Testing C...
Hello from C!
C test completed.
2. Testing C++...
Hello from C++!
C++ test completed.
3. Testing Java...
Hello from Java!
Java test completed.
4. Testing Python...
Hello from Python!
Python test completed.
=== All language tests completed! ===
```

## Troubleshooting

### If Docker Desktop is not running:
1. Start Docker Desktop
2. Wait for it to fully load
3. Try the commands again

### If build fails:
1. Check if all packages are available in Alpine Linux
2. Verify the Dockerfile syntax
3. Check Docker logs for specific errors

### If a specific language fails:
1. Check if the compiler/interpreter is properly installed
2. Verify environment variables (especially for Java)
3. Check if the executable path is correct

## Testing Your Application

Once the container is working, you can test your actual application:

```bash
# Run your Node.js application
docker run -p 8000:8000 oj-compiler

# In another terminal, test code submission
curl -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{"language": "cpp", "code": "#include <iostream>\nint main() { std::cout << \"Hello World!\" << std::endl; return 0; }"}'
```