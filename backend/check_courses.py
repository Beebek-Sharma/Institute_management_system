import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Course

print("Checking courses...")
courses = Course.objects.all()
for course in courses:
    print(f"ID: {course.id}, Type: {type(course.id)}")
    if str(course.id) == ':1':
        print("FOUND COURSE WITH ID :1")

print("Done.")
