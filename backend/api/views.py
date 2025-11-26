from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Course, Enrollment, Payment
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer,
    CourseSerializer,
    EnrollmentSerializer,
    PaymentSerializer
)

User = get_user_model()


# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user and return JWT tokens"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Please provide both username and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.check_password(password):
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'user': UserSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update current user profile"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Course Views
class CourseListCreateView(generics.ListCreateAPIView):
    """List all courses or create a new course"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        # Only admin, instructor, or staff can create courses
        if self.request.user.role not in ['admin', 'instructor', 'staff']:
            return Response(
                {'error': 'Only admins, instructors, and staff can create courses'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a course"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def perform_update(self, serializer):
        # Only admin, course instructor, or staff can update
        if self.request.user.role not in ['admin', 'instructor', 'staff']:
            return Response(
                {'error': 'Only admins, instructors, and staff can update courses'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only admin can delete
        if self.request.user.role != 'admin':
            return Response(
                {'error': 'Only admins can delete courses'},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.delete()


# Enrollment Views
class EnrollmentListCreateView(generics.ListCreateAPIView):
    """List enrollments or create new enrollment"""
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Enrollment.objects.filter(student=user)
        elif user.role == 'instructor':
            return Enrollment.objects.filter(course__instructor=user)
        elif user.role in ['admin', 'staff']:
            return Enrollment.objects.all()
        return Enrollment.objects.none()
    
    def perform_create(self, serializer):
        # Students can only enroll themselves
        if self.request.user.role == 'student':
            enrollment = serializer.save(student=self.request.user)
            # Update enrolled count
            course = enrollment.course
            course.enrolled_count += 1
            course.save()
        else:
            enrollment = serializer.save()
            course = enrollment.course
            course.enrolled_count += 1
            course.save()


class EnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an enrollment"""
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Enrollment.objects.filter(student=user)
        elif user.role == 'instructor':
            return Enrollment.objects.filter(course__instructor=user)
        elif user.role in ['admin', 'staff']:
            return Enrollment.objects.all()
        return Enrollment.objects.none()


# Payment Views
class PaymentListCreateView(generics.ListCreateAPIView):
    """List payments or create new payment"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Payment.objects.filter(enrollment__student=user)
        elif user.role in ['admin', 'staff']:
            return Payment.objects.all()
        return Payment.objects.none()


class PaymentDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or update a payment"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Payment.objects.filter(enrollment__student=user)
        elif user.role in ['admin', 'staff']:
            return Payment.objects.all()
        return Payment.objects.none()