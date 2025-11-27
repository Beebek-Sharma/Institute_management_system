"""
Script to populate the database with sample data for testing
Run with: python manage.py shell < populate_data.py
"""
from api.models import User, Course, Enrollment, Payment
from django.contrib.auth import get_user_model
from decimal import Decimal

User = get_user_model()

# Create sample users (removed)

# Create sample courses
print("\nCreating courses...")

course1 = Course.objects.create(
    name='Introduction to Python Programming',
    code='CS101',
    description='Learn the fundamentals of Python programming including data types, control structures, and functions.',
    instructor=instructor1,
    schedule='Mon/Wed 10:00-12:00',
    duration_weeks=12,
    credits=3,
    capacity=30,
    enrolled_count=0
)
print(f"✓ Course created: {course1.code}")

course2 = Course.objects.create(
    name='Web Development with Django',
    code='CS201',
    description='Build modern web applications using Django framework and REST APIs.',
    instructor=instructor1,
    schedule='Tue/Thu 14:00-16:00',
    duration_weeks=16,
    credits=4,
    capacity=25,
    enrolled_count=0
)
print(f"✓ Course created: {course2.code}")

course3 = Course.objects.create(
    name='Data Structures and Algorithms',
    code='CS102',
    description='Master essential data structures and algorithms for efficient programming.',
    instructor=instructor2,
    schedule='Mon/Wed 14:00-16:00',
    duration_weeks=14,
    credits=4,
    capacity=35,
    enrolled_count=0
)
print(f"✓ Course created: {course3.code}")

course4 = Course.objects.create(
    name='Database Management Systems',
    code='CS202',
    description='Learn database design, SQL, and database administration.',
    instructor=instructor2,
    schedule='Tue/Thu 10:00-12:00',
    duration_weeks=12,
    credits=3,
    capacity=30,
    enrolled_count=0
)
print(f"✓ Course created: {course4.code}")

# Create sample enrollments
print("\nCreating enrollments...")

enrollment1 = Enrollment.objects.create(
    student=student1,
    course=course1,
    status='active'
)
course1.enrolled_count += 1
course1.save()
print(f"✓ Enrollment created: {student1.username} -> {course1.code}")

enrollment2 = Enrollment.objects.create(
    student=student1,
    course=course2,
    status='active'
)
course2.enrolled_count += 1
course2.save()
print(f"✓ Enrollment created: {student1.username} -> {course2.code}")

enrollment3 = Enrollment.objects.create(
    student=student2,
    course=course1,
    status='active'
)
course1.enrolled_count += 1
course1.save()
print(f"✓ Enrollment created: {student2.username} -> {course1.code}")

enrollment4 = Enrollment.objects.create(
    student=student2,
    course=course3,
    status='pending'
)
course3.enrolled_count += 1
course3.save()
print(f"✓ Enrollment created: {student2.username} -> {course3.code}")

# Create sample payments
print("\nCreating payments...")

payment1 = Payment.objects.create(
    enrollment=enrollment1,
    amount=Decimal('299.99'),
    status='completed',
    payment_method='Credit Card',
    transaction_id='TXN001'
)
print(f"✓ Payment created: ${payment1.amount} for {enrollment1.student.username}")

payment2 = Payment.objects.create(
    enrollment=enrollment2,
    amount=Decimal('399.99'),
    status='completed',
    payment_method='PayPal',
    transaction_id='TXN002'
)
print(f"✓ Payment created: ${payment2.amount} for {enrollment2.student.username}")

payment3 = Payment.objects.create(
    enrollment=enrollment3,
    amount=Decimal('299.99'),
    status='pending',
    payment_method='Bank Transfer'
)
print(f"✓ Payment created: ${payment3.amount} for {enrollment3.student.username}")

print("\n✅ Sample data created successfully!")
print("\nTest Accounts:")
print("=" * 50)
print("Admin:      username: admin         password: admin123")
print("Instructor: username: john_doe      password: instructor123")
print("Instructor: username: jane_smith    password: instructor123")
print("Student:    username: alice_wonder  password: student123")
print("Student:    username: bob_builder   password: student123")
print("=" * 50)
