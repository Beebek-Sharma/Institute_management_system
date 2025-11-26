from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.get_profile, name='get_profile'),
    path('auth/profile/update/', views.update_profile, name='update_profile'),
    
    # Courses
    path('courses/', views.CourseListCreateView.as_view(), name='course_list'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='course_detail'),
    
    # Enrollments
    path('enrollments/', views.EnrollmentListCreateView.as_view(), name='enrollment_list'),
    path('enrollments/<int:pk>/', views.EnrollmentDetailView.as_view(), name='enrollment_detail'),
    
    # Payments
    path('payments/', views.PaymentListCreateView.as_view(), name='payment_list'),
    path('payments/<int:pk>/', views.PaymentDetailView.as_view(), name='payment_detail'),
]