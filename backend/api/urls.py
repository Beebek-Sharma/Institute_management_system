from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'course-categories', views.CourseCategoryViewSet, basename='course_category')
router.register(r'batches', views.BatchViewSet, basename='batch')
router.register(r'schedules', views.ScheduleViewSet, basename='schedule')
router.register(r'enrollments', views.EnrollmentViewSet, basename='enrollment')
router.register(r'payments', views.PaymentViewSet, basename='payment')
router.register(r'attendance', views.AttendanceViewSet, basename='attendance')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'activity-logs', views.ActivityLogViewSet, basename='activity_log')
router.register(r'announcements', views.AnnouncementViewSet, basename='announcement')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.get_profile, name='get_profile'),
    path('auth/profile/update/', views.update_profile, name='update_profile'),
    path('auth/create-admin/', views.create_admin, name='create_admin'),
    
    # Admin user management endpoints
    path('admin/create-staff/', views.create_staff, name='create_staff'),
    path('admin/create-instructor/', views.create_instructor, name='create_instructor'),
    path('admin/create-student/', views.create_student, name='create_student'),
    path('admin/users/', views.get_all_users, name='get_all_users'),
    path('admin/users/<int:user_id>/', views.edit_user_admin, name='edit_user_admin'),
    path('admin/users/<int:user_id>/reset-password/', views.reset_user_password, name='reset_user_password'),
    path('admin/users/<int:user_id>/delete/', views.delete_user_admin, name='delete_user_admin'),
    
    # Include router URLs
    path('', include(router.urls)),
]