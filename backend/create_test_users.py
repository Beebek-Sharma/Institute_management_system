"""
Create sample users for testing the Institute Management System
Run with: python manage.py shell < create_test_users.py
"""
from django.contrib.auth import get_user_model

User = get_user_model()

# Sample users data
users_data = [
    {
        'username': 'admin',
        'email': 'admin@ims.com',
        'password': 'admin123',
        'role': 'admin',
        'first_name': 'Admin',
        'last_name': 'User',
        'is_staff': True,
        'is_superuser': True
    },
    {
        'username': 'instructor1',
        'email': 'john.doe@ims.com',
        'password': 'instructor123',
        'role': 'instructor',
        'first_name': 'John',
        'last_name': 'Doe',
        'phone': '555-0101'
    },
    {
        'username': 'instructor2',
        'email': 'jane.smith@ims.com',
        'password': 'instructor123',
        'role': 'instructor',
        'first_name': 'Jane',
        'last_name': 'Smith',
        'phone': '555-0102'
    },
    {
        'username': 'student1',
        'email': 'alice@student.com',
        'password': 'student123',
        'role': 'student',
        'first_name': 'Alice',
        'last_name': 'Wonder',
        'phone': '555-0201'
    },
    {
        'username': 'student2',
        'email': 'bob@student.com',
        'password': 'student123',
        'role': 'student',
        'first_name': 'Bob',
        'last_name': 'Builder',
        'phone': '555-0202'
    }
]

print("Creating test users...")
print("=" * 60)

for user_data in users_data:
    username = user_data['username']
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        print(f"⚠️  User '{username}' already exists, skipping...")
        continue
    
    # Create user
    password = user_data.pop('password')
    is_superuser = user_data.pop('is_superuser', False)
    is_staff = user_data.pop('is_staff', False)
    
    user = User.objects.create_user(**user_data)
    user.set_password(password)
    user.is_superuser = is_superuser
    user.is_staff = is_staff
    user.save()
    
    print(f"✅ Created {user_data['role']:12} | {username:15} | password: {password}")

print("=" * 60)
print("\n✨ Test users created successfully!")
print("\nYou can now login with:")
print("  Admin:      admin / admin123")
print("  Instructor: instructor1 / instructor123")
print("  Student:    student1 / student123")
