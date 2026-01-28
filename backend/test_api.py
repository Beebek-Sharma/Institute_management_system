"""
Simple API Test Script for Institute Management System
Run this after starting the Django server
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name, passed, message=""):
    status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
    print(f"{status}: {name}")
    if message:
        print(f"  {message}")

def test_endpoint(method, endpoint, data=None, auth_token=None):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    
    if auth_token:
        headers['Authorization'] = f'Bearer {auth_token}'
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            headers['Content-Type'] = 'application/json'
            response = requests.post(url, json=data, headers=headers)
        
        return response.status_code, response.json() if response.text else {}
    except Exception as e:
        return 0, str(e)

print("=" * 60)
print("Institute Management System - API Test Suite")
print("=" * 60)
print()

# Check if server is running
print(f"{Colors.BLUE}Checking if server is running...{Colors.END}")
try:
    response = requests.get(f"{BASE_URL}/")
    print_test("Server is running", True, f"Status: {response.status_code}")
except:
    print_test("Server is running", False, "Cannot connect to http://localhost:8000")
    print(f"\n{Colors.YELLOW}Please start the server first:{Colors.END}")
    print("  cd backend")
    print("  python manage.py runserver")
    exit(1)

print()

# Get auth token
print(f"{Colors.BLUE}Authentication{Colors.END}")
print("To run authenticated tests, you need to login first.")
print("Example: python manage.py createsuperuser")
print()

username = input("Enter username (or press Enter to skip auth tests): ")
if username:
    password = input("Enter password: ")
    
    status, data = test_endpoint('POST', '/auth/login/', {
        'username': username,
        'password': password
    })
    
    if status == 200 and 'access' in data:
        auth_token = data['access']
        print_test("Login successful", True)
    else:
        print_test("Login failed", False, str(data))
        auth_token = None
else:
    auth_token = None
    print("Skipping authenticated tests")

print()
print("=" * 60)
print("PHASE 1: ENROLLMENT FEATURES")
print("=" * 60)
print()

# Test Waitlists
status, data = test_endpoint('GET', '/waitlists/', auth_token=auth_token)
print_test("GET /api/waitlists/", status == 200, f"Status: {status}")

# Test Courses
status, data = test_endpoint('GET', '/courses/', auth_token=auth_token)
print_test("GET /api/courses/", status == 200, f"Status: {status}, Count: {data.get('count', 'N/A')}")

# Test Batches
status, data = test_endpoint('GET', '/batches/', auth_token=auth_token)
print_test("GET /api/batches/", status == 200, f"Status: {status}, Count: {data.get('count', 'N/A')}")

# Test Enrollments
status, data = test_endpoint('GET', '/enrollments/', auth_token=auth_token)
print_test("GET /api/enrollments/", status == 200, f"Status: {status}")

print()
print("=" * 60)
print("PHASE 2: BULK OPERATIONS")
print("=" * 60)
print()

# Test Users
status, data = test_endpoint('GET', '/users/', auth_token=auth_token)
print_test("GET /api/users/", status == 200, f"Status: {status}")

print()
print("=" * 60)
print("PHASE 3: PAYMENT & FINANCIAL")
print("=" * 60)
print()

# Test Payment Plans
status, data = test_endpoint('GET', '/payment-plans/', auth_token=auth_token)
print_test("GET /api/payment-plans/", status == 200, f"Status: {status}")

# Test Scholarships
status, data = test_endpoint('GET', '/scholarships/', auth_token=auth_token)
print_test("GET /api/scholarships/", status == 200, f"Status: {status}")

# Test Scholarship Applications
status, data = test_endpoint('GET', '/scholarship-applications/', auth_token=auth_token)
print_test("GET /api/scholarship-applications/", status == 200, f"Status: {status}")

print()
print("=" * 60)
print("PHASE 4: PROGRESS TRACKING")
print("=" * 60)
print()

# Test Assignments
status, data = test_endpoint('GET', '/assignments/', auth_token=auth_token)
print_test("GET /api/assignments/", status == 200, f"Status: {status}")

# Test Exams
status, data = test_endpoint('GET', '/exams/', auth_token=auth_token)
print_test("GET /api/exams/", status == 200, f"Status: {status}")

# Test Progress
status, data = test_endpoint('GET', '/progress/', auth_token=auth_token)
print_test("GET /api/progress/", status == 200, f"Status: {status}")

if auth_token:
    status, data = test_endpoint('GET', '/progress/my_progress/', auth_token=auth_token)
    print_test("GET /api/progress/my_progress/", status == 200, f"Status: {status}")

print()
print("=" * 60)
print("TEST SUITE COMPLETE")
print("=" * 60)
print()
print(f"{Colors.GREEN}All basic endpoint tests completed!{Colors.END}")
print(f"For detailed testing, refer to: {Colors.BLUE}testing_guide.md{Colors.END}")
