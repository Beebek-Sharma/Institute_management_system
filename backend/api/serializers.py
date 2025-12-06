from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Course, Enrollment, Payment, CourseCategory, Batch, Schedule,
    Attendance, Notification, ActivityLog
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
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'description', 'category', 'category_name',
            'instructor', 'instructor_name', 'duration_weeks', 'credits', 'fee',
            'max_capacity', 'enrolled_count', 'available_seats', 'is_full',
            'schedule_description', 'start_date', 'end_date', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'enrolled_count', 'created_at', 'updated_at']
    
    def get_available_seats(self, obj):
        return obj.available_seats


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
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'batch', 'batch_info',
            'course_name', 'course_code', 'status', 'enrollment_date', 'grade'
        ]
        read_only_fields = ['id', 'enrollment_date']


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
