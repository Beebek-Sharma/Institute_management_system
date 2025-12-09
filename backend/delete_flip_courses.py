
import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Course

def delete_flip_courses():
    print("Searching for courses with 'flip' in the name...")
    courses = Course.objects.filter(name__icontains='flip')
    
    if not courses.exists():
        print("No courses found with 'flip' in the name.")
        return

    count = courses.count()
    print(f"Found {count} course(s). Deleting...")
    
    for course in courses:
        print(f"Deleting course: {course.name} (Code: {course.code})")
        course.delete()
        
    print("Deletion complete.")

if __name__ == '__main__':
    delete_flip_courses()
