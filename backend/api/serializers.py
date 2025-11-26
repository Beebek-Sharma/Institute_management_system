from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, Enrollment, Payment

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'enrollment_date']
        read_only_fields = ['id', 'enrollment_date']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone', 'role']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model"""
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    available_seats = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'description', 'instructor', 'instructor_name',
            'schedule', 'capacity', 'enrolled_count', 'available_seats',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'enrolled_count', 'created_at', 'updated_at']


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for Enrollment model"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'student_name', 'course', 'course_name', 'course_code',
            'status', 'enrollment_date', 'grade'
        ]
        read_only_fields = ['id', 'enrollment_date']
    
    def validate(self, data):
        course = data.get('course')
        if course and course.enrolled_count >= course.capacity:
            raise serializers.ValidationError("Course is full")
        return data


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    student_name = serializers.CharField(source='enrollment.student.get_full_name', read_only=True)
    course_name = serializers.CharField(source='enrollment.course.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'enrollment', 'student_name', 'course_name', 'amount',
            'status', 'payment_date', 'payment_method', 'transaction_id'
        ]
        read_only_fields = ['id', 'payment_date']
