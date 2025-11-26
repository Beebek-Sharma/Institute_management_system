import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from api.models import Course, Enrollment
from rest_framework.test import APIRequestFactory, force_authenticate
from api.views import CourseListCreateView, EnrollmentListCreateView

User = get_user_model()
factory = APIRequestFactory()

def verify_staff_permissions():
    print("Verifying Staff Permissions...")
    
    # Create users
    staff_user, _ = User.objects.get_or_create(username='staff_test', role='staff')
    student_user, _ = User.objects.get_or_create(username='student_test', role='student')
    
    # Test 1: Staff can create course (based on my implementation)
    print("\nTest 1: Staff create course")
    view = CourseListCreateView.as_view()
    request = factory.post('/api/courses/', {
        'name': 'Staff Course',
        'code': 'STAFF101',
        'description': 'Created by staff',
        'schedule': 'Mon 10am',
        'capacity': 20
    })
    force_authenticate(request, user=staff_user)
    response = view(request)
    if response.status_code == 201:
        print("PASS: Staff created course")
    else:
        print(f"FAIL: Staff failed to create course. Status: {response.status_code}, Data: {response.data}")

    # Test 2: Staff can view all enrollments
    print("\nTest 2: Staff view enrollments")
    view = EnrollmentListCreateView.as_view()
    request = factory.get('/api/enrollments/')
    force_authenticate(request, user=staff_user)
    response = view(request)
    if response.status_code == 200:
        print("PASS: Staff viewed enrollments")
    else:
        print(f"FAIL: Staff failed to view enrollments. Status: {response.status_code}")

if __name__ == '__main__':
    try:
        verify_staff_permissions()
    except Exception as e:
        print(f"Error: {e}")
