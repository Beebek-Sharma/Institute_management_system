# Institute Management System

A full-stack institute management platform for managing physical and hybrid educational operations. It combines a Django REST Framework API with a React frontend and role-based workflows for administrators, staff, instructors, and students.

## Highlights

- JWT authentication and role-based access control
- Admin, Staff, Instructor, and Student workflows
- Course, batch, schedule, and enrollment management
- Attendance tracking
- Payment recording and verification workflows
- Certificates, assignments, exams, waitlists, scholarships, and payment plans
- Notifications and announcements
- Activity/audit logging
- Search, filtering, ordering, and bulk operations
- React dashboard with separate role-based views
- Django admin for backend administration

## Architecture

```text
Institute Management System
├── backend/     Django + Django REST Framework API
└── frontend/    React + Vite client application
```

### Backend

- Django 5.2
- Django REST Framework
- SimpleJWT
- django-filter
- SQLite for local development
- PostgreSQL-ready architecture

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Radix UI
- Framer Motion

## Local development

### 1. Backend

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

Backend: `http://127.0.0.1:8000/`

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env  # Windows
# cp .env.example .env # macOS/Linux
npm run dev
```

Frontend: `http://localhost:5173/`

## Environment variables

Secrets and environment-specific configuration belong in `.env` files and must never be committed. Safe `.env.example` templates are included for both backend and frontend.

## Project structure

```text
backend/
├── api/
│   ├── models.py
│   ├── serializers.py
│   ├── permissions.py
│   ├── views.py
│   ├── migrations/
│   └── urls.py
├── backend/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── manage.py
└── requirements.txt

frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   └── pages/
├── public/
├── package.json
└── vite.config.js
```

## Production notes

Before deployment, configure a strong `DJANGO_SECRET_KEY`, `DEBUG=False`, production `ALLOWED_HOSTS`, HTTPS, a production database, secure CORS/CSRF origins, email credentials, and payment/SMS credentials where required.

This repository is intended as a portfolio and development project; it should be security-reviewed and configured separately before use with real student or payment data.

## License

See the repository license and project documentation for usage terms.
