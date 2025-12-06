#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import User

client = APIClient()

# Get token for student1
user = User.objects.get(username='student1')
refresh = RefreshToken.for_user(user)
token = str(refresh.access_token)

# Set credentials
client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

# Test batches endpoint
print("Testing /api/batches/?course=6")
response = client.get('/api/batches/?course=6')
print(f"Status: {response.status_code}")
print(f"Response: {response.data}")
