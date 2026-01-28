#!/bin/bash
# Automated Testing Script for Institute Management System
# Run this script to test all 4 phases

BASE_URL="http://localhost:8000/api"
TOKEN=""

echo "========================================="
echo "Institute Management System - Test Suite"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
    fi
}

# Get authentication token (you'll need to login first)
echo "Step 1: Authentication"
echo "Please login first to get your token"
echo "Run: curl -X POST $BASE_URL/auth/login/ -H 'Content-Type: application/json' -d '{\"username\":\"your_username\",\"password\":\"your_password\"}'"
echo ""
read -p "Enter your access token: " TOKEN

if [ -z "$TOKEN" ]; then
    echo "No token provided. Exiting..."
    exit 1
fi

AUTH_HEADER="Authorization: Bearer $TOKEN"

echo ""
echo "========================================="
echo "PHASE 1: ENROLLMENT FEATURES"
echo "========================================="
echo ""

# Test 1.1: List Waitlists
echo "Test 1.1: List Waitlists"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/waitlists/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "List waitlists"
else
    print_result 1 "List waitlists (HTTP $http_code)"
fi
echo ""

# Test 1.2: Check Prerequisites
echo "Test 1.2: Check Prerequisites (requires course_id and student_id)"
echo "Skipping - requires specific IDs"
echo ""

# Test 1.3: Get My Schedule
echo "Test 1.3: Get My Schedule"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/enrollments/my_schedule/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "Get my schedule"
else
    print_result 1 "Get my schedule (HTTP $http_code)"
fi
echo ""

echo "========================================="
echo "PHASE 2: BULK OPERATIONS"
echo "========================================="
echo ""

# Test 2.1: Get CSV Template
echo "Test 2.1: Download CSV Template"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/csv_template/" -H "$AUTH_HEADER" -o /dev/null)
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "Download CSV template"
else
    print_result 1 "Download CSV template (HTTP $http_code)"
fi
echo ""

# Test 2.2: List Users
echo "Test 2.2: List Users"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "List users"
else
    print_result 1 "List users (HTTP $http_code)"
fi
echo ""

echo "========================================="
echo "PHASE 3: PAYMENT & FINANCIAL"
echo "========================================="
echo ""

# Test 3.1: List Payment Plans
echo "Test 3.1: List Payment Plans"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/payment-plans/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "List payment plans"
else
    print_result 1 "List payment plans (HTTP $http_code)"
fi
echo ""

# Test 3.2: List Scholarships
echo "Test 3.2: List Scholarships"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/scholarships/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "List scholarships"
else
    print_result 1 "List scholarships (HTTP $http_code)"
fi
echo ""

# Test 3.3: List Scholarship Applications
echo "Test 3.3: List Scholarship Applications"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/scholarship-applications/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "List scholarship applications"
else
    print_result 1 "List scholarship applications (HTTP $http_code)"
fi
echo ""

echo "========================================="
echo "PHASE 4: PROGRESS TRACKING"
echo "========================================="
echo ""

# Test 4.1: List Assignments
echo "Test 4.1: List Assignments"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/assignments/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "List assignments"
else
    print_result 1 "List assignments (HTTP $http_code)"
fi
echo ""

# Test 4.2: List Exams
echo "Test 4.2: List Exams"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/exams/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "List exams"
else
    print_result 1 "List exams (HTTP $http_code)"
fi
echo ""

# Test 4.3: Get My Progress
echo "Test 4.3: Get My Progress"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/progress/my_progress/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "Get my progress"
    body=$(echo "$response" | head -n-1)
    echo "Response: $body" | head -c 200
    echo "..."
else
    print_result 1 "Get my progress (HTTP $http_code)"
fi
echo ""

# Test 4.4: List Progress Records
echo "Test 4.4: List All Progress Records"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/progress/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "List progress records"
else
    print_result 1 "List progress records (HTTP $http_code)"
fi
echo ""

echo "========================================="
echo "GENERAL API TESTS"
echo "========================================="
echo ""

# Test: List Courses
echo "Test: List Courses"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/courses/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "List courses"
else
    print_result 1 "List courses (HTTP $http_code)"
fi
echo ""

# Test: List Batches
echo "Test: List Batches"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/batches/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "List batches"
else
    print_result 1 "List batches (HTTP $http_code)"
fi
echo ""

# Test: List Enrollments
echo "Test: List Enrollments"
response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/enrollments/" -H "$AUTH_HEADER")
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    print_result 0 "List enrollments"
else
    print_result 1 "List enrollments (HTTP $http_code)"
fi
echo ""

echo "========================================="
echo "TEST SUITE COMPLETE"
echo "========================================="
echo ""
echo "All basic endpoint tests completed!"
echo "For detailed testing, refer to the testing_guide.md"
