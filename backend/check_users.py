import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User

print("=" * 50)
print("DATABASE USERS")
print("=" * 50)

users = User.objects.all()
print(f"\nTotal users: {users.count()}\n")

if users.count() > 0:
    for u in users[:15]:
        print(f"Email: {u.email}")
        print(f"  Username: {u.username}")
        print(f"  Role: {u.role}")
        print(f"  Active: {u.is_active}")
        print(f"  Has usable password: {u.has_usable_password()}")
        print()
else:
    print("No users found in database!")
    print("\nTo create a test user, run:")
    print("python manage.py shell")
    print("Then:")
    print("from api.models import User")
    print("User.objects.create_user(username='test', email='test@test.com', password='test123', role='student')")
