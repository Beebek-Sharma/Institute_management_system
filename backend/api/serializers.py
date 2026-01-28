from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    User, CourseCategory, Course, Batch, Schedule, Enrollment,
    Payment, Attendance, Notification, ActivityLog, Announcement, Waitlist,
    PaymentPlan, Installment, Scholarship, ScholarshipApplication,
    Assignment, AssignmentSubmission, Exam, ExamResult, StudentProgress, PasswordReset, EmailVerification
)

User = get_user_model()


# ===================== USER SERIALIZERS =====================

class UserSerializer(serializers.ModelSerializer):
    """Base User serializer - fields shown depend on user role"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display',
            'phone', 'date_of_birth', 'address', 'bio', 'profile_picture', 'enrollment_date', 'created_at'
        ]
        read_only_fields = ['id', 'enrollment_date', 'created_at']


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer with sensitive fields (for self & admin only)"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display',
            'phone', 'date_of_birth', 'address', 'bio', 'citizenship_number', 'profile_picture',
            'is_active', 'is_active_staff', 'enrollment_date', 'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'username', 'email', 'role', 'role_display', 'is_active', 'is_active_staff', 'enrollment_date', 'last_login', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration - only students"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'date_of_birth', 'address'
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "Username already exists"})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email already exists"})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(role='student', **validated_data)
        user.set_password(password)
        user.save()
        return user


class UserCreateByStaffSerializer(serializers.ModelSerializer):
    """Serializer for staff/admin to create students or instructors"""
    password = serializers.CharField(write_only=True, min_length=8, required=False)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'phone', 'date_of_birth', 'address', 'citizenship_number', 'role'
        ]
    
    def validate_role(self, value):
        if value not in ['student', 'instructor']:
            raise serializers.ValidationError("Staff can only create students or instructors")
        return value
    
    def create(self, validated_data):
        password = validated_data.pop('password', 'TempPass@123')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


# ===================== COURSE SERIALIZERS =====================

class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = ['id', 'name', 'description', 'created_at']


class CourseSerializer(serializers.ModelSerializer):
    """Course serializer with instructor details"""
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    available_seats = serializers.SerializerMethodField()
    is_full = serializers.BooleanField(read_only=True)
    prerequisites = serializers.SerializerMethodField()
    prerequisite_details = serializers.SerializerMethodField()
    has_prerequisites = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'description', 'image', 'category', 'category_name',
            'instructor', 'instructor_name', 'duration_weeks', 'credits', 'fee',
            'max_capacity', 'enrolled_count', 'available_seats', 'is_full',
            'schedule_description', 'start_date', 'end_date', 'is_active',
            'prerequisites', 'prerequisite_details', 'has_prerequisites', 'prerequisite_enforcement',
            'schedule_conflict_checking',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'enrolled_count', 'created_at', 'updated_at']
    
    def get_available_seats(self, obj):
        return obj.available_seats
    
    def get_prerequisites(self, obj):
        """Get prerequisite course IDs"""
        return [p.id for p in obj.prerequisites.all()]
    
    def get_prerequisite_details(self, obj):
        """Get detailed prerequisite information"""
        return [
            {
                'id': p.id,
                'name': p.name,
                'code': p.code,
                'description': p.description[:100] if p.description else ''
            }
            for p in obj.prerequisites.all()
        ]
    
    def get_has_prerequisites(self, obj):
        """Check if course has prerequisites"""
        return obj.has_prerequisites()


# ===================== BATCH & SCHEDULE SERIALIZERS =====================

class ScheduleSerializer(serializers.ModelSerializer):
    """Class schedule serializer"""
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    batch_info = serializers.CharField(source='batch.__str__', read_only=True)
    course_name = serializers.CharField(source='batch.course.name', read_only=True)
    instructor_name = serializers.CharField(source='batch.instructor.get_full_name', read_only=True)
    
    class Meta:
        model = Schedule
        fields = [
            'id', 'batch', 'batch_info', 'course_name', 'instructor_name', 
            'day_of_week', 'day_display', 'start_time', 'end_time',
            'room_number', 'building', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BatchSerializer(serializers.ModelSerializer):
    """Batch serializer with schedule and enrollment info"""
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    available_seats = serializers.SerializerMethodField()
    schedules = ScheduleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Batch
        fields = [
            'id', 'course', 'course_name', 'course_code', 'batch_number',
            'capacity', 'enrolled_count', 'available_seats', 'instructor', 'instructor_name',
            'start_date', 'end_date', 'is_active', 'schedules', 'created_at'
        ]
        read_only_fields = ['id', 'enrolled_count', 'created_at']
    
    def get_available_seats(self, obj):
        return obj.available_seats


# ===================== ENROLLMENT SERIALIZERS =====================

class EnrollmentListSerializer(serializers.ModelSerializer):
    """Simple enrollment serializer for listing"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    batch_info = serializers.CharField(source='batch.__str__', read_only=True)
    course_name = serializers.CharField(source='batch.course.name', read_only=True)
    course_code = serializers.CharField(source='batch.course.code', read_only=True)
    course = serializers.IntegerField(source='batch.course.id', read_only=True)
    instructor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'batch', 'batch_info',
            'course', 'course_name', 'course_code', 'status', 'enrollment_date', 'grade',
            'instructor_name'
        ]
        read_only_fields = ['id', 'enrollment_date']

    def get_instructor_name(self, obj):
        """Get instructor name from batch or course"""
        # First check batch instructor
        if obj.batch and obj.batch.instructor:
            return obj.batch.instructor.get_full_name()
        # Then check course instructor via batch
        if obj.batch and obj.batch.course and obj.batch.course.instructor:
            return obj.batch.course.instructor.get_full_name()
        # Finally check direct course link
        if obj.course and obj.course.instructor:
            return obj.course.instructor.get_full_name()
        return "Institute Instructor"


