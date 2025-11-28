import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import CourseCategory

print("Checking categories...")
categories = CourseCategory.objects.all()
if not categories.exists():
    print("No categories found. Creating default categories...")
    default_categories = ['Programming', 'Design', 'Business', 'Language', 'Science', 'Arts', 'Other']
    for name in default_categories:
        CourseCategory.objects.create(name=name, description=f"{name} courses")
    print("Default categories created.")
else:
    print(f"Found {categories.count()} categories:")
    for cat in categories:
        print(f"{cat.id}: {cat.name}")

print("Done.")
