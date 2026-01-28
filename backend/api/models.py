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
    bio = models.TextField(blank=True, null=True, max_length=500)
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
    image = models.ImageField(upload_to='courses/', blank=True, null=True)
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
    
    # Prerequisites
    prerequisites = models.ManyToManyField(
        'self',
        symmetrical=False,
        blank=True,
        related_name='required_for',
        help_text="Courses that must be completed before enrolling in this course"
    )
    
    PREREQUISITE_ENFORCEMENT = [
        ('strict', 'Strict - Must complete all prerequisites'),
        ('soft', 'Soft - Show warning only'),
        ('none', 'None - No enforcement'),
    ]
    prerequisite_enforcement = models.CharField(
        max_length=10,
        choices=PREREQUISITE_ENFORCEMENT,
        default='strict',
        help_text="How strictly to enforce prerequisites"
    )
    
    CONFLICT_CHECKING = [
        ('strict', 'Strict - Block conflicting enrollments'),
        ('warning', 'Warning - Show conflict but allow enrollment'),
        ('none', 'None - No conflict checking'),
    ]
    schedule_conflict_checking = models.CharField(
        max_length=10,
        choices=CONFLICT_CHECKING,
        default='strict',
        help_text="How to handle schedule conflicts"
    )
    
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
    
    def get_prerequisites(self):
        """Get all prerequisite courses"""
        return self.prerequisites.all()
    
    def has_prerequisites(self):
        """Check if course has prerequisites"""
        return self.prerequisites.exists()
    
    def check_prerequisites_met(self, student):
        """
        Check if student has met all prerequisites
        Returns: (bool: all_met, list: missing_prerequisites)
        """
        from .models import Enrollment  # Avoid circular import
        
        if not self.has_prerequisites():
            return True, []
        
        missing_prerequisites = []
        for prereq in self.prerequisites.all():
            # Check if student has completed prerequisite
            enrollment = Enrollment.objects.filter(
                student=student,
                course=prereq,
                status='completed'
            ).first()
            
            if not enrollment:
                missing_prerequisites.append(prereq)
        
        return len(missing_prerequisites) == 0, missing_prerequisites


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
    
    def conflicts_with(self, other_schedule):
        """
        Check if this schedule conflicts with another schedule
        Returns: (bool: has_conflict, str: conflict_description)
        """
        # Check if same day
        if self.day_of_week != other_schedule.day_of_week:
            return False, None
        
        # Check time overlap
        # Schedule A: start_time to end_time
        # Schedule B: other.start_time to other.end_time
        # Conflict if: (A.start < B.end) AND (B.start < A.end)
        
        if (self.start_time < other_schedule.end_time and 
            other_schedule.start_time < self.end_time):
            conflict_msg = (
                f"{self.get_day_of_week_display()} "
                f"{self.start_time.strftime('%H:%M')}-{self.end_time.strftime('%H:%M')} "
                f"conflicts with "
                f"{other_schedule.start_time.strftime('%H:%M')}-{other_schedule.end_time.strftime('%H:%M')}"
            )
            return True, conflict_msg
        
        return False, None
    
    @staticmethod
    def check_schedule_conflicts(student, new_batch):
        """
        Check if enrolling in new_batch would create schedule conflicts for student
        Returns: (bool: has_conflicts, list: conflict_details)
        """
        # Get student's current active enrollments
        active_enrollments = Enrollment.objects.filter(
            student=student,
            status__in=['active', 'pending']
        ).select_related('batch', 'batch__course')
        
        # Get schedules for new batch
        new_schedules = new_batch.schedules.all()
        
        conflicts = []
        for enrollment in active_enrollments:
            existing_schedules = enrollment.batch.schedules.all()
            
            for new_sched in new_schedules:
                for existing_sched in existing_schedules:
                    has_conflict, conflict_msg = new_sched.conflicts_with(existing_sched)
                    if has_conflict:
                        conflicts.append({
                            'existing_course': enrollment.batch.course.name,
                            'existing_course_code': enrollment.batch.course.code,
                            'existing_batch': enrollment.batch.batch_number,
                            'new_course': new_batch.course.name,
                            'new_course_code': new_batch.course.code,
                            'new_batch': new_batch.batch_number,
                            'conflict_description': conflict_msg,
                            'existing_schedule': {
                                'day': existing_sched.get_day_of_week_display(),
                                'start_time': existing_sched.start_time.strftime('%H:%M'),
                                'end_time': existing_sched.end_time.strftime('%H:%M'),
                                'room': existing_sched.room_number,
                                'building': existing_sched.building
                            },
                            'new_schedule': {
                                'day': new_sched.get_day_of_week_display(),
                                'start_time': new_sched.start_time.strftime('%H:%M'),
                                'end_time': new_sched.end_time.strftime('%H:%M'),
                                'room': new_sched.room_number,
                                'building': new_sched.building
                            }
                        })
        
        return len(conflicts) > 0, conflicts


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


