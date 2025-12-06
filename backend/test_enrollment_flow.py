#!/usr/bin/env python
"""
Test script to verify the enrollment flow works correctly
"""
import os
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import authenticate
from rest_framework.test import APIClient
from api.models import User, Course, Enrollment

def test_enrollment_flow():
    """Test the complete enrollment flow"""
    
    client = APIClient()
    
    print("=" * 60)
    print("Testing Enrollment Flow")
    print("=" * 60)
    
    # Step 1: Get JWT token
    print("\n1. Getting JWT token for student1...")
    login_response = client.post('/api/auth/login/', {
        'username': 'student1',
        'password': 'student123'
    })
    
    if login_response.status_code != 200:
        print(f"   ✗ Login failed: {login_response.data}")
        return False
    
    token = login_response.data.get('tokens', {}).get('access')
    if not token:
        print("   ✗ No token received")
        print(f"   Response: {login_response.data}")
        return False
    
    print(f"   ✓ Token obtained")
    
    # Set token for authenticated requests
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    # Step 2: Get available courses
    print("\n2. Fetching available courses...")
    courses_response = client.get('/api/courses/')
    
    if courses_response.status_code != 200:
        print(f"   ✗ Course fetch failed: {courses_response.data}")
        return False
    
    courses = courses_response.data
    if isinstance(courses, dict) and 'results' in courses:
        courses = courses['results']
    
    available_courses = [c for c in courses if isinstance(c, dict) and 'id' in c]
    print(f"   ✓ Found {len(available_courses)} courses")
    
    if not available_courses:
        print("   ✗ No courses available")
        return False
    
    # Step 3: Check current enrollments
    print("\n3. Checking current enrollments...")
    enrollments_response = client.get('/api/enrollments/')
    
    if enrollments_response.status_code != 200:
        print(f"   ✗ Enrollment fetch failed: {enrollments_response.data}")
        return False
    
    enrollments = enrollments_response.data
    if isinstance(enrollments, dict) and 'results' in enrollments:
        enrollments = enrollments['results']
    
    current_enrollments = len(enrollments)
    print(f"   ✓ Current enrollments: {current_enrollments}")
    
    # Pick a course to enroll in - try one that student1 is not already enrolled in
    test_course = None
    print(f"\n   Checking courses for non-enrolled options...")
    enrolled_ids = [e.get('course') for e in enrollments]
    print(f"   Enrolled course IDs: {enrolled_ids}")
    
    for c in available_courses:
        c_id = c.get('id')
        c_name = c.get('name', 'Unknown')
        is_enrolled = c_id in enrolled_ids
        print(f"   - Course {c_id} ({c_name}): {'ENROLLED' if is_enrolled else 'FREE'}")
        if not is_enrolled:
            test_course = c
            break
    
    if not test_course:
        # All courses are already enrolled, use the first one to test duplicate handling
        test_course = available_courses[0]
    
    course_id = test_course.get('id')
    course_name = test_course.get('name', 'Unknown')
    
    print(f"   Selected course: {course_name} (ID: {course_id})")
    
    # Check if already enrolled in this specific course
    already_enrolled = any(
        e.get('course') == course_id for e in enrollments
    )
    
    if already_enrolled:
        print(f"   ℹ Already enrolled in this course - testing duplicate enrollment prevention")
    
    # Step 4: Get available batches for the course
    print(f"\n4. Getting available batches for course {course_id}...")
    batches_response = client.get(f'/api/batches/?course={course_id}')
    
    if batches_response.status_code != 200:
        print(f"   ✗ Failed to fetch batches: {batches_response.data}")
        return False
    
    available_batches = batches_response.data
    if isinstance(available_batches, dict) and 'results' in available_batches:
        available_batches = available_batches['results']
    
    if not available_batches:
        print(f"   ✗ No batches available for course {course_id}")
        return False
    
    available_batch = available_batches[0]
    batch_id = available_batch.get('id')
    print(f"   ✓ Found batch {batch_id} with {available_batch.get('available_seats', 0)} available seats")
    
    # Step 5: Enroll in the batch
    print(f"\n5. Enrolling in batch {batch_id}...")
    enroll_data = {
        'batch': batch_id,
        'status': 'active'
    }
    
    enroll_response = client.post('/api/enrollments/', enroll_data)
    
    if enroll_response.status_code not in [200, 201]:
        print(f"   ✗ Enrollment failed: {enroll_response.status_code}")
        print(f"   Response: {enroll_response.data}")
        return False
    
    enrollment_id = enroll_response.data.get('id')
    print(f"   ✓ Enrollment successful (ID: {enrollment_id})")
    
    # Step 6: Verify enrollment was created
    print("\n6. Verifying enrollment...")
    verify_response = client.get('/api/enrollments/')
    
    if verify_response.status_code != 200:
        print(f"   ✗ Verification failed: {verify_response.data}")
        return False
    
    new_enrollments = verify_response.data
    if isinstance(new_enrollments, dict) and 'results' in new_enrollments:
        new_enrollments = new_enrollments['results']
    
    verified = any(
        e.get('id') == enrollment_id
        for e in new_enrollments
    )
    
    if verified:
        print(f"   ✓ Enrollment verified in API")
    else:
        print(f"   ✗ Enrollment not found in list")
        return False
    
    # Step 7: Test navigation target
    print(f"\n7. Testing StudentCourseLearning endpoint...")
    course_learning_url = f'/api/courses/{course_id}/'
    course_response = client.get(course_learning_url)
    
    if course_response.status_code == 200:
        print(f"   ✓ Course details available at {course_learning_url}")
    else:
        print(f"   ✗ Course endpoint returned {course_response.status_code}")
        return False
    
    print("\n" + "=" * 60)
    print("✓ ALL TESTS PASSED - Enrollment flow is working!")
    print("=" * 60)
    print(f"\nSummary:")
    print(f"  - Successfully logged in as student1")
    print(f"  - Found {len(available_courses)} available courses")
    print(f"  - Enrolled in course: {course_name} (ID: {course_id})")
    print(f"  - Enrollment ID: {enrollment_id}")
    print(f"  - Verified enrollment in API")
    print(f"  - Course data accessible for StudentCourseLearning page")
    print(f"\nFrontend should now be able to:")
    print(f"  1. Click 'Enroll' on course {course_id}")
    print(f"  2. Navigate to /student/courses/{course_id}")
    print(f"  3. Display StudentCourseLearning component with course details")
    
    return True

if __name__ == '__main__':
    test_enrollment_flow()