class EnrollmentDetailSerializer(serializers.ModelSerializer):
    """Detailed enrollment with batch and course info"""
    student_details = UserSerializer(source='student', read_only=True)
    batch_details = BatchSerializer(source='batch', read_only=True)
    payment_status = serializers.SerializerMethodField()
    attendance_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_details', 'batch', 'batch_details',
            'status', 'enrollment_date', 'grade', 'payment_status', 'attendance_count'
        ]
        read_only_fields = ['id', 'enrollment_date']
    
    def get_payment_status(self, obj):
        """Get latest payment status"""
        latest_payment = obj.payments.order_by('-payment_date').first()
        if latest_payment:
            return {
                'status': latest_payment.status,
                'amount': str(latest_payment.amount),
                'date': latest_payment.payment_date
            }
        return None
    
    def get_attendance_count(self, obj):
        """Get attendance statistics"""
        total = obj.attendance_records.count()
        present = obj.attendance_records.filter(status='present').count()
        return {'total': total, 'present': present}


# ===================== WAITLIST SERIALIZERS =====================

class WaitlistSerializer(serializers.ModelSerializer):
    """Waitlist serializer"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    course_name = serializers.CharField(source='batch.course.name', read_only=True)
    course_code = serializers.CharField(source='batch.course.code', read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    batch_info = serializers.CharField(source='batch.__str__', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Waitlist
        fields = [
            'id', 'student', 'student_name', 'student_username', 'student_email',
            'batch', 'batch_number', 'batch_info', 'course_name', 'course_code',
            'position', 'priority', 'joined_date', 'notified', 'status', 'status_display', 'notes'
        ]
        read_only_fields = ['id', 'position', 'joined_date', 'notified']


class PrerequisiteCheckSerializer(serializers.Serializer):
    """Serializer for checking if student meets prerequisites for a course"""
    course_id = serializers.IntegerField()
    student_id = serializers.IntegerField(required=False)
    
    def validate_course_id(self, value):
        from .models import Course
        if not Course.objects.filter(id=value).exists():
            raise serializers.ValidationError("Course not found")
        return value


# ===================== PAYMENT SERIALIZERS =====================

class PaymentSerializer(serializers.ModelSerializer):
    """Payment serializer"""
    student_name = serializers.CharField(source='enrollment.student.get_full_name', read_only=True)
    course_name = serializers.CharField(source='enrollment.batch.course.name', read_only=True)
    batch_info = serializers.CharField(source='enrollment.batch.__str__', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.get_full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'enrollment', 'student_name', 'course_name', 'batch_info',
            'amount', 'status', 'status_display', 'payment_method', 'method_display',
            'transaction_id', 'receipt_number', 'payment_date', 'verified_date',
            'verified_by', 'verified_by_name', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'payment_date', 'verified_date', 'verified_by', 'created_at']


class PaymentVerifySerializer(serializers.ModelSerializer):
    """Serializer for staff/admin to verify manual payments"""
    class Meta:
        model = Payment
        fields = ['status', 'receipt_number', 'notes']
    
    def validate_status(self, value):
        if value not in ['verified', 'failed', 'refunded']:
            raise serializers.ValidationError("Invalid status for payment verification")
        return value


# ===================== ATTENDANCE SERIALIZERS =====================

class AttendanceSerializer(serializers.ModelSerializer):
    """Attendance serializer"""
    student_name = serializers.CharField(source='enrollment.student.get_full_name', read_only=True)
    instructor_name = serializers.CharField(source='marked_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    course_name = serializers.CharField(source='enrollment.batch.course.name', read_only=True)
    course_id = serializers.IntegerField(source='enrollment.batch.course.id', read_only=True)
    date = serializers.DateTimeField(source='marked_date', read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'enrollment', 'student_name', 'schedule', 'status', 'status_display',
            'marked_date', 'date', 'marked_by', 'instructor_name', 'notes',
            'course_name', 'course_id'
        ]
        read_only_fields = ['id', 'marked_date', 'date']


# ===================== NOTIFICATION SERIALIZERS =====================

class NotificationSerializer(serializers.ModelSerializer):
    """Notification serializer"""
    type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    channel_display = serializers.CharField(source='get_channel_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'type_display', 'channel', 'channel_display',
            'title', 'message', 'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']


# ===================== ACTIVITY LOG SERIALIZERS =====================

class ActivityLogSerializer(serializers.ModelSerializer):
    """Activity log serializer - admin only"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    target_user_name = serializers.CharField(source='target_user.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'action', 'action_display', 'description',
            'target_user', 'target_user_name', 'ip_address', 'device_info', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# ===================== ANNOUNCEMENT SERIALIZERS =====================

