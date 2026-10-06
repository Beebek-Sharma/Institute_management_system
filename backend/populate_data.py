"""
Script to populate the database with sample data for testing and development.
Run with: python populate_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from decimal import Decimal
from django.contrib.auth import get_user_model
from api.models import Course, Batch, Enrollment, Payment

User = get_user_model()

print("Creating sample users...")

admin_user, _ = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@example.com',
        'first_name': 'System',
        'last_name': 'Administrator',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
    }
)
admin_user.set_password('admin123')
admin_user.role = 'admin'
admin_user.is_staff = True
admin_user.is_superuser = True
admin_user.save()
print("[OK] Admin user created/updated: admin")

instructor1, _ = User.objects.get_or_create(
    username='john_doe',
    defaults={
        'email': 'john@example.com',
        'first_name': 'John',
        'last_name': 'Doe',
        'role': 'instructor',
    }
)
instructor1.set_password('instructor123')
instructor1.role = 'instructor'
instructor1.save()
print("[OK] Instructor created/updated: john_doe")

instructor2, _ = User.objects.get_or_create(
    username='jane_smith',
    defaults={
        'email': 'jane@example.com',
        'first_name': 'Jane',
        'last_name': 'Smith',
        'role': 'instructor',
    }
)
instructor2.set_password('instructor123')
instructor2.role = 'instructor'
instructor2.save()
print("[OK] Instructor created/updated: jane_smith")

student1, _ = User.objects.get_or_create(
    username='alice_wonder',
    defaults={
        'email': 'alice@example.com',
        'first_name': 'Alice',
        'last_name': 'Wonder',
        'role': 'student',
    }
)
student1.set_password('student123')
student1.role = 'student'
student1.save()
print("[OK] Student created/updated: alice_wonder")

student2, _ = User.objects.get_or_create(
    username='bob_builder',
    defaults={
        'email': 'bob@example.com',
        'first_name': 'Bob',
        'last_name': 'Builder',
        'role': 'student',
    }
)
student2.set_password('student123')
student2.role = 'student'
student2.save()
print("[OK] Student created/updated: bob_builder")

print("\nCreating courses...")

courses_data = [
    {
        'code': 'CS101',
        'name': 'Introduction to Python Programming',
        'description': 'Learn the fundamentals of Python programming including data types, control structures, and functions.',
        'instructor': instructor1,
        'schedule_description': 'Mon/Wed 10:00-12:00',
        'duration_weeks': 12,
        'credits': 3,
        'max_capacity': 30,
        'fee': Decimal('15000.00'),
    },
    {
        'code': 'CS201',
        'name': 'Web Development with Django',
        'description': 'Build modern web applications using Django framework and REST APIs.',
        'instructor': instructor1,
        'schedule_description': 'Tue/Thu 14:00-16:00',
        'duration_weeks': 16,
        'credits': 4,
        'max_capacity': 25,
        'fee': Decimal('20000.00'),
    },
    {
        'code': 'CS102',
        'name': 'Data Structures and Algorithms',
        'description': 'Master essential data structures and algorithms for efficient programming.',
        'instructor': instructor2,
        'schedule_description': 'Mon/Wed 14:00-16:00',
        'duration_weeks': 14,
        'credits': 4,
        'max_capacity': 35,
        'fee': Decimal('18000.00'),
    },
    {
        'code': 'CS202',
        'name': 'Database Management Systems',
        'description': 'Learn database design, SQL, and database administration.',
        'instructor': instructor2,
        'schedule_description': 'Tue/Thu 10:00-12:00',
        'duration_weeks': 12,
        'credits': 3,
        'max_capacity': 30,
        'fee': Decimal('16000.00'),
    },
]

courses = {}
batches = {}
for cdata in courses_data:
    code = cdata.pop('code')
    course, _ = Course.objects.update_or_create(code=code, defaults=cdata)
    courses[code] = course
    batch, _ = Batch.objects.get_or_create(
        course=course,
        batch_number='Batch-1',
        defaults={
            'capacity': course.max_capacity,
            'instructor': course.instructor,
            'is_active': True,
        }
    )
    batches[code] = batch
    print(f"[OK] Course & Batch created/updated: {course.code} - {course.name}")

print("\nCreating enrollments...")
enrollments_data = [
    (student1, courses['CS101'], batches['CS101'], 'active'),
    (student1, courses['CS201'], batches['CS201'], 'active'),
    (student2, courses['CS101'], batches['CS101'], 'active'),
    (student2, courses['CS102'], batches['CS102'], 'pending'),
]

enrollments = []
for student, course, batch, status in enrollments_data:
    enrollment, _ = Enrollment.objects.get_or_create(
        student=student,
        course=course,
        batch=batch,
        defaults={'status': status}
    )
    enrollments.append(enrollment)
    print(f"[OK] Enrollment created/updated: {student.username} -> {course.code}")

for course in courses.values():
    course.enrolled_count = Enrollment.objects.filter(course=course, status='active').count()
    course.save()

print("\nCreating payments...")
payments_data = [
    (enrollments[0], Decimal('15000.00'), 'completed', 'esewa', 'TXN001'),
    (enrollments[1], Decimal('20000.00'), 'completed', 'khalti', 'TXN002'),
    (enrollments[2], Decimal('15000.00'), 'pending', 'bank_transfer', 'TXN003'),
]

for enrollment, amount, status, method, txn in payments_data:
    Payment.objects.update_or_create(
        enrollment=enrollment,
        defaults={
            'amount': amount,
            'status': status,
            'payment_method': method,
            'transaction_id': txn,
        }
    )
    print(f"[OK] Payment recorded: NPR {amount} for {enrollment.student.username} ({status})")

print("\nSample data populated successfully!")
print("=" * 50)
print("Admin:      admin / admin123")
print("Instructor: john_doe / instructor123")
print("Instructor: jane_smith / instructor123")
print("Student:    alice_wonder / student123")
print("Student:    bob_builder / student123")
print("=" * 50)
