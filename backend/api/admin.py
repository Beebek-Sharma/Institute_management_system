from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Course, Enrollment, Payment


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model"""
    list_display = ['username', 'email', 'role', 'first_name', 'last_name', 'enrollment_date']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'enrollment_date')}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone')}),
    )


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Admin interface for Course model"""
    list_display = ['code', 'name', 'instructor', 'schedule', 'enrolled_count', 'capacity', 'created_at']
    list_filter = ['instructor', 'created_at']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    """Admin interface for Enrollment model"""
    list_display = ['student', 'course', 'status', 'enrollment_date', 'grade']
    list_filter = ['status', 'enrollment_date']
    search_fields = ['student__username', 'course__name', 'course__code']
    readonly_fields = ['enrollment_date']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin interface for Payment model"""
    list_display = ['id', 'get_student', 'get_course', 'amount', 'status', 'payment_date']
    list_filter = ['status', 'payment_date']
    search_fields = ['enrollment__student__username', 'enrollment__course__name', 'transaction_id']
    readonly_fields = ['payment_date']
    
    def get_student(self, obj):
        return obj.enrollment.student.username
    get_student.short_description = 'Student'
    
    def get_course(self, obj):
        return obj.enrollment.course.name
    get_course.short_description = 'Course'