class Waitlist(models.Model):
    """Waitlist for full batches - First Come First Served"""
    STATUS_CHOICES = [
        ('waiting', 'Waiting'),
        ('enrolled', 'Enrolled'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='waitlists',
        limit_choices_to={'role': 'student', 'is_active': True}
    )
    batch = models.ForeignKey(
        Batch,
        on_delete=models.CASCADE,
        related_name='waitlist_entries'
    )
    
    position = models.IntegerField(default=0)
    priority = models.IntegerField(default=0, help_text="For future priority-based systems")
    joined_date = models.DateTimeField(auto_now_add=True)
    notified = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'waitlists'
        unique_together = ['student', 'batch']
        ordering = ['position', 'joined_date']
        indexes = [
            models.Index(fields=['batch', 'status']),
            models.Index(fields=['student', 'status']),
            models.Index(fields=['position']),
        ]
    
    def __str__(self):
        return f"{self.student.username} - {self.batch} (Position: {self.position})"
    
    def save(self, *args, **kwargs):
        """Auto-assign position if not set"""
        if not self.position:
            # Get the highest position for this batch
            max_position = Waitlist.objects.filter(
                batch=self.batch,
                status='waiting'
            ).aggregate(models.Max('position'))['position__max']
            self.position = (max_position or 0) + 1
        super().save(*args, **kwargs)


class ImportHistory(models.Model):
    """Track bulk import operations"""
    IMPORT_TYPES = [
        ('student', 'Student Import'),
        ('enrollment', 'Enrollment Import'),
    ]
    
    import_type = models.CharField(max_length=20, choices=IMPORT_TYPES)
    imported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='imports')
    file_name = models.CharField(max_length=255)
    total_rows = models.IntegerField(default=0)
    success_count = models.IntegerField(default=0)
    error_count = models.IntegerField(default=0)
    warning_count = models.IntegerField(default=0)
    import_results = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[('processing', 'Processing'), ('completed', 'Completed'), ('failed', 'Failed')],
        default='processing'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'import_history'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['import_type', 'created_at']),
            models.Index(fields=['imported_by', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_import_type_display()} by {self.imported_by.username if self.imported_by else 'Unknown'} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


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


class PaymentPlan(models.Model):
    """Installment payment plans for enrollments"""
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='payment_plan')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    down_payment = models.DecimalField(max_digits=10, decimal_places=2)
    remaining_amount = models.DecimalField(max_digits=10, decimal_places=2)
    number_of_installments = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(12)])
    installment_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('defaulted', 'Defaulted'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    start_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payment_plans'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment Plan for {self.enrollment.student.username} - {self.number_of_installments} installments"
    
    def calculate_installments(self):
        """Generate installment schedule"""
        from datetime import timedelta
        
        for i in range(1, self.number_of_installments + 1):
            due_date = self.start_date + timedelta(days=30 * i)
            Installment.objects.create(
                payment_plan=self,
                installment_number=i,
                amount=self.installment_amount,
                due_date=due_date
            )
    
    def check_completion(self):
        """Check if all installments are paid"""
        unpaid = self.installments.exclude(status='paid').count()
        if unpaid == 0:
            self.status = 'completed'
            self.save()


class Installment(models.Model):
    """Individual installment in a payment plan"""
    payment_plan = models.ForeignKey(PaymentPlan, on_delete=models.CASCADE, related_name='installments')
    installment_number = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('waived', 'Waived'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_date = models.DateTimeField(null=True, blank=True)
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True)
    late_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'installments'
        ordering = ['installment_number']
        unique_together = ['payment_plan', 'installment_number']
        indexes = [
            models.Index(fields=['payment_plan', 'status']),
            models.Index(fields=['due_date', 'status']),
        ]
    
    def __str__(self):
        return f"Installment #{self.installment_number} - {self.payment_plan.enrollment.student.username}"
    
    def calculate_late_fee(self, penalty_rate=0.05):
        """Calculate late fee for overdue installment"""
        from django.utils import timezone
        
        if self.status != 'overdue':
            return 0
        
        days_overdue = (timezone.now().date() - self.due_date).days
        if days_overdue <= 0:
            return 0
        
        # 5% per month, prorated daily
        from decimal import Decimal
        daily_rate = penalty_rate / 30
        return float(self.amount) * daily_rate * days_overdue


class Scholarship(models.Model):
    """Scholarship and financial aid programs"""
    name = models.CharField(max_length=200)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    TYPE_CHOICES = [
        ('full', 'Full Scholarship'),
        ('partial', 'Partial Scholarship'),
        ('percentage', 'Percentage Discount'),
    ]
    scholarship_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    eligibility_criteria = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'scholarships'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_scholarship_type_display()})"


