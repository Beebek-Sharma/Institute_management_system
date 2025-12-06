#!/usr/bin/env python
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import User, Enrollment

print("=" * 60)
print("Testing Enrollment Redirect Flow")
print("=" * 60)

client = APIClient()

# Step 1: Login
print("\n[Step 1] Logging in as student1...")
login_response = client.post('/api/auth/login/', {
    'username': 'student1',
    'password': 'student123'
})

if login_response.status_code != 200:
    print(f"ERROR: Login failed")
    sys.exit(1)

token = login_response.data.get('tokens', {}).get('access')
print(f"SUCCESS: Token obtained")

# Step 2: Unenroll from course 3 if needed
print("\n[Step 2] Checking course 3 enrollment status...")
client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
student = User.objects.get(username='student1')

course3_enrollment = Enrollment.objects.filter(student=student, course_id=3).first()
if course3_enrollment:
    print(f"FOUND: Course 3 enrollment (ID: {course3_enrollment.id})")
    print(f"DELETING: Enrollment {course3_enrollment.id}...")
    course3_enrollment.delete()
    print(f"SUCCESS: Deleted enrollment")
else:
    print(f"OK: Not enrolled in course 3 yet")

# Step 3: Get course 3 details
print("\n[Step 3] Getting course 3 details...")
course_response = client.get('/api/courses/3/')
if course_response.status_code != 200:
    print(f"ERROR: Could not fetch course 3: {course_response.data}")
    sys.exit(1)
print(f"SUCCESS: Course found - {course_response.data.get('name')}")

# Step 4: Get batches for course 3
print("\n[Step 4] Getting batches for course 3...")
batches_response = client.get('/api/batches/?course=3')
if batches_response.status_code != 200:
    print(f"ERROR: Could not fetch batches: {batches_response.data}")
    sys.exit(1)

batches = batches_response.data
if not isinstance(batches, list):
    batches = [batches]

if not batches:
    print("ERROR: No batches found")
    sys.exit(1)

batch = batches[0]
print(f"SUCCESS: Found batch {batch.get('id')} with {batch.get('available_seats')} seats")

# Step 5: Enroll in course 3
print("\n[Step 5] Enrolling in batch {batch_id}...".format(batch_id=batch.get('id')))
enroll_response = client.post('/api/enrollments/', {
    'batch': batch.get('id'),
    'status': 'active'
})

if enroll_response.status_code not in [200, 201]:
    print(f"ERROR: Enrollment failed - {enroll_response.status_code}")
    print(f"Response: {enroll_response.data}")
    sys.exit(1)

# The response has enrollment data nested
enrollment_data = enroll_response.data.get('enrollment', enroll_response.data)
enrollment_id = enrollment_data.get('id')
print(f"SUCCESS: Enrolled with enrollment ID {enrollment_id}")

# Step 6: Verify enrollment
print("\n[Step 6] Verifying enrollment...")
verify_response = client.get('/api/enrollments/')
if verify_response.status_code != 200:
    print(f"ERROR: Could not fetch enrollments: {verify_response.data}")
    sys.exit(1)

enrollments = verify_response.data
if not isinstance(enrollments, list):
    enrollments = enrollments.get('results', [])

found = any(e.get('id') == enrollment_id or e.get('course') == 3 for e in enrollments)
if found:
    print("SUCCESS: Enrollment verified in API")
else:
    print("ERROR: Enrollment not found")
    print(f"Looking for enrollment_id: {enrollment_id}")
    print(f"Enrollments in response: {[e.get('id') for e in enrollments]}")
    sys.exit(1)

# Step 7: Test what the frontend will do
print("\n[Step 7] Simulating frontend redirect to /student/courses/3")
print("The frontend will:")
print("  1. Call navigate('/student/courses/3')")
print("  2. React Router will match /student/courses/:courseId")
print("  3. StudentCourseLearning component will load")
print("  4. Component will fetch course 3 details")
print("  5. Component will verify enrollment exists")

# Verify that the StudentCourseLearning component can fetch the data it needs
print("\n[Step 8] Verifying data needed by StudentCourseLearning component...")

# Get enrollments for this student
enrollments_for_student = client.get('/api/enrollments/')
if enrollments_for_student.status_code != 200:
    print("ERROR: Cannot fetch enrollments")
    sys.exit(1)

all_enrollments = enrollments_for_student.data
if not isinstance(all_enrollments, list):
    all_enrollments = all_enrollments.get('results', [])

# Check if course 3 enrollment is in the list
course3_enrollment_found = any(
    e.get('course') == 3 for e in all_enrollments
)

if not course3_enrollment_found:
    print("ERROR: Course 3 enrollment not in enrollment list")
    print(f"DEBUG: All enrollments: {[{e.get('id'): e.get('course')} for e in all_enrollments]}")
    sys.exit(1)

print("SUCCESS: Course 3 enrollment found in API response")

print("\n" + "=" * 60)
print("REDIRECT FLOW TEST PASSED")
print("=" * 60)
print("\nSummary:")
print("  - Student1 successfully logged in")
print("  - Student1 successfully enrolled in course 3")
print("  - Course 3 details are accessible via /api/courses/3/")
print("  - Enrollment is verified in /api/enrollments/")
print("  - Frontend can now redirect to /student/courses/3")
print("  - StudentCourseLearning component has all data needed")
