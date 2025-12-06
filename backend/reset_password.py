#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import authenticate
from api.models import User

# Try to authenticate
user = authenticate(username='student1', password='student123')
if user:
    print(f"✓ Authentication successful: {user.username}")
else:
    print("✗ Authentication failed with password 'student123'")
    
    # Try to set a known password
    student = User.objects.get(username='student1')
    student.set_password('student123')
    student.save()
    print("✓ Password reset to 'student123'")
    
    # Try again
    user = authenticate(username='student1', password='student123')
    if user:
        print("✓ Authentication now successful")
    else:
        print("✗ Still failed")
