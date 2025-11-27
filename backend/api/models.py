from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class User(AbstractUser):
    """Custom User model with role-based access control"""
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    citizenship_number = models.CharField(max_length=20, blank=True, null=True, unique=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_active_staff = models.BooleanField(default=True)  # Whether staff/instructor is still active
    enrollment_date = models.DateField(auto_now_add=True)
    last_login_device = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['role', 'is_active']),
            models.Index(fields=['username']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    def is_admin(self):
        return self.role == 'admin'
    
    def is_staff_member(self):
        return self.role == 'staff'
    
    def is_instructor(self):
        return self.role == 'instructor'
    
    def is_student(self):
        return self.role == 'student'


class CourseCategory(models.Model):
    """Course categories for organization"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'course_categories'
        verbose_name_plural = 'Course Categories'
    
    def __str__(self):
        return self.name


class Course(models.Model):
    """Course model for physical institute"""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    category = models.ForeignKey(CourseCategory, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Instructor assignment
    instructor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='taught_courses',
        limit_choices_to={'role': 'instructor', 'is_active': True}
    )
    
    # Course specifications
    duration_weeks = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(52)], default=12)
    credits = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)], default=3)
    fee = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0)
    
    # Batch management
    max_capacity = models.IntegerField(validators=[MinValueValidator(1)], default=30)
    enrolled_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    # Schedule info
    schedule_description = models.CharField(max_length=255, blank=True, help_text="e.g., Monday & Wednesday 2-4 PM")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    @property
    def available_seats(self):
        return self.max_capacity - self.enrolled_count
    
    @property
    def is_full(self):
        return self.enrolled_count >= self.max_capacity


class Batch(models.Model):
    """Batch grouping for courses (physical batches/sections)"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='batches')
    batch_number = models.CharField(max_length=50)  # e.g., "A", "B", "Batch-1"
    capacity = models.IntegerField(validators=[MinValueValidator(1)])
    enrolled_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    instructor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'instructor'}
    )
    
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'batches'
        unique_together = ['course', 'batch_number']
        ordering = ['batch_number']
    
    def __str__(self):
        return f"{self.course.code} - Batch {self.batch_number}"
    
    @property
    def available_seats(self):
        return self.capacity - self.enrolled_count


class Schedule(models.Model):
    """Physical class schedule"""
    DAYS_OF_WEEK = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
        ('SUN', 'Sunday'),
    ]
    
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.CharField(max_length=3, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room_number = models.CharField(max_length=50, blank=True, help_text="e.g., Room 101")
    building = models.CharField(max_length=100, blank=True, help_text="e.g., Main Building")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'schedules'
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        return f"{self.batch} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"


class Enrollment(models.Model):
    """Student course enrollment"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ]
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='enrollments',
        limit_choices_to={'role': 'student', 'is_active': True}
    )
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='enrollments', null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    enrollment_date = models.DateField(auto_now_add=True)
    grade = models.CharField(max_length=5, blank=True, null=True)
    
    # Legacy support for course-level enrollment
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments',
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'enrollments'
        unique_together = ['student', 'batch']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['batch']),
        ]
        ordering = ['-enrollment_date']
    
    def __str__(self):
        return f"{self.student.username} - {self.batch}"


class Payment(models.Model):
    """Payment records - supports multiple payment methods"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('verified', 'Verified'),  # For manual bank/cash payments
    ]
    
    METHOD_CHOICES = [
        ('esewa', 'Esewa'),
        ('khalti', 'Khalti'),
        ('phonepay', 'PhonePay'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash'),
    ]
    
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    
    transaction_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    receipt_number = models.CharField(max_length=50, blank=True, null=True)
    
    payment_date = models.DateTimeField(auto_now_add=True)
    verified_date = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_payments',
        limit_choices_to={'role__in': ['staff', 'admin']}
    )
    
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['enrollment', 'status']),
            models.Index(fields=['transaction_id']),
        ]
    
    def __str__(self):
        return f"{self.enrollment.student.username} - NPR {self.amount} ({self.get_status_display()})"


class Attendance(models.Model):
    """Attendance records for physical classes"""
    ATTENDANCE_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused'),
    ]
    
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='attendance_records')
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='attendance_records')
    
    status = models.CharField(max_length=20, choices=ATTENDANCE_CHOICES)
    marked_date = models.DateTimeField(auto_now_add=True)
    marked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'instructor'}
    )
    
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'attendance'
        unique_together = ['enrollment', 'schedule']
        indexes = [
            models.Index(fields=['enrollment', 'status']),
            models.Index(fields=['marked_date']),
        ]
    
    def __str__(self):
        return f"{self.enrollment.student.username} - {self.get_status_display()}"


class Notification(models.Model):
    """In-app and notification system"""
    NOTIFICATION_TYPES = [
        ('payment_confirmation', 'Payment Confirmation'),
        ('class_timing', 'Class Timing Update'),
        ('announcement', 'Announcement'),
        ('enrollment', 'Enrollment Update'),
        ('attendance', 'Attendance Alert'),
        ('grade', 'Grade Update'),
    ]
    
    CHANNELS = [
        ('in_app', 'In-App'),
        ('email', 'Email'),
        ('sms', 'SMS'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    channel = models.CharField(max_length=20, choices=CHANNELS, default='in_app')
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    related_enrollment = models.ForeignKey(Enrollment, on_delete=models.SET_NULL, null=True, blank=True)
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"


class ActivityLog(models.Model):
    """Audit trail for admin/staff actions"""
    ACTION_TYPES = [
        ('user_create', 'User Created'),
        ('user_update', 'User Updated'),
        ('user_delete', 'User Deleted'),
        ('course_create', 'Course Created'),
        ('course_update', 'Course Updated'),
        ('course_delete', 'Course Deleted'),
        ('enrollment_create', 'Enrollment Created'),
        ('enrollment_delete', 'Enrollment Deleted'),
        ('payment_verify', 'Payment Verified'),
        ('attendance_mark', 'Attendance Marked'),
        ('password_reset', 'Password Reset'),
        ('login', 'Login'),
        ('logout', 'Logout'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='activity_logs_created')
    action = models.CharField(max_length=30, choices=ACTION_TYPES)
    description = models.TextField()
    
    target_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='activity_logs_targeted')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_info = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'activity_logs'
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['action', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.get_action_display()}"