class ScholarshipApplication(models.Model):
    """Student scholarship applications"""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scholarship_applications')
    scholarship = models.ForeignKey(Scholarship, on_delete=models.CASCADE, related_name='applications')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, null=True, blank=True)
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    application_reason = models.TextField()
    application_date = models.DateTimeField(auto_now_add=True)
    
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_scholarships')
    review_date = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'scholarship_applications'
        ordering = ['-application_date']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['scholarship', 'status']),
        ]
    
    def __str__(self):
        return f"{self.student.username} - {self.scholarship.name} ({self.get_status_display()})"


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


class Announcement(models.Model):
    """Admin announcements for all users"""
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('normal', 'Normal'),
        ('low', 'Low'),
    ]
    
    TARGET_AUDIENCE_CHOICES = [
        ('all', 'All Users'),
        ('students', 'Students Only'),
        ('instructors', 'Instructors Only'),
        ('staff', 'Staff Only'),
    ]
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='announcements_created')
    
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    target_audience = models.CharField(max_length=20, choices=TARGET_AUDIENCE_CHOICES, default='all')
    
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'announcements'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_published', '-created_at']),
        ]
    
    def __str__(self):
        return self.title


class PasswordReset(models.Model):
    """Password reset tokens for email-based password reset"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_resets')
    token = models.CharField(max_length=255, unique=True, db_index=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'password_resets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['user', 'is_used']),
        ]
    
    def __str__(self):
        return f"Password reset for {self.user.username}"
    
    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired


class EmailVerification(models.Model):
    """Email verification codes for new user signup"""
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'email_verifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'is_used']),
            models.Index(fields=['code']),
        ]
    
    def __str__(self):
        return f"Verification code for {self.email}"
    
    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired


# ===================== PROGRESS TRACKING MODELS =====================

class Assignment(models.Model):
    """Course assignments"""
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    TYPE_CHOICES = [
        ('homework', 'Homework'),
        ('project', 'Project'),
        ('quiz', 'Quiz'),
        ('lab', 'Lab Work'),
    ]
    assignment_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    max_marks = models.DecimalField(max_digits=5, decimal_places=2)
    weightage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage weightage in final grade")
    
    due_date = models.DateTimeField()
    allow_late_submission = models.BooleanField(default=False)
    late_penalty_percent = models.DecimalField(max_digits=5, decimal_places=2, default=10)
    
    attachment = models.FileField(upload_to='assignments/', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_assignments')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'assignments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['batch', 'due_date']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.batch}"


class AssignmentSubmission(models.Model):
    """Student assignment submissions"""
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignment_submissions')
    
    submission_file = models.FileField(upload_to='submissions/', null=True, blank=True)
    submission_text = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
        ('returned', 'Returned'),
        ('late', 'Late Submission'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_submissions')
    graded_at = models.DateTimeField(null=True, blank=True)
    
    is_late = models.BooleanField(default=False)
    late_penalty_applied = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    class Meta:
        db_table = 'assignment_submissions'
        ordering = ['-submitted_at']
        unique_together = ['assignment', 'student']
        indexes = [
            models.Index(fields=['assignment', 'status']),
            models.Index(fields=['student', 'status']),
        ]
    
    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"


class Exam(models.Model):
    """Course exams"""
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='exams')
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    TYPE_CHOICES = [
        ('midterm', 'Midterm'),
        ('final', 'Final Exam'),
        ('practical', 'Practical Exam'),
        ('viva', 'Viva/Oral'),
    ]
    exam_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    max_marks = models.DecimalField(max_digits=5, decimal_places=2)
    weightage = models.DecimalField(max_digits=5, decimal_places=2, help_text="Percentage weightage in final grade")
    passing_marks = models.DecimalField(max_digits=5, decimal_places=2)
    
    exam_date = models.DateTimeField()
    duration_minutes = models.IntegerField()
    room = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'exams'
        ordering = ['exam_date']
        indexes = [
            models.Index(fields=['batch', 'exam_date']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.batch}"


class ExamResult(models.Model):
    """Student exam results"""
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='results')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='exam_results')
    
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=5)
    
    STATUS_CHOICES = [
        ('pass', 'Pass'),
        ('fail', 'Fail'),
        ('absent', 'Absent'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    remarks = models.TextField(blank=True)
    entered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='entered_results')
    entered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'exam_results'
        ordering = ['-entered_at']
        unique_together = ['exam', 'student']
        indexes = [
            models.Index(fields=['exam', 'status']),
            models.Index(fields=['student', 'status']),
        ]
    
    def __str__(self):
        return f"{self.student.username} - {self.exam.title}: {self.grade}"


class StudentProgress(models.Model):
    """Overall student progress tracking"""
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name='progress')
    
    # Calculated fields
    assignment_average = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    exam_average = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overall_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    current_grade = models.CharField(max_length=5, blank=True)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    
    # Tracking
    assignments_submitted = models.IntegerField(default=0)
    assignments_total = models.IntegerField(default=0)
    exams_completed = models.IntegerField(default=0)
    exams_total = models.IntegerField(default=0)
    
    # Status
    is_at_risk = models.BooleanField(default=False)
    risk_factors = models.JSONField(default=list, blank=True)
    
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_progress'
        ordering = ['-last_updated']
    
    def __str__(self):
        return f"{self.enrollment.student.username} - {self.enrollment.batch.course.name}: {self.current_grade}"
    
    @staticmethod
    def get_letter_grade(percentage):
        """Convert percentage to letter grade"""
        from decimal import Decimal
        percentage = Decimal(str(percentage))
        
        if percentage >= 90:
            return 'A+'
        elif percentage >= 85:
            return 'A'
        elif percentage >= 80:
            return 'B+'
        elif percentage >= 75:
            return 'B'
        elif percentage >= 70:
            return 'C+'
        elif percentage >= 65:
            return 'C'
        elif percentage >= 60:
            return 'D'
        else:
            return 'F'
    
    @staticmethod
    def get_gpa(percentage):
        """Convert percentage to GPA (4.0 scale)"""
        from decimal import Decimal
        percentage = Decimal(str(percentage))
        
        if percentage >= 90:
            return Decimal('4.00')
        elif percentage >= 85:
            return Decimal('3.70')
        elif percentage >= 80:
            return Decimal('3.30')
        elif percentage >= 75:
            return Decimal('3.00')
        elif percentage >= 70:
            return Decimal('2.70')
        elif percentage >= 65:
            return Decimal('2.30')
        elif percentage >= 60:
            return Decimal('2.00')
        else:
            return Decimal('0.00')
    
    def calculate_overall_grade(self):
        """Calculate overall grade based on weightage"""
        from decimal import Decimal
        
        # Assignment: 30%, Exam: 50%, Attendance: 20%
        overall = (
            (self.assignment_average * Decimal('0.30')) +
            (self.exam_average * Decimal('0.50')) +
            (self.attendance_percentage * Decimal('0.20'))
        )
        self.overall_percentage = overall
        self.current_grade = self.get_letter_grade(overall)
        self.gpa = self.get_gpa(overall)
        self.save()
    
    def check_at_risk(self):
        """Check if student is at risk"""
        risk_factors = []
        
        if self.attendance_percentage < 75:
            risk_factors.append('Low attendance (<75%)')
        
        if self.overall_percentage < 50:
            risk_factors.append('Overall progress below 50%')
        
        if self.assignment_average < 60:
            risk_factors.append('Assignment average below 60%')
        
        if self.exam_average < 60:
            risk_factors.append('Exam average below 60%')
        
        # Check consecutive missed assignments
        recent_submissions = AssignmentSubmission.objects.filter(
            student=self.enrollment.student,
            assignment__batch=self.enrollment.batch
        ).order_by('-assignment__due_date')[:3]
        
        if recent_submissions.count() < 2 and self.assignments_total >= 2:
            risk_factors.append('Missing recent assignments')
        
        self.is_at_risk = len(risk_factors) > 0
        self.risk_factors = risk_factors
        self.save()
        
        return self.is_at_risk
