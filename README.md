# Institute Management System

A comprehensive **Django REST API** for managing a **physical, on-site educational institute** with:

- ✅ 4 user roles (Admin, Staff, Instructor, Student) with complete RBAC
- ✅ Physical class management (batches, schedules, rooms, attendance)
- ✅ Multi-method payment system (Nepal payment methods: Esewa, Khalti, PhonePay, Bank Transfer, Cash)
- ✅ Enrollment management (student-to-batch linking)
- ✅ Attendance tracking (per class session)
- ✅ Notification system (in-app, email, SMS ready)
- ✅ Activity audit logs (security and compliance)
- ✅ 50+ API endpoints with JWT authentication
- ✅ Django admin interface for all operations

**Not an online learning platform** - Built for physical, on-site institute operations.

---

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd backend
python manage.py runserver
```
Backend runs on: `http://localhost:8000`

### 2. Access Django Admin
```
URL: http://localhost:8000/admin/
Credentials: Your superuser account
```

### 3. Test API
```bash
# Register student
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{...}'

# List courses
curl http://localhost:8000/api/courses/
```

See **QUICK_START_GUIDE.md** for complete examples.

---

## 📊 System Architecture

### Database Layer (10 Models)
```
User (Authentication)
├── Student (role='student')
├── Instructor (role='instructor')
├── Staff (role='staff')
└── Admin (role='admin')

Course Management
├── CourseCategory
├── Course
├── Batch (physical sections)
└── Schedule (class times & rooms)

Operations
├── Enrollment (student-batch linking)
├── Payment (multi-method support)
├── Attendance (per class tracking)
├── Notification (multi-channel alerts)
└── ActivityLog (audit trail)
```

### API Layer (50+ Endpoints)
```
✅ Authentication (register, login, logout, token refresh)
✅ Users (create, read, update, delete - admin/staff only)
✅ Courses (CRUD - admin only)
✅ Batches (create, list, manage - admin/staff)
✅ Schedules (create, list - admin/staff)
✅ Enrollments (create, list, view - role-filtered)
✅ Payments (record, verify, list - role-filtered)
✅ Attendance (mark, view - role-filtered)
✅ Notifications (read-only, mark as read)
✅ Activity Logs (admin only)
```

---

## 👥 User Roles & Permissions

### ADMIN - Full Access
✅ Create/delete users (Admin, Staff, Instructor, Student)
✅ Manage all courses and batches
✅ Create schedules and manage classes
✅ View all enrollments and students
✅ View and verify all payments
✅ View activity logs and audit trail
✅ Manage system settings

### STAFF - Operations Management
✅ Create Student and Instructor accounts
✅ View all users (students and instructors)
✅ Manage student registrations
✅ Create batches and schedules
✅ Handle offline payments (cash, bank)
✅ Verify payment receipts
❌ Cannot create/delete Admin or Staff
❌ Cannot access high-level financial dashboards

### INSTRUCTOR - Class Management
✅ View assigned courses
✅ See students in their batches
✅ Mark attendance for classes
✅ View class schedule
✅ Send announcements to students
✅ View students' attendance and grades
❌ Cannot manage payments
❌ Cannot create or delete users
❌ Cannot modify courses

### STUDENT - Self Service
✅ Register and login
✅ View available courses
✅ See enrolled batches
✅ Make payments (online or staff-assisted)
✅ View own attendance
✅ Download payment receipts
✅ Receive notifications
❌ Cannot create users
❌ Cannot modify courses
❌ Cannot see other students' data

---

## 💳 Payment Methods Supported

| Method | Type | Status |
|--------|------|--------|
| **Esewa** | Online | Ready for API integration |
| **Khalti** | Online | Ready for API integration |
| **PhonePay** | Online | Ready for API integration |
| **Bank Transfer** | Manual | Verified by staff |
| **Cash** | Manual | Entered by staff/admin |

Payment states: `pending` → `completed`/`failed`/`verified`/`refunded`

---

## 📁 Project Structure

```
Institute Management System/
├── backend/                      # Django REST API
│   ├── api/
│   │   ├── models.py            # 10 database models
│   │   ├── serializers.py       # 13 serializers with RBAC
│   │   ├── views.py             # 10 ViewSets (50+ endpoints)
│   │   ├── permissions.py       # 13 permission classes
│   │   ├── urls.py              # API routing
│   │   ├── admin.py             # Django admin config
│   │   ├── migrations/          # Database migrations
│   │   └── tests.py
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── db.sqlite3
│
├── frontend/                     # React + Tailwind (Upcoming)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── api/
│   ├── package.json
│   └── vite.config.js
│
├── PHASE_1_COMPLETION_SUMMARY.md # What's implemented
├── SYSTEM_IMPLEMENTATION_GUIDE.md # Architecture details
├── QUICK_START_GUIDE.md          # Testing & API examples
├── DATABASE_SCHEMA.md            # Model relationships
└── README.md                     # This file
```

---

## 🔐 Security Features

