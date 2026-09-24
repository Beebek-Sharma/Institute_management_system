# Institute Management System — Backend

Django REST Framework backend for a physical institute management platform.

## Features

- JWT authentication
- Role-based access control for Admin, Staff, Instructor, and Student
- Course and batch management
- Schedules and attendance
- Enrollment management
- Payments and verification workflows
- Notifications and announcements
- Audit/activity logging
- Password reset and email verification support
- Filtering, search, and ordering

## Local setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\\Scripts\\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env  # Windows
# cp .env.example .env # macOS/Linux
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API is available at `http://127.0.0.1:8000/`.

Never commit `.env`, database files, uploaded media, or production credentials.
