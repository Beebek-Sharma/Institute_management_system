"""
Quick verification script to check enrollment functionality
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'institute_management.settings')
django.setup()

from api.models import Course, Batch, User, Enrollment

print("=" * 60)
print("ENROLLMENT SYSTEM STATUS CHECK")
print("=" * 60)

# Count records
courses = Course.objects.filter(is_active=True)
batches = Batch.objects.filter(is_active=True)
students = User.objects.filter(role='student', is_active=True)
enrollments = Enrollment.objects.all()

print(f"\n📚 Active Courses: {courses.count()}")
print(f"📦 Active Batches: {batches.count()}")
print(f"👨‍🎓 Active Students: {students.count()}")
print(f"✅ Total Enrollments: {enrollments.count()}")

# Check for courses with batches
print("\n" + "=" * 60)
print("COURSES WITH BATCHES")
print("=" * 60)

for course in courses[:5]:  # Show first 5
    course_batches = batches.filter(course=course)
    print(f"\n📖 {course.name} ({course.code})")
    print(f"   Batches: {course_batches.count()}")
    for batch in course_batches:
        print(f"   - Batch {batch.batch_number}: {batch.enrolled_count}/{batch.capacity} enrolled, {batch.available_seats} available")

# Check for a student to test with
print("\n" + "=" * 60)
print("SAMPLE STUDENT FOR TESTING")
print("=" * 60)

test_student = students.first()
if test_student:
    print(f"\n👤 Student: {test_student.username} ({test_student.email})")
    student_enrollments = enrollments.filter(student=test_student)
    print(f"   Current Enrollments: {student_enrollments.count()}")
    for enrollment in student_enrollments:
        print(f"   - {enrollment.batch.course.name} (Batch {enrollment.batch.batch_number}) - Status: {enrollment.status}")
else:
    print("\n⚠️  No students found in database")

print("\n" + "=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)