class AnnouncementSerializer(serializers.ModelSerializer):
    """Announcement serializer - for admin to create/manage announcements"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    target_audience_display = serializers.CharField(source='get_target_audience_display', read_only=True)
    
    class Meta:
        model = Announcement
        fields = [
            'id', 'title', 'message', 'created_by', 'created_by_name', 'priority', 'priority_display',
            'target_audience', 'target_audience_display', 'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


# ===================== PASSWORD RESET SERIALIZERS =====================

class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting password reset"""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset with token"""
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        return data


# ===================== EMAIL VERIFICATION SERIALIZERS (Coursera-style Auth) =====================

class EmailCheckSerializer(serializers.Serializer):
    """Serializer for checking if email exists"""
    email = serializers.EmailField()


class SendVerificationCodeSerializer(serializers.Serializer):
    """Serializer for sending verification code"""
    email = serializers.EmailField()


class VerifyCodeSerializer(serializers.Serializer):
    """Serializer for verifying email code"""
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)


class CompleteSignupSerializer(serializers.Serializer):
    """Serializer for completing signup after email verification"""
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True, min_length=8, max_length=72)
    verification_token = serializers.CharField(write_only=True)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value
    
    def validate_password(self, value):
        if len(value) < 8 or len(value) > 72:
            raise serializers.ValidationError("Password must be between 8 and 72 characters")
        return value


# ===================== PAYMENT PLAN & SCHOLARSHIP SERIALIZERS =====================

class InstallmentSerializer(serializers.ModelSerializer):
    """Serializer for installments"""
    class Meta:
        model = Installment
        fields = ['id', 'installment_number', 'amount', 'due_date', 'status', 'paid_amount', 'paid_date', 'payment', 'late_fee']
        read_only_fields = ['id', 'late_fee']


class PaymentPlanSerializer(serializers.ModelSerializer):
    """Serializer for payment plans"""
    installments = InstallmentSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source='enrollment.student.get_full_name', read_only=True)
    course_name = serializers.CharField(source='enrollment.batch.course.name', read_only=True)
    
    class Meta:
        model = PaymentPlan
        fields = [
            'id', 'enrollment', 'student_name', 'course_name',
            'total_amount', 'down_payment', 'remaining_amount',
            'number_of_installments', 'installment_amount',
            'status', 'start_date', 'created_at', 'installments'
        ]
        read_only_fields = ['id', 'created_at', 'installments']


class ScholarshipSerializer(serializers.ModelSerializer):
    """Serializer for scholarships"""
    class Meta:
        model = Scholarship
        fields = [
            'id', 'name', 'description', 'amount', 'scholarship_type',
            'percentage', 'eligibility_criteria', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ScholarshipApplicationSerializer(serializers.ModelSerializer):
    """Serializer for scholarship applications"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    scholarship_name = serializers.CharField(source='scholarship.name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = ScholarshipApplication
        fields = [
            'id', 'student', 'student_name', 'scholarship', 'scholarship_name',
            'enrollment', 'status', 'application_reason', 'application_date',
            'reviewed_by', 'reviewed_by_name', 'review_date', 'review_notes'
        ]
        read_only_fields = ['id', 'application_date', 'reviewed_by', 'review_date']