✅ **JWT Authentication** - 1-hour access tokens, 7-day refresh
✅ **Role-Based Access Control** - 13 permission classes
✅ **Password Security** - Hashed with PBKDF2
✅ **Activity Audit Trail** - All sensitive actions logged
✅ **Field-Level Security** - Different fields per role
✅ **SQL Injection Protection** - ORM-based queries
✅ **CSRF Protection** - Django middleware
✅ **CORS Configured** - localhost:3000 for React

---

## 📊 API Endpoints (Examples)

### Authentication
```
POST   /api/auth/register/          Register (student only)
POST   /api/auth/login/             Login (all roles)
POST   /api/auth/logout/            Logout
GET    /api/auth/profile/           Get current profile
PATCH  /api/auth/profile/update/    Update profile
```

### Courses (Admin)
```
GET    /api/courses/                List all courses
POST   /api/courses/                Create course
GET    /api/courses/{id}/           Get course details
PUT    /api/courses/{id}/           Update course
DELETE /api/courses/{id}/           Delete course
```

### Batches (Admin/Staff)
```
GET    /api/batches/                List batches
POST   /api/batches/                Create batch
GET    /api/batches/{id}/           Get batch
GET    /api/batches/{id}/enrollments/  Get batch students
```

### Enrollments (Role-Filtered)
```
GET    /api/enrollments/            List enrollments
POST   /api/enrollments/            Enroll student (Admin/Staff)
GET    /api/enrollments/{id}/       Get enrollment details
```

### Payments (Role-Filtered)
```
GET    /api/payments/               List payments
POST   /api/payments/               Record payment
GET    /api/payments/{id}/          Get payment details
POST   /api/payments/{id}/verify_payment/  Verify (Admin/Staff)
```

### Attendance (Instructor)
```
GET    /api/attendance/             List attendance
POST   /api/attendance/             Mark attendance (Instructor)
GET    /api/attendance/{id}/        Get record
```

See **QUICK_START_GUIDE.md** for 20+ API examples with curl commands.

---

## 🛠️ Tech Stack

### Backend
- **Django 5.2** - Web framework
- **Django REST Framework** - API development
- **SimpleJWT** - JWT authentication
- **SQLite** (dev) / PostgreSQL (prod)
- **Pillow** - Image handling
- **Black** - Code formatting

### Frontend (Upcoming)
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation

### Deployment Ready
- **Gunicorn** - WSGI server
- **Celery** - Task queue (for notifications)
- **Redis** - Cache & message broker

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- pip
- SQLite (included with Python)
- Node.js 16+ (for frontend)

### Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup (Later)
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## 🧪 Testing

### Check System Status
```bash
cd backend
python manage.py check
# Output: System check identified no issues (0 silenced)
```

### Run Django Tests
```bash
python manage.py test api
```

### Test API Manually
See **QUICK_START_GUIDE.md** for curl examples:
- Student registration
- Login and token management
- Course listing
- Enrollment creation
- Payment recording
- Attendance marking

---

## 🔒 Production Checklist

Before deploying to production:

- [ ] Change SECRET_KEY in settings.py
- [ ] Set DEBUG = False
- [ ] Configure ALLOWED_HOSTS
- [ ] Switch to PostgreSQL
- [ ] Setup HTTPS/SSL certificates
- [ ] Configure email backend
- [ ] Setup payment API credentials
- [ ] Configure SMS service credentials
- [ ] Setup error tracking (Sentry)
- [ ] Setup monitoring (Datadog)
- [ ] Configure database backups
- [ ] Setup CI/CD pipeline

---

## 📞 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": { }
}
```

---

## 📊 Database Stats

| Model | Purpose | Records |
|-------|---------|---------|
| User | All users | 1K-10K |
| Course | Courses offered | 10-50 |
| Batch | Course sections | 20-100 |
| Schedule | Class times | 50-500 |
| Enrollment | Registrations | 1K-10K |
| Payment | Payments | 1K-5K |
| Attendance | Attendance records | 10K-100K |
| Notification | Alerts | 10K-50K |
| ActivityLog | Audit trail | 10K-100K |

---

## 🤝 Contributing

This is a learning/commercial project. For questions:
1. Check documentation files
2. Review QUICK_START_GUIDE.md
3. Check DATABASE_SCHEMA.md

---

## 📄 License

Private project for Institute Management

---

## 🎯 Support & Next Steps

1. **Explore the API** - Use curl examples in QUICK_START_GUIDE.md
2. **Create test data** - Use Django admin
3. **Test all permissions** - Verify role-based access
4. **Review architecture** - Read SYSTEM_IMPLEMENTATION_GUIDE.md
5. **Start frontend** - Begin React dashboard development

---

## 📞 Quick Reference

**Backend URL**: http://localhost:8000
**Admin URL**: http://localhost:8000/admin
**API Docs**: Endpoints documented in QUICK_START_GUIDE.md
**Database**: db.sqlite3 (development)

---
