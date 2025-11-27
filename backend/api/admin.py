from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Course, CourseCategory, Batch, Schedule,
    Enrollment, Payment, Attendance, Notification, ActivityLog
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model"""
    list_display = ['username', 'email', 'role', 'first_name', 'last_name', 'is_active', 'enrollment_date']
    list_filter = ['role', 'is_active', 'is_staff', 'enrollment_date']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    readonly_fields = ['created_at', 'updated_at', 'enrollment_date']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Institute Info', {
            'fields': ('role', 'phone', 'date_of_birth', 'address', 'citizenship_number', 'is_active_staff')
        }),
        ('Metadata', {
            'fields': ('enrollment_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Institute Info', {
            'fields': ('role', 'phone', 'date_of_birth', 'address', 'citizenship_number')
        }),
    )


@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    """Admin interface for CourseCategory"""
    list_display = ['name', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Admin interface for Course model"""
    list_display = ['code', 'name', 'instructor', 'duration_weeks', 'fee', 'enrolled_count', 'max_capacity', 'is_active', 'created_at']
    list_filter = ['instructor', 'category', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at', 'enrolled_count']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'code', 'description', 'category', 'is_active')
        }),
        ('Specifications', {
            'fields': ('duration_weeks', 'credits', 'fee')
        }),
        ('Capacity & Enrollment', {
            'fields': ('max_capacity', 'enrolled_count')
        }),
        ('Instructor & Schedule', {
            'fields': ('instructor', 'schedule_description', 'start_date', 'end_date')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    """Admin interface for Batch"""
    list_display = ['batch_number', 'course', 'instructor', 'enrolled_count', 'capacity', 'is_active']
    list_filter = ['course', 'is_active', 'created_at']
    search_fields = ['batch_number', 'course__name']
    readonly_fields = ['created_at', 'enrolled_count']
    
    fieldsets = (
        ('Batch Info', {
            'fields': ('course', 'batch_number', 'is_active')
        }),
        ('Capacity', {
            'fields': ('capacity', 'enrolled_count')
        }),
        ('Instructor & Dates', {
            'fields': ('instructor', 'start_date', 'end_date')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    """Admin interface for Schedule"""
    list_display = ['batch', 'day_of_week', 'start_time', 'end_time', 'room_number', 'building']
    list_filter = ['batch', 'day_of_week']
    search_fields = ['batch__batch_number', 'room_number']
    readonly_fields = ['created_at']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    """Admin interface for Enrollment model"""
    list_display = ['student', 'batch', 'status', 'enrollment_date', 'grade']
    list_filter = ['status', 'batch__course', 'enrollment_date']
    search_fields = ['student__username', 'batch__course__name', 'batch__batch_number']
    readonly_fields = ['enrollment_date']
    
    fieldsets = (
        ('Student & Batch', {
            'fields': ('student', 'batch', 'course')
        }),
        ('Enrollment Status', {
            'fields': ('status', 'grade')
        }),
        ('Metadata', {
            'fields': ('enrollment_date',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin interface for Payment model"""
    list_display = ['get_student', 'get_batch', 'amount', 'status', 'payment_method', 'payment_date']
    list_filter = ['status', 'payment_method', 'payment_date']
    search_fields = ['enrollment__student__username', 'transaction_id', 'receipt_number']
    readonly_fields = ['payment_date', 'verified_date']
    
    fieldsets = (
        ('Enrollment & Amount', {
            'fields': ('enrollment', 'amount')
        }),
        ('Payment Details', {
            'fields': ('status', 'payment_method', 'transaction_id', 'receipt_number')
        }),
        ('Verification', {
            'fields': ('verified_by', 'verified_date', 'notes')
        }),
        ('Metadata', {
            'fields': ('payment_date',),
            'classes': ('collapse',)
        }),
    )
    
    def get_student(self, obj):
        return obj.enrollment.student.username
    get_student.short_description = 'Student'
    
    def get_batch(self, obj):
        return obj.enrollment.batch
    get_batch.short_description = 'Batch'


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    """Admin interface for Attendance"""
    list_display = ['get_student', 'schedule', 'status', 'marked_date', 'marked_by']
    list_filter = ['status', 'marked_date', 'schedule__batch__course']
    search_fields = ['enrollment__student__username', 'schedule__batch__batch_number']
    readonly_fields = ['marked_date']
    
    def get_student(self, obj):
        return obj.enrollment.student.username
    get_student.short_description = 'Student'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin interface for Notifications"""
    list_display = ['user', 'notification_type', 'channel', 'is_read', 'created_at']
    list_filter = ['notification_type', 'channel', 'is_read', 'created_at']
    search_fields = ['user__username', 'title', 'message']
    readonly_fields = ['created_at', 'read_at']
    
    fieldsets = (
        ('Recipient & Type', {
            'fields': ('user', 'notification_type', 'channel')
        }),
        ('Message', {
            'fields': ('title', 'message')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Related', {
            'fields': ('related_enrollment',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    """Admin interface for Activity Logs"""
    list_display = ['user', 'action', 'target_user', 'ip_address', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['user__username', 'target_user__username', 'description', 'ip_address']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Actor & Action', {
            'fields': ('user', 'action', 'description')
        }),
        ('Target', {
            'fields': ('target_user',)
        }),
        ('Request Info', {
            'fields': ('ip_address', 'device_info')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_course(self, obj):
        return obj.enrollment.course.name
    get_course.short_description = 'Course'