# ===================== PROGRESS TRACKING SERIALIZERS =====================

class AssignmentSerializer(serializers.ModelSerializer):
    """Serializer for assignments"""
    batch_name = serializers.CharField(source='batch.course.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Assignment
        fields = [
            'id', 'batch', 'batch_name', 'title', 'description', 'assignment_type',
            'max_marks', 'weightage', 'due_date', 'allow_late_submission',
            'late_penalty_percent', 'attachment', 'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for assignment submissions"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    graded_by_name = serializers.CharField(source='graded_by.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = [
            'id', 'assignment', 'assignment_title', 'student', 'student_name',
            'submission_file', 'submission_text', 'submitted_at', 'status',
            'marks_obtained', 'feedback', 'graded_by', 'graded_by_name',
            'graded_at', 'is_late', 'late_penalty_applied'
        ]
        read_only_fields = ['id', 'submitted_at', 'graded_by', 'graded_at', 'is_late', 'late_penalty_applied']


class ExamSerializer(serializers.ModelSerializer):
    """Serializer for exams"""
    batch_name = serializers.CharField(source='batch.course.name', read_only=True)
    
    class Meta:
        model = Exam
        fields = [
            'id', 'batch', 'batch_name', 'title', 'description', 'exam_type',
            'max_marks', 'weightage', 'passing_marks', 'exam_date',
            'duration_minutes', 'room', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ExamResultSerializer(serializers.ModelSerializer):
    """Serializer for exam results"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    entered_by_name = serializers.CharField(source='entered_by.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = ExamResult
        fields = [
            'id', 'exam', 'exam_title', 'student', 'student_name',
            'marks_obtained', 'percentage', 'grade', 'status',
            'remarks', 'entered_by', 'entered_by_name', 'entered_at'
        ]
        read_only_fields = ['id', 'percentage', 'grade', 'entered_by', 'entered_at']


class StudentProgressSerializer(serializers.ModelSerializer):
    """Serializer for student progress"""
    student_name = serializers.CharField(source='enrollment.student.get_full_name', read_only=True)
    course_name = serializers.CharField(source='enrollment.batch.course.name', read_only=True)
    batch_number = serializers.CharField(source='enrollment.batch.batch_number', read_only=True)
    
    class Meta:
        model = StudentProgress
        fields = [
            'id', 'enrollment', 'student_name', 'course_name', 'batch_number',
            'assignment_average', 'exam_average', 'attendance_percentage',
            'overall_percentage', 'current_grade', 'gpa',
            'assignments_submitted', 'assignments_total',
            'exams_completed', 'exams_total',
            'is_at_risk', 'risk_factors', 'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']
